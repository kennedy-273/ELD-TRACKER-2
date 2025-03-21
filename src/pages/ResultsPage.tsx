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
    totalDistance: 'Calculating...',
    drivingTime: 'Calculating...',
    requiredStops: 'Calculating...',
    totalTripTime: 'Calculating...'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter out any undefined or empty locations
  const route = [tripDetails.currentLocation, tripDetails.pickupLocation, tripDetails.dropoffLocation].filter(Boolean);
  const stops = [tripDetails.pickupLocation].filter(Boolean);

  useEffect(() => {
    // Check if we have valid route data from navigation state
    if (!tripDetails.currentLocation || !tripDetails.dropoffLocation) {
      setError('Missing route information. Please return to the previous page.');
      setIsLoading(false);
      return;
    }

    const calculateRouteWithCoordinates = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // If we already have coordinates from the form, use them directly
        const locations = [
          {
            name: tripDetails.currentLocation,
            lat: tripDetails.currentCoordinates?.lat,
            lng: tripDetails.currentCoordinates?.lng
          },
          {
            name: tripDetails.pickupLocation,
            lat: tripDetails.pickupCoordinates?.lat,
            lng: tripDetails.pickupCoordinates?.lng
          },
          {
            name: tripDetails.dropoffLocation,
            lat: tripDetails.dropoffCoordinates?.lat,
            lng: tripDetails.dropoffCoordinates?.lng
          }
        ].filter(loc => loc.name && loc.lat && loc.lng);
       
        // Calculate route using OSRM
        if (locations.length >= 2) {
          const coordsString = locations
            .map(loc => `${loc.lng},${loc.lat}`)
            .join(';');
         
          const routeResponse = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
          );
         
          if (routeResponse.data &&
              routeResponse.data.routes &&
              routeResponse.data.routes[0]) {
           
            // Get distance in meters and duration in seconds
            const distance = routeResponse.data.routes[0].distance; // in meters
            const duration = routeResponse.data.routes[0].duration; // in seconds
           
            // Convert distance from meters to miles
            const distanceMiles = Math.round(distance * 0.000621371);
           
            // Convert duration from seconds to hours and minutes
            const hours = Math.floor(duration / 3600);
            const minutes = Math.round((duration % 3600) / 60);
           
            // Calculate required stops based on FMCSA HOS rules (11-hour driving limit)
            const drivingHours = duration / 3600;
            const requiredStops = Math.max(1, Math.ceil(drivingHours / 11)); // At least one stop
           
            // Calculate total trip time including mandatory rest periods (10 hours per stop)
            const restHours = (requiredStops - 1) * 10; // No rest period for last stop
            const totalTripHours = drivingHours + restHours;
            const days = Math.floor(totalTripHours / 24);
            const remainingHours = Math.round(totalTripHours % 24);

            setRouteDetails({
              totalDistance: `${distanceMiles.toLocaleString()} miles`,
              drivingTime: `${hours}h ${minutes}m`,
              requiredStops: requiredStops.toString(),
              totalTripTime: days > 0
                ? `${days} days, ${remainingHours}h`
                : `${remainingHours}h`
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
          totalTripTime: 'N/A'
        });
      } finally {
        setIsLoading(false);
      }
    };

    calculateRouteWithCoordinates();
  }, [tripDetails]);

  // Handle redirection if no valid state
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
                  <div style={{ textAlign: 'center', fontSize: '16px' }}>
                    {routeDetails.totalDistance}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" title="Driving Time">
                  <div style={{ textAlign: 'center', fontSize: '16px' }}>
                    {routeDetails.drivingTime}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" title="Required Stops">
                  <div style={{ textAlign: 'center', fontSize: '16px' }}>
                    {routeDetails.requiredStops}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" title="Total Trip Time">
                  <div style={{ textAlign: 'center', fontSize: '16px' }}>
                    {routeDetails.totalTripTime}
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Card>
     
      {/* Only render LogSheetComponent if we have valid route data */}
      {tripDetails.currentLocation && tripDetails.dropoffLocation && (
        <LogSheetComponent
          tripDetails={{
            currentLocation: tripDetails.currentLocation,
            pickupLocation: tripDetails.pickupLocation || '',
            dropoffLocation: tripDetails.dropoffLocation,
            currentCycle: tripDetails.currentCycle || 'Not specified',
            currentCoordinates: tripDetails.currentCoordinates,
            pickupCoordinates: tripDetails.pickupCoordinates,
            dropoffCoordinates: tripDetails.dropoffCoordinates
          }}
        />
      )}
    </div>
  );
};

export default ResultsPage;