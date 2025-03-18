import React from 'react';
import { useLocation } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import LogSheetComponent from '../components/LogSheetComponent';

const ResultsPage: React.FC = () => {
    const location = useLocation();
    const { currentLocation, pickupLocation, dropoffLocation, currentCycle } = location.state || {};

    const route = [currentLocation, pickupLocation, dropoffLocation].filter(Boolean);
    const stops = [pickupLocation].filter(Boolean);

    return (
        <div className="container">
            <div className="card">
                <h2>Route Overview</h2>
                <MapComponent route={route} stops={stops} />
                <div className="route-info">
                    <div className="info-box">
                        <h3>Total Distance</h3>
                        <p>1,247 miles</p>
                    </div>
                    <div className="info-box">
                        <h3>Driving Time</h3>
                        <p>19h 30m</p>
                    </div>
                    <div className="info-box">
                        <h3>Required Stops</h3>
                        <p>4</p>
                    </div>
                    <div className="info-box">
                        <h3>Total Trip Time</h3>
                        <p>2 days, 2h</p>
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