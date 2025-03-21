import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import '../App.css'

// Fix for Leaflet marker icons in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different locations
const createCustomIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const startIcon = createCustomIcon('green');
const stopIcon = createCustomIcon('orange');
const endIcon = createCustomIcon('red');

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'start' | 'stop' | 'end';
}

interface MapComponentProps {
  route: string[];
  stops: string[];
}

interface LocationSuggestion {
  id: string;
  name: string;
  formattedName: string;
  mainText: string;
  secondaryText: string;
  lat: number;
  lng: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ route, stops }) => {
  // Set default center to Kenya's coordinates
  const [mapCenter, setMapCenter] = useState<[number, number]>([1.2921, 36.8219]); // Nairobi, Kenya
  const [zoom, setZoom] = useState(6); // Zoom level to show Kenya and surroundings
  const [locations, setLocations] = useState<Location[]>([]);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (route.length < 2) return;
     
      setIsLoading(true);
      setError(null);
     
      try {
        // Add Kenya region bias to the search
        const locationPromises = route.map(async (locationName, index) => {
          const viewbox = '33.8935,4.62,41.8550,-4.68'; // Kenya's bounding box
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&viewbox=${viewbox}&bounded=1&format=json&limit=1&countrycodes=ke,tz,ug,so,et,ss`
          );
         
          if (response.data && response.data.length > 0) {
            // Determine type based on position in route
            let type: 'start' | 'stop' | 'end';
            if (index === 0) type = 'start';
            else if (index === route.length - 1) type = 'end';
            else type = 'stop';
           
            return {
              id: response.data[0].place_id,
              name: locationName,
              lat: parseFloat(response.data[0].lat),
              lng: parseFloat(response.data[0].lon),
              type
            };
          }
          throw new Error(`Location not found: ${locationName}`);
        });
       
        const resolvedLocations = await Promise.all(locationPromises);
        setLocations(resolvedLocations);
       
        // Calculate route using OSRM
        if (resolvedLocations.length >= 2) {
          const coordsString = resolvedLocations
            .map(loc => `${loc.lng},${loc.lat}`)
            .join(';');
         
          const routeResponse = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
          );
         
          if (routeResponse.data &&
              routeResponse.data.routes &&
              routeResponse.data.routes[0] &&
              routeResponse.data.routes[0].geometry &&
              routeResponse.data.routes[0].geometry.coordinates) {
           
            // Convert GeoJSON coordinates [lng, lat] to [lat, lng] for Leaflet
            const coords = routeResponse.data.routes[0].geometry.coordinates.map(
              (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
            );
           
            setRoutePath(coords);
           
            // Calculate bounds for the route
            if (coords.length > 0) {
              let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
             
              coords.forEach(([lat, lng]) => {
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
              });
             
              // Add some padding
              const latPadding = (maxLat - minLat) * 0.1;
              const lngPadding = (maxLng - minLng) * 0.1;
             
              setBounds([
                [minLat - latPadding, minLng - lngPadding],
                [maxLat + latPadding, maxLng + lngPadding]
              ]);
            }
          }
        }
      } catch (err) {
        setError('Failed to calculate route: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
   
    fetchCoordinates();
  }, [route, stops]);

  // Function to get the appropriate icon based on location type
  const getLocationIcon = (type: 'start' | 'stop' | 'end') => {
    switch (type) {
      case 'start': return startIcon;
      case 'stop': return stopIcon;
      case 'end': return endIcon;
      default: return new L.Icon.Default();
    }
  };

  return (
    <div className="map-container" style={{ position: 'relative', height: '400px', width: '100%' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '10px',
          borderRadius: '5px'
        }}>
          Loading map data...
        </div>
      )}
     
      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px'
        }}>
          {error}
        </div>
      )}
     
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenReady={(map) => {
          if (bounds) {
            map.target.fitBounds(bounds);
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
       
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={getLocationIcon(location.type)}
          >
            <Popup>
              <strong>{location.name}</strong><br />
              <span>{location.type.charAt(0).toUpperCase() + location.type.slice(1)} location</span><br />
              Lat: {location.lat.toFixed(6)}<br />
              Lng: {location.lng.toFixed(6)}
            </Popup>
          </Marker>
        ))}
       
        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            color="#0078FF"
            weight={5}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;

// Update the LocationSearchComponent to prioritize Kenya locations
export const LocationSearchComponent: React.FC<{
  label: string;
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  placeholder: string;
}> = ({ label, value, onChange, placeholder }) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      // Add Kenya region bias to the search
      const viewbox = '33.8935,4.62,41.8550,-4.68'; // Kenya's bounding box
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=1&format=json&limit=5&countrycodes=ke,tz,ug,so,et,ss`
      );
     
      if (response.data) {
        const formattedResults: LocationSuggestion[] = response.data.map((item: any) => ({
          id: item.place_id,
          name: item.display_name,
          formattedName: item.display_name,
          mainText: item.display_name.split(',')[0],
          secondaryText: item.display_name.split(',').slice(1).join(',').trim(),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
       
        setSuggestions(formattedResults);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowDropdown(true);
    searchLocations(newValue);
    setError(null); // Clear error when user types
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    onChange(suggestion.formattedName, suggestion.lat, suggestion.lng);
    setSuggestions([]);
    setShowDropdown(false);
    setError(null); // Clear error when a suggestion is selected
  };

  const handleBlur = () => {
    if (value && !suggestions.some(suggestion => suggestion.formattedName === value)) {
      setError('Please select a location from the suggestions to ensure we have coordinates.');
    }
  };

  return (
    <div className="form-group" style={{ position: 'relative' }}>
      <label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>{label}</label>
      <input
        type="text"
        id={label.toLowerCase().replace(/\s+/g, '-')}
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required
      />
      {isSearching && (
        <div style={{ position: 'absolute', right: '10px', top: '50%' }}>
          Loading...
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          color: 'red',
          fontSize: '0.8em',
          marginTop: '5px'
        }}>
          {error}
        </div>
      )}
      {showDropdown && suggestions.length > 0 && (
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
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => handleSuggestionSelect(suggestion)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: 'bold' }}>{suggestion.mainText}</div>
              <div style={{ fontSize: '0.85em', color: '#555' }}>{suggestion.secondaryText}</div>
              <div style={{ fontSize: '0.8em', color: '#888' }}>
                Lat: {suggestion.lat.toFixed(6)}, Lng: {suggestion.lng.toFixed(6)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
