import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import LogSheetComponent from '../components/LogSheetComponent';


declare global {
    interface Window {
        google: any;
    }
}

const API_KEY = 'AIzaSyAqwX3cvCzumsBqsk6Pa8uuDOxHW2QMum4'; 

const ResultsPage: React.FC = () => {
    const location = useLocation();
    const { currentLocation, pickupLocation, dropoffLocation, currentCycle } = location.state || {};
    
    const [routeDetails, setRouteDetails] = useState({
        totalDistance: 'Calculating...',
        drivingTime: 'Calculating...',
        requiredStops: 'Calculating...',
        totalTripTime: 'Calculating...'
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const route = [currentLocation, pickupLocation, dropoffLocation].filter(Boolean);
    const stops = [pickupLocation].filter(Boolean);

    useEffect(() => {
        const loadGoogleMapsScript = () => {
            if (!window.google?.maps) {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
                script.async = true;
                script.onload = calculateRoute;
                script.onerror = () => setError('Failed to load Google Maps API');
                document.head.appendChild(script);
            } else {
                calculateRoute();
            }
        };

        const calculateRoute = async () => {
            if (!window.google?.maps || route.length < 2) {
                setError('Invalid route data');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const directionsService = new window.google.maps.DirectionsService();
                
                const waypoints = route.slice(1, -1).map((location: string) => ({
                    location,
                    stopover: true
                }));

                const request: google.maps.DirectionsRequest = {
                    origin: route[0],
                    destination: route[route.length - 1],
                    waypoints,
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: google.maps.UnitSystem.IMPERIAL,
                    optimizeWaypoints: true,
                };

                const response = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
                    directionsService.route(request, (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
                        if (status === google.maps.DirectionsStatus.OK) {
                            resolve(result);
                        } else {
                            reject(new Error(`Directions request failed: ${status}`));
                        }
                    });
                });

                // Calculate route details
                const routeLegs = response.routes[0].legs;
                let totalDistance = 0;
                let totalDuration = 0;

                routeLegs.forEach((leg: google.maps.DirectionsLeg) => {
                    totalDistance += leg.distance?.value || 0; // in meters
                    totalDuration += leg.duration?.value || 0; // in seconds
                });

                // Convert distance from meters to miles
                const distanceMiles = Math.round(totalDistance * 0.000621371);
                
                // Convert duration from seconds to hours and minutes
                const hours = Math.floor(totalDuration / 3600);
                const minutes = Math.round((totalDuration % 3600) / 60);
                
                // Calculate required stops based on FMCSA HOS rules (11-hour driving limit)
                const drivingHours = totalDuration / 3600;
                const requiredStops = Math.ceil(drivingHours / 11); // One stop every 11 hours
                
                // Calculate total trip time including mandatory rest periods (10 hours per stop)
                const restHours = requiredStops * 10;
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

        loadGoogleMapsScript();
    }, [currentLocation, pickupLocation, dropoffLocation, route]);

    return (
        <div className="container">
            <div className="card">
                <h2>Route Overview</h2>
                {error && <div className="error" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                {isLoading && <div>Loading route calculations...</div>}
                <MapComponent route={route} stops={stops} />
                <div className="route-info">
                    <div className="info-box">
                        <h3>Total Distance</h3>
                        <p>{routeDetails.totalDistance}</p>
                    </div>
                    <div className="info-box">
                        <h3>Driving Time</h3>
                        <p>{routeDetails.drivingTime}</p>
                    </div>
                    <div className="info-box">
                        <h3>Required Stops</h3>
                        <p>{routeDetails.requiredStops}</p>
                    </div>
                    <div className="info-box">
                        <h3>Total Trip Time</h3>
                        <p>{routeDetails.totalTripTime}</p>
                    </div>
                </div>
            </div>
            <LogSheetComponent 
                tripDetails={{
                    currentLocation,
                    pickupLocation,
                    dropoffLocation,
                    currentCycle
                }}
            />
        </div>
    );
};

export default ResultsPage;