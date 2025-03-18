import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationService } from '../services/locationService';
import '../App.css';

interface LocationResult {
    id: string;
    name: string;
    formattedName: string;
    mainText: string;
    secondaryText: string;
}

const TripFormComponent: React.FC = () => {
    const [currentLocation, setCurrentLocation] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [dropoffLocation, setDropoffLocation] = useState('');
    const [currentCycleUsed, setCurrentCycleUsed] = useState('');
    
    const [currentSuggestions, setCurrentSuggestions] = useState<LocationResult[]>([]);
    const [pickupSuggestions, setPickupSuggestions] = useState<LocationResult[]>([]);
    const [dropoffSuggestions, setDropoffSuggestions] = useState<LocationResult[]>([]);
    
    const [showCurrentDropdown, setShowCurrentDropdown] = useState(false);
    const [showPickupDropdown, setShowPickupDropdown] = useState(false);
    const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

    const currentInputRef = useRef<HTMLInputElement>(null);
    const pickupInputRef = useRef<HTMLInputElement>(null);
    const dropoffInputRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    const handleInputChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        setLocation: React.Dispatch<React.SetStateAction<string>>,
        setSuggestions: React.Dispatch<React.SetStateAction<LocationResult[]>>,
        setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        const value = e.target.value;
        setLocation(value);
        setShowDropdown(true);

        if (value.length >= 2) {
            const results = await locationService.searchLocations(value);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionSelect = (
        suggestion: LocationResult,
        setLocation: React.Dispatch<React.SetStateAction<string>>,
        setSuggestions: React.Dispatch<React.SetStateAction<LocationResult[]>>,
        setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        setLocation(suggestion.formattedName);
        setSuggestions([]);
        setShowDropdown(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                currentInputRef.current && !currentInputRef.current.contains(event.target as Node) &&
                pickupInputRef.current && !pickupInputRef.current.contains(event.target as Node) &&
                dropoffInputRef.current && !dropoffInputRef.current.contains(event.target as Node)
            ) {
                setShowCurrentDropdown(false);
                setShowPickupDropdown(false);
                setShowDropoffDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/results', {
            state: {
                currentLocation,
                pickupLocation,
                dropoffLocation,
                currentCycle: currentCycleUsed,
            },
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
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label htmlFor="current-location">Current Location</label>
                        <input
                            type="text"
                            id="current-location"
                            ref={currentInputRef}
                            value={currentLocation}
                            onChange={(e) => handleInputChange(
                                e,
                                setCurrentLocation,
                                setCurrentSuggestions,
                                setShowCurrentDropdown
                            )}
                            placeholder="Enter current region"
                            required
                        />
                        {showCurrentDropdown && currentSuggestions.length > 0 && (
                            <ul className="suggestions-dropdown" style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 1000,
                                background: 'white',
                                border: '1px solid #ddd',
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {currentSuggestions.map((suggestion) => (
                                    <li
                                        key={suggestion.id}
                                        onClick={() => handleSuggestionSelect(
                                            suggestion,
                                            setCurrentLocation,
                                            setCurrentSuggestions,
                                            setShowCurrentDropdown
                                        )}
                                        style={{
                                            padding: '8px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #eee'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        {suggestion.formattedName}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label htmlFor="pickup-location">Pickup Location</label>
                        <input
                            type="text"
                            id="pickup-location"
                            ref={pickupInputRef}
                            value={pickupLocation}
                            onChange={(e) => handleInputChange(
                                e,
                                setPickupLocation,
                                setPickupSuggestions,
                                setShowPickupDropdown
                            )}
                            placeholder="Enter pickup region"
                            required
                        />
                        {showPickupDropdown && pickupSuggestions.length > 0 && (
                            <ul className="suggestions-dropdown" style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 1000,
                                background: 'white',
                                border: '1px solid #ddd',
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {pickupSuggestions.map((suggestion) => (
                                    <li
                                        key={suggestion.id}
                                        onClick={() => handleSuggestionSelect(
                                            suggestion,
                                            setPickupLocation,
                                            setPickupSuggestions,
                                            setShowPickupDropdown
                                        )}
                                        style={{
                                            padding: '8px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #eee'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        {suggestion.formattedName}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label htmlFor="dropoff-location">Dropoff Location</label>
                        <input
                            type="text"
                            id="dropoff-location"
                            ref={dropoffInputRef}
                            value={dropoffLocation}
                            onChange={(e) => handleInputChange(
                                e,
                                setDropoffLocation,
                                setDropoffSuggestions,
                                setShowDropoffDropdown
                            )}
                            placeholder="Enter dropoff region"
                            required
                        />
                        {showDropoffDropdown && dropoffSuggestions.length > 0 && (
                            <ul className="suggestions-dropdown" style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 1000,
                                background: 'white',
                                border: '1px solid #ddd',
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {dropoffSuggestions.map((suggestion) => (
                                    <li
                                        key={suggestion.id}
                                        onClick={() => handleSuggestionSelect(
                                            suggestion,
                                            setDropoffLocation,
                                            setDropoffSuggestions,
                                            setShowDropoffDropdown
                                        )}
                                        style={{
                                            padding: '8px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #eee'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        {suggestion.formattedName}
                                    </li>
                                ))}
                            </ul>
                        )}
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
                    <button className="btn" type="submit">
                        Calculate Route
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TripFormComponent;