import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const TaskFilterMap = ({ center, onLocationSelect }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [markerPos, setMarkerPos] = useState(center);

  const handleMapClick = useCallback((e) => {
    if (e.latLng) {
      const newCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(newCoords);
      onLocationSelect(newCoords);
    }
  }, [onLocationSelect]);

  if (!isLoaded) return <div className="h-[300px] bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100" />;

  return (
    <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '300px' }}
        center={center} 
        zoom={14}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
          ]
        }}
      >
        {markerPos && <Marker position={markerPos} />}
      </GoogleMap>
    </div>
  );
};

export default TaskFilterMap;