import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, Typography, Row, Col, Button, Spin, Layout, Menu, Badge, Empty
} from 'antd';
import { 
  EnvironmentOutlined, ClockCircleOutlined, CarOutlined, TruckOutlined, 
  ShopOutlined, HomeOutlined, HistoryOutlined, PlusOutlined, MenuOutlined,
  UserOutlined, SettingOutlined, LogoutOutlined
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, } from 'recharts';
import './App.css';

// Define TypeScript interfaces
interface Trip {
  id: number;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: number;
  current_lat: number;
  current_lng: number;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  transport_type: 'truck' | 'van' | 'trailer';
  created_at: string;
}

const { Title, Text } = Typography;
const { Header, Content, Footer, Sider } = Layout;

const SavedTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get('https://eld-back-dfyb.onrender.com/api/trips/');
        setTrips(response.data);
        
        // Automatically select the most recent trip
        if (response.data.length > 0) {
          // Sort by created_at date (newest first)
          const sortedTrips = [...response.data].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setSelectedTrip(sortedTrips[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load saved trips. Please try again.');
        setLoading(false);
      }
    };
  
    fetchTrips();
    
    // Handle window resize for responsive design
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getTransportIcon = (type: Trip['transport_type']) => {
    switch (type) {
      case 'truck': return <TruckOutlined />;
      case 'van': return <CarOutlined />;
      case 'trailer': return <ShopOutlined />;
      default: return <TruckOutlined />;
    }
  };

  const renderMap = (trip: Trip | null) => {
    if (!trip) return null;

    const positions: [number, number][] = [
      [trip.current_lat, trip.current_lng],
      [trip.pickup_lat, trip.pickup_lng],
      [trip.dropoff_lat, trip.dropoff_lng],
    ];

    return (
      <MapContainer 
        center={[trip.current_lat, trip.current_lng]} 
        zoom={5} 
        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[trip.current_lat, trip.current_lng]}>
          <Popup>Current: {trip.current_location}</Popup>
        </Marker>
        <Marker position={[trip.pickup_lat, trip.pickup_lng]}>
          <Popup>Pickup: {trip.pickup_location}</Popup>
        </Marker>
        <Marker position={[trip.dropoff_lat, trip.dropoff_lng]}>
          <Popup>Dropoff: {trip.dropoff_location}</Popup>
        </Marker>
        <Polyline positions={positions} pathOptions={{ color: "#1677ff" }} />
      </MapContainer>
    );
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
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
          defaultSelectedKeys={['saved-trips']}
          style={{ borderRight: 0 }}
          items={[
            {
              key: 'dashboard',
              icon: <HomeOutlined />,
              label: 'Dashboard',
              onClick: () => navigate('/')
            },
            {
              key: 'saved-trips',
              icon: <HistoryOutlined />,
              label: 'Saved Trips'
            },
            {
              key: 'new-trip',
              icon: <PlusOutlined />,
              label: 'New Trip',
              onClick: () => navigate('/trip-form')
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: 'Settings'
            },
            {
              key: 'profile',
              icon: <UserOutlined />,
              label: 'Profile'
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              style: { marginTop: 'auto' }
            }
          ]}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? (isMobile ? 0 : 80) : 220, transition: 'all 0.2s' }}>
        {/* Header */}
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
            <Title level={4} style={{ margin: 0 }}>Saved Trips</Title>
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

        {/* Content */}
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <Card 
              style={{ 
                marginBottom: '24px', 
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
              }}
            >
              <Title level={4} style={{ margin: 0 }}>Trip Overview</Title>
              <Text type="secondary">
                Track and manage your logistics routes and hours of service
              </Text>
            </Card>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <Spin size="large" />
                <Text style={{ display: 'block', marginTop: 16 }}>Loading your trips...</Text>
              </div>
            ) : error ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <Text type="danger" style={{ fontSize: 16 }}>{error}</Text>
                  <br />
                  <Button 
                    type="primary" 
                    style={{ marginTop: 16 }}
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              </Card>
            ) : trips.length === 0 ? (
              <Card>
                <Empty
                  description="No saved trips yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button 
                    type="primary" 
                    onClick={() => navigate('/trip-form')}
                  >
                    Plan Your First Trip
                  </Button>
                </Empty>
              </Card>
            ) : (
              <Row gutter={[24, 24]}>
                {/* Trip List */}
                <Col xs={24} md={8}>
                <Card 
                  title="Your Trips" 
                  style={{ 
                    borderRadius: '8px',
                    height: '100%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  extra={<Text type="secondary">{trips.length} trips</Text>}
                >
                  <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '4px' }}>
                    {trips
                      .slice() // Create a shallow copy of the trips array
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by created_at (newest first)
                      .map((trip) => (
                        <Card
                          key={trip.id}
                          style={{ 
                            marginBottom: '16px', 
                            borderRadius: '8px',  
                            cursor: 'pointer',
                            background: selectedTrip?.id === trip.id ? '#f0f7ff' : '#fff',
                            borderLeft: selectedTrip?.id === trip.id ? '3px solid #1677ff' : 'none'
                          }}
                          bodyStyle={{ padding: '16px' }}
                          hoverable
                          onClick={() => setSelectedTrip(trip)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div 
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                background: '#f5f5f5', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: '#1677ff',
                                fontSize: '20px'
                              }}
                            >
                              {getTransportIcon(trip.transport_type)}
                            </div>
                            <div style={{ flex: 1, marginLeft: '12px' }}>
                              <Text strong style={{ display: 'block' }}>
                                {trip.current_location} → {trip.dropoff_location}
                              </Text>
                              <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                {formatDate(trip.created_at)}
                              </Text>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </Card>
                </Col>

                {/* Trip Details and Map */}
                <Col xs={24} md={16}>
                  {selectedTrip ? (
                    <Card 
                      style={{ 
                        borderRadius: '8px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Title level={4} style={{ margin: 0 }}>
                          Trip Details
                        </Title>
                        
                      </div>
                      
                      <Card style={{ marginBottom: '24px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                          <div style={{ minWidth: '200px', flex: 1 }}>
                            <Text type="secondary">Origin</Text>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                              <EnvironmentOutlined style={{ color: '#1677ff', marginRight: '8px' }} />
                              <Text strong>{selectedTrip.current_location}</Text>
                            </div>
                          </div>
                          
                          <div style={{ minWidth: '200px', flex: 1 }}>
                            <Text type="secondary">Pickup</Text>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                              <EnvironmentOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                              <Text strong>{selectedTrip.pickup_location}</Text>
                            </div>
                          </div>
                          
                          <div style={{ minWidth: '200px', flex: 1 }}>
                            <Text type="secondary">Destination</Text>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                              <EnvironmentOutlined style={{ color: '#f5222d', marginRight: '8px' }} />
                              <Text strong>{selectedTrip.dropoff_location}</Text>
                            </div>
                          </div>
                          
                          <div style={{ minWidth: '200px', flex: 1 }}>
                            <Text type="secondary">Transport</Text>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                              {getTransportIcon(selectedTrip.transport_type)}
                              <Text strong style={{ marginLeft: '8px', textTransform: 'capitalize' }}>
                                {selectedTrip.transport_type}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Map */}
                      <div style={{ marginBottom: '24px' }}>
                        {renderMap(selectedTrip)}
                      </div>

                      {/* Trip Details and HOS */}
                      <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                          <Card title="Coordinates" style={{ borderRadius: '8px' }}>
                            <Row gutter={[16, 16]}>
                              <Col span={8}>
                                <Text type="secondary">Current</Text>
                                <br />
                                <Text>{selectedTrip.current_lat.toFixed(5)}, {selectedTrip.current_lng.toFixed(5)}</Text>
                              </Col>
                              <Col span={8}>
                                <Text type="secondary">Pickup</Text>
                                <br />
                                <Text>{selectedTrip.pickup_lat.toFixed(5)}, {selectedTrip.pickup_lng.toFixed(5)}</Text>
                              </Col>
                              <Col span={8}>
                                <Text type="secondary">Dropoff</Text>
                                <br />
                                <Text>{selectedTrip.dropoff_lat.toFixed(5)}, {selectedTrip.dropoff_lng.toFixed(5)}</Text>
                              </Col>
                            </Row>
                          </Card>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Card 
                            title={
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                                <span>Hours of Service</span>
                              </div>
                            } 
                            style={{ borderRadius: '8px' }}
                          >
                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                              <div style={{ fontSize: '32px', fontWeight: 'bold', color: selectedTrip.current_cycle_used > 60 ? '#ff4d4f' : '#1677ff' }}>
                                {selectedTrip.current_cycle_used}
                                <span style={{ fontSize: '16px', fontWeight: 'normal', marginLeft: '4px' }}>/ 70 hrs</span>
                              </div>
                              <Text type="secondary">Cycle Hours Used</Text>
                            </div>
                            
                            {/* HOS Chart */}
                            <LineChart 
                              width={isMobile ? 300 : 400} 
                              height={150} 
                              data={[
                                { name: 'Start', hours: 0 },
                                { name: 'Current', hours: selectedTrip.current_cycle_used },
                                { name: 'Limit', hours: 70 },
                              ]}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="hours" 
                                stroke="#1677ff" 
                                strokeWidth={2}
                                dot={{ strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </Card>
                        </Col>
                      </Row>
                    </Card>
                  ) : (
                    <Card style={{ borderRadius: '8px', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Empty 
                        description="Select a trip to view details" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </Card>
                  )}
                </Col>
              </Row>
            )}
          </div>
        </Content>

        {/* Footer */}
        <Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary">TruckLogger ELD Route Planner © {new Date().getFullYear()} | All Rights Reserved</Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default SavedTrips;