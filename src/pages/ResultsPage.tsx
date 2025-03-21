import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Spin, Alert, Button, Divider } from 'antd';
import MapComponent from '../components/MapComponent';
import LogSheetComponent from '../components/LogSheetComponent';
import axios from 'axios';

const { Title, Text } = Typography;

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
    totalDistance: 'Calculating...', // String for display
    drivingTime: 'Calculating...',   // String for display
    requiredStops: 'Calculating...',
    totalTripTime: 'Calculating...',
  });

  // Add numeric state for passing to LogSheetComponent
  const [numericRouteDetails, setNumericRouteDetails] = useState({
    totalDistance: 0, // Numeric value in miles
    drivingTime: 0,   // Numeric value in hours
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const route = [tripDetails.currentLocation, tripDetails.pickupLocation, tripDetails.dropoffLocation].filter(Boolean);
  const stops = [tripDetails.pickupLocation].filter(Boolean);

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

            const distanceMiles = Math.round(distance * 0.000621371); // Convert to miles
            const drivingHours = duration / 3600; // Convert to hours
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

            // Set numeric values for LogSheetComponent
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

  if (!tripDetails.currentLocation && !isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <Card>
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
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Card title={<Title level={3}>Route Overview</Title>}>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Loading route calculations...</Text>
            </div>
          </div>
        ) : (
          <>
            <MapComponent route={route} stops={stops} />
            <Divider />
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
    </div>
  );
};

export default ResultsPage;