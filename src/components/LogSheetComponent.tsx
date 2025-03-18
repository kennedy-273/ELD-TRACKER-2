import React from 'react';

interface LogSheetProps {
    tripDetails: {
        currentLocation: string;
        pickupLocation: string;
        dropoffLocation: string;
        currentCycle: string;
    };
}

const LogSheetComponent: React.FC<LogSheetProps> = ({ tripDetails }) => {
    const { currentLocation, pickupLocation, dropoffLocation, currentCycle } = tripDetails;

    return (
        <div className="card">
            <h2>ELD Logs</h2>
            <div className="tab-container">
                <div className="tabs">
                    <div className="tab active">Day 1</div>
                    <div className="tab">Day 2</div>
                    <div className="tab">Day 3</div>
                </div>
                <div className="tab-content active">
                    <div className="log-sheet">
                        <div className="log-header">
                            <div>
                                <h3>Driver's Daily Log</h3>
                                <p>Date: 3/18/2025</p>
                                <p>Driver: John Smith</p>
                                <p>From: {currentLocation}</p>
                            </div>
                            <div>
                                <p>Truck #: TR-1234</p>
                                <p>Carrier: ABC Logistics</p>
                                <p>Main Office: {currentLocation}</p>
                            </div>
                        </div>
                        {/* Add your log grid and other details here */}
                        <div>
                            <h4>Route Details</h4>
                            <p>Pickup: {pickupLocation}</p>
                            <p>Dropoff: {dropoffLocation}</p>
                            <p>Cycle Hours Used: {currentCycle}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogSheetComponent;