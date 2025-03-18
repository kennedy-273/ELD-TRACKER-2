// import React, { useEffect, useRef } from 'react';

// declare global {
//     interface Window {
//         google: typeof google;
//     }
// }

// interface MapComponentProps {
//     route: string[];
//     stops: string[];
// }

// const MapComponent: React.FC<MapComponentProps> = ({ route, stops }) => {
//     const mapRef = useRef<HTMLDivElement | null>(null);

//     useEffect(() => {
//         if (mapRef.current && window.google) {
//             const map = new window.google.maps.Map(mapRef.current, {
//                 zoom: 4,
//                 center: { lat: 39.8283, lng: -98.5795 }, // Center of US
//             });

//             const directionsService = new window.google.maps.DirectionsService();
//             const directionsRenderer = new window.google.maps.DirectionsRenderer();
//             directionsRenderer.setMap(map);

//             const waypoints = stops.map(stop => ({
//                 location: stop,
//                 stopover: true,
//             }));

//             const request = {
//                 origin: route[0],
//                 destination: route[route.length - 1],
//                 waypoints: waypoints,
//                 travelMode: window.google.maps.TravelMode.DRIVING,
//             };

//             directionsService.route(request, (result, status) => {
//                 if (status === window.google.maps.DirectionsStatus.OK) {
//                     directionsRenderer.setDirections(result);
//                 } else {
//                     console.error('Error fetching directions', result);
//                 }
//             });
//         }
//     }, [route, stops]);

//     return <div className="map-container" ref={mapRef} />;
// };

// export default MapComponent;

import React from 'react';

interface MapComponentProps {
    route: string[];
    stops: string[];
}

const MapComponent: React.FC<MapComponentProps> = ({ route, stops }) => {
    return (
        <div className="map-container">
            <div style={{ 
                height: '400px', 
                width: '100%', 
                backgroundColor: '#e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <p style={{ margin: '10px' }}>Map will display here once API key is added</p>
                <p style={{ margin: '10px' }}>Route: {route.join(' → ')}</p>
                <p style={{ margin: '10px' }}>Stops: {stops.join(', ')}</p>
            </div>
        </div>
    );
};

export default MapComponent;