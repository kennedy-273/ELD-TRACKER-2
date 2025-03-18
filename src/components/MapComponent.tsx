import React, { useEffect, useRef } from 'react';

interface MapComponentProps {
  route: string[];
  stops: string[];
}

const MapComponent: React.FC<MapComponentProps> = ({ route, stops }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google?.maps || !mapRef.current || route.length < 2) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 8,
      center: { lat: 1.0, lng: 38.0 },
    });

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    const waypoints = route.slice(1, -1).map(location => ({
      location,
      stopover: true,
    }));

    directionsService.route(
      {
        origin: route[0],
        destination: route[route.length - 1],
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  }, [route, stops]);

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
};

export default MapComponent;