import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default marker icons for Vite/webpack bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
});

interface NominatimResult {
  lat: string;
  lon: string;
}

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  const params = new URLSearchParams({ format: 'json', q: address, limit: '1' });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'User-Agent': 'Gemeindekalender/1.0 (community-calendar)' },
  });
  if (!res.ok) throw new Error('Geocoding failed');
  const data: NominatimResult[] = await res.json();
  if (!data.length) return null;
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

interface EventMapProps {
  address: string;
  location: string;
}

const linkClass =
  'flex-1 text-center text-xs px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-600 ' +
  'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-500';

export default function EventMap({ address, location }: EventMapProps) {
  const { t } = useTranslation();

  const { data: coords, isLoading, isError } = useQuery({
    queryKey: ['geocode', address],
    queryFn: () => geocodeAddress(address),
    staleTime: Infinity,
    retry: 1,
  });

  const query = encodeURIComponent(`${location}, ${address}`);
  const googleMapsUrl = `https://maps.google.com/?q=${query}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${query}`;

  const mapLinks = (
    <div className="flex gap-2 mt-2">
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label={t('event.map.openAriaGoogle')}
      >
        {t('event.map.openGoogleMaps')}
      </a>
      <a
        href={appleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label={t('event.map.openAriaApple')}
      >
        {t('event.map.openAppleMaps')}
      </a>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-36 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          {t('event.map.loading')}
        </div>
        {mapLinks}
      </div>
    );
  }

  if (isError || !coords) {
    return mapLinks;
  }

  return (
    <div className="space-y-2">
      <div
        className="h-40 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
        aria-label={t('event.map.ariaLabel', { location })}
      >
        <MapContainer
          center={coords}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={coords}>
            <Popup>
              <strong>{location}</strong>
              <br />
              {address}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      {mapLinks}
    </div>
  );
}
