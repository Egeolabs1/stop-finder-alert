import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with Leaflet + Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationMapProps {
  center: [number, number];
  destination: [number, number] | null;
  radius: number;
  onMapClick: (lat: number, lng: number) => void;
  onLocationUpdate: (lat: number, lng: number) => void;
}

const LocationMap = ({ center, destination, radius, onMapClick }: LocationMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Custom icons
  const currentLocationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#5B9FD8" stroke="white" stroke-width="3"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const destinationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C12.268 0 6 6.268 6 14c0 10.5 14 26 14 26s14-15.5 14-26c0-7.732-6.268-14-14-14z" fill="#F36F45"/>
        <circle cx="20" cy="14" r="6" fill="white"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // Add current location marker
    currentMarkerRef.current = L.marker(center, { icon: currentLocationIcon }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update current location marker
  useEffect(() => {
    if (currentMarkerRef.current) {
      currentMarkerRef.current.setLatLng(center);
      if (mapRef.current && !destination) {
        mapRef.current.setView(center);
      }
    }
  }, [center, destination]);

  // Update destination marker and circle
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing destination marker and circle
    if (destinationMarkerRef.current) {
      mapRef.current.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
    }
    if (circleRef.current) {
      mapRef.current.removeLayer(circleRef.current);
      circleRef.current = null;
    }

    // Add new destination marker and circle
    if (destination) {
      destinationMarkerRef.current = L.marker(destination, { icon: destinationIcon }).addTo(mapRef.current);
      
      circleRef.current = L.circle(destination, {
        radius: radius,
        color: '#F36F45',
        fillColor: '#F36F45',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(mapRef.current);

      // Pan to destination
      mapRef.current.setView(destination, mapRef.current.getZoom());
    }
  }, [destination, radius, destinationIcon]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        height: '100%', 
        width: '100%', 
        borderRadius: '1rem',
        position: 'relative',
        zIndex: 0,
      }} 
    />
  );
};

export default LocationMap;
