import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const TripFormComponent: React.FC = () => {
    const [currentLocation, setCurrentLocation] = useState('Dallas, TX');
    const [pickupLocation, setPickupLocation] = useState('Houston, TX');
    const [dropoffLocation, setDropoffLocation] = useState('Chicago, IL');
    const [currentCycleUsed, setCurrentCycleUsed] = useState('12');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/results', { 
            state: { 
                currentLocation,
                pickupLocation,
                dropoffLocation,
                currentCycle: currentCycleUsed 
            }
        });
    };

    return (
        <div className="container">
            <header>
                <div className="header-content">
                    <div className="logo">TruckRouter</div>
                </div>
            </header>
            <h1 className="app-title">ELD Route Planner</h1>
            <div className="card">
                <h2>Route Information</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="current-location">Current Location</label>
                        <input
                            type="text"
                            id="current-location"
                            value={currentLocation}
                            onChange={(e) => setCurrentLocation(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="pickup-location">Pickup Location</label>
                        <input
                            type="text"
                            id="pickup-location"
                            value={pickupLocation}
                            onChange={(e) => setPickupLocation(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="dropoff-location">Dropoff Location</label>
                        <input
                            type="text"
                            id="dropoff-location"
                            value={dropoffLocation}
                            onChange={(e) => setDropoffLocation(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cycle-hours">Current Cycle Hours Used</label>
                        <input
                            type="number"
                            id="cycle-hours"
                            value={currentCycleUsed}
                            onChange={(e) => setCurrentCycleUsed(e.target.value)}
                            required
                        />
                    </div>
                    <button className="btn" type="submit">Calculate Route</button>
                </form>
            </div>
        </div>
    );
};

export default TripFormComponent;