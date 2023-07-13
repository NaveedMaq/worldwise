import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './Map.module.css';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { useCities } from '../contexts/CitiesContext';
import { useGeolocation } from '../hooks/useGeolocation';
import Button from './Button';
import { useUrlCoordinates } from '../hooks/useUrlCoordinates';

export default function Map() {
  const { cities } = useCities();
  const [mapPosition, setMapPosition] = useState([40, 0]);
  const navigate = useNavigate();
  const {
    isLoading: isLoadingGeolocation,
    position: positionGeolocation,
    getPosition,
  } = useGeolocation();

  const [mapLat, mapLng] = useUrlCoordinates();

  useEffect(
    function () {
      if (mapLat && mapLng) setMapPosition([mapLat, mapLng]);
    },
    [mapLat, mapLng]
  );

  useEffect(
    function () {
      console.log(positionGeolocation);
      if (positionGeolocation) {
        setMapPosition([positionGeolocation.lat, positionGeolocation.lng]);
        navigate(
          `form?lat=${positionGeolocation.lat}&lng=${positionGeolocation.lng}`
        );
      }
    },
    [positionGeolocation, navigate]
  );

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={mapPosition}
        zoom={8}
        scrollWheelZoom={true}
        className={styles.map}
      >
        {!positionGeolocation && (
          <Button type='position' onClick={getPosition}>
            {isLoadingGeolocation ? 'Loading...' : 'Use Current Position'}
          </Button>
        )}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
        />
        {cities.map((city) => (
          <Marker position={city.position} key={city.id}>
            <Popup>
              <span>{city.emoji}</span>
              <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}
        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}

function ChangeCenter({ position }) {
  const map = useMap();
  map.setView(position);
  return null;
}

function DetectClick() {
  const navigate = useNavigate();
  useMapEvents({
    click: (e) => {
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });
}
