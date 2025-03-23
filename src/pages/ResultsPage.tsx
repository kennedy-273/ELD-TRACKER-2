import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Card, Row, Col, Typography, Spin, Alert, Button, 
  Layout, Menu, Badge
} from 'antd';
import { 
  MenuOutlined, HomeOutlined, HistoryOutlined, PlusOutlined,
  UserOutlined, SettingOutlined, LogoutOutlined, TruckOutlined,

} from '@ant-design/icons';
import MapComponent from '../components/MapComponent';
import LogSheetComponent from '../components/LogSheetComponent';
import axios from 'axios';

const { Title, Text } = Typography;
const { Header, Content, Footer, Sider } = Layout;

interface TripDetails {
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
  currentCycle: string;
  currentCoordinates?: { lat: number; lng: number };
  pickupCoordinates?: { lat: number; lng: number };
  dropoffCoordinates?: { lat: number; lng: number };
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tripDetails = location.state as TripDetails || {};

  const [routeDetails, setRouteDetails] = useState({
    totalDistance: 'Calculating...',
    drivingTime: 'Calculating...',
    requiredStops: 'Calculating...',
    totalTripTime: 'Calculating...',
  });

  const [numericRouteDetails, setNumericRouteDetails] = useState({
    totalDistance: 0,
    drivingTime: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const route = [tripDetails.currentLocation, tripDetails.pickupLocation, tripDetails.dropoffLocation].filter(Boolean);
  const stops = [tripDetails.pickupLocation].filter(Boolean);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!tripDetails.currentLocation || !tripDetails.dropoffLocation) {
      setError('Missing route information. Please return to the previous page.');
      setIsLoading(false);
      return;
    }

    const calculateRouteWithCoordinates = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const locations = [
          { name: tripDetails.currentLocation, lat: tripDetails.currentCoordinates?.lat, lng: tripDetails.currentCoordinates?.lng },
          { name: tripDetails.pickupLocation, lat: tripDetails.pickupCoordinates?.lat, lng: tripDetails.pickupCoordinates?.lng },
          { name: tripDetails.dropoffLocation, lat: tripDetails.dropoffCoordinates?.lat, lng: tripDetails.dropoffCoordinates?.lng },
        ].filter(loc => loc.name && loc.lat && loc.lng);

        if (locations.length >= 2) {
          const coordsString = locations.map(loc => `${loc.lng},${loc.lat}`).join(';');
          const routeResponse = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
          );

          if (routeResponse.data && routeResponse.data.routes && routeResponse.data.routes[0]) {
            const distance = routeResponse.data.routes[0].distance; // in meters
            const duration = routeResponse.data.routes[0].duration; // in seconds

            const distanceMiles = Math.round(distance * 0.000621371);
            const drivingHours = duration / 3600;
            const hours = Math.floor(drivingHours);
            const minutes = Math.round((drivingHours - hours) * 60);

            const requiredStops = Math.max(1, Math.ceil(drivingHours / 11));
            const restHours = (requiredStops - 1) * 10;
            const totalTripHours = drivingHours + restHours;
            const days = Math.floor(totalTripHours / 24);
            const remainingHours = Math.round(totalTripHours % 24);

            setRouteDetails({
              totalDistance: `${distanceMiles.toLocaleString()} miles`,
              drivingTime: `${hours}h ${minutes}m`,
              requiredStops: requiredStops.toString(),
              totalTripTime: days > 0 ? `${days} days, ${remainingHours}h` : `${remainingHours}h`,
            });

            setNumericRouteDetails({
              totalDistance: distanceMiles,
              drivingTime: drivingHours,
            });
          } else {
            throw new Error('Failed to calculate route: Invalid response from routing service');
          }
        } else {
          throw new Error('At least two valid locations are required for route calculation');
        }
      } catch (err) {
        setError('Failed to calculate route: ' + (err instanceof Error ? err.message : 'Unknown error'));
        setRouteDetails({
          totalDistance: 'N/A',
          drivingTime: 'N/A',
          requiredStops: 'N/A',
          totalTripTime: 'N/A',
        });
        setNumericRouteDetails({ totalDistance: 0, drivingTime: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    calculateRouteWithCoordinates();
  }, [tripDetails]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          zIndex: 10
        }}
        width={220}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '16px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {!collapsed && (
            <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
              <TruckOutlined style={{ marginRight: 8 }} />
              TruckLogger
            </Title>
          )}
          {collapsed && !isMobile && <TruckOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['results']}
          style={{ borderRight: 0 }}
          items={[
            { key: 'dashboard', icon: <HomeOutlined />, label: 'Dashboard', onClick: () => navigate('/') },
            { key: 'saved-trips', icon: <HistoryOutlined />, label: 'Saved Trips', onClick: () => navigate('/saved-trips') },
            { key: 'new-trip', icon: <PlusOutlined />, label: 'New Trip', onClick: () => navigate('/trip-form') },
            { key: 'results', icon: <HistoryOutlined />, label: 'Trip Results' },
            // { key: 'log-sheet', icon: <FileTextOutlined />, label: 'Log Sheet', onClick: () => navigate('/log-sheet') }, 
            { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
            { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', style: { marginTop: 'auto' } }
          ]}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? (isMobile ? 0 : 80) : 220, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <Button 
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ marginRight: 16 }}
              />
            )}
            <Title level={4} style={{ margin: 0 }}>Trip Results</Title>
          </div>
          <div>
            <Badge count={5} style={{ marginRight: 24 }}>
              <Button type="text" icon={<UserOutlined />} />
            </Badge>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/trip-form')}
            >
              {!isMobile && 'New Trip'}
            </Button>
          </div>
        </Header>

        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {!tripDetails.currentLocation && !isLoading ? (
              <Card 
                style={{ 
                  borderRadius: '8px', 
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
                }}
              >
                <Alert
                  message="Invalid Route"
                  description="No route information available. Please return to the route planning page."
                  type="error"
                  showIcon
                />
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <Button type="primary" onClick={() => navigate('/')}>
                    Back to Route Planning
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {/* Map at the Top */}
                <Card 
                  style={{ 
                    marginBottom: '24px', 
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
                  }}
                >
                  {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Spin size="large" />
                      <Text style={{ display: 'block', marginTop: 16 }}>Loading route map...</Text>
                    </div>
                  ) : (
                    <>
                      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />}
                      <MapComponent route={route} stops={stops} />
                    </>
                  )}
                </Card>

                {/* Route Overview */}
                <Card 
                  title={<Title level={3}>Route Overview</Title>}
                  style={{ 
                    marginBottom: '24px', 
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
                  }}
                >
                  {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Spin size="large" />
                      <Text style={{ display: 'block', marginTop: 16 }}>Loading route calculations...</Text>
                    </div>
                  ) : (
                    <>
                      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />}
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                          <Card size="small" title="Total Distance">
                            <div style={{ textAlign: 'center', fontSize: '16px' }}>{routeDetails.totalDistance}</div>
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Card size="small" title="Driving Time">
                            <div style={{ textAlign: 'center', fontSize: '16px' }}>{routeDetails.drivingTime}</div>
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Card size="small" title="Required Stops">
                            <div style={{ textAlign: 'center', fontSize: '16px' }}>{routeDetails.requiredStops}</div>
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Card size="small" title="Total Trip Time">
                            <div style={{ textAlign: 'center', fontSize: '16px' }}>{routeDetails.totalTripTime}</div>
                          </Card>
                        </Col>
                      </Row>
                    </>
                  )}
                </Card>

                {/* Log Sheet */}
                {tripDetails.currentLocation && tripDetails.dropoffLocation && (
                  <LogSheetComponent
                    tripDetails={{
                      currentLocation: tripDetails.currentLocation,
                      pickupLocation: tripDetails.pickupLocation || '',
                      dropoffLocation: tripDetails.dropoffLocation,
                      currentCycle: tripDetails.currentCycle || 'Not specified',
                      currentCoordinates: tripDetails.currentCoordinates,
                      pickupCoordinates: tripDetails.pickupCoordinates,
                      dropoffCoordinates: tripDetails.dropoffCoordinates,
                      totalDistance: numericRouteDetails.totalDistance,
                      drivingTime: numericRouteDetails.drivingTime,
                    }}
                  />
                )}
              </>
            )}
          </div>
        </Content>

        <Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary">TruckLogger ELD Route Planner © {new Date().getFullYear()} | All Rights Reserved</Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default ResultsPage;