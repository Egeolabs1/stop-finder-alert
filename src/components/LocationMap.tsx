import { useCallback, useMemo, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Circle, useJsApiLoader } from '@react-google-maps/api';

// Configuração do Google Maps
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Bibliotecas do Google Maps - deve ser uma constante para evitar recarregamentos
const GOOGLE_MAPS_LIBRARIES: ('geometry' | 'places')[] = ['geometry', 'places'];

// Estilos do mapa
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

const defaultMapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

interface LocationMapProps {
  center: [number, number];
  destination: [number, number] | null;
  radius: number;
  onMapClick: (lat: number, lng: number) => void;
  onLocationUpdate: (lat: number, lng: number) => void;
  searchCenter?: [number, number] | null;
  onMapRef?: (map: google.maps.Map | null) => void;
}

// Ícones personalizados usando SVG
const createCustomIcon = (color: string, isDestination: boolean = false): google.maps.Icon | undefined => {
  try {
    if (typeof google === 'undefined' || !google.maps) {
      return undefined;
    }

    const size = isDestination ? 40 : 32;
    const svg = isDestination
      ? `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
           <path d="M20 0C12.268 0 6 6.268 6 14c0 10.5 14 26 14 26s14-15.5 14-26c0-7.732-6.268-14-14-14z" fill="${color}"/>
           <circle cx="20" cy="14" r="6" fill="white"/>
         </svg>`
      : `<svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
           <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="3"/>
           <circle cx="16" cy="16" r="6" fill="white"/>
         </svg>`;

    return {
      url: `data:image/svg+xml;base64,${btoa(svg)}`,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, isDestination ? size : size / 2),
    };
  } catch (error) {
    console.error('Error creating custom icon:', error);
    return undefined;
  }
};

const LocationMapComponent = ({ 
  center, 
  destination, 
  radius, 
  onMapClick, 
  searchCenter,
  onMapRef 
}: LocationMapProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);

  // Carregar Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Calcular o centro do mapa
  const mapCenter = useMemo(() => {
    if (searchCenter) {
      return { lat: searchCenter[0], lng: searchCenter[1] };
    }
    if (destination) {
      return { lat: destination[0], lng: destination[1] };
    }
    return { lat: center[0], lng: center[1] };
  }, [center, destination, searchCenter]);

  // Atualizar mapa quando searchCenter mudar
  useEffect(() => {
    if (mapRef.current && searchCenter) {
      mapRef.current.setCenter({ lat: searchCenter[0], lng: searchCenter[1] });
      mapRef.current.setZoom(15);
    }
  }, [searchCenter]);

  // Callback quando o mapa é carregado
  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (onMapRef) {
      onMapRef(map);
    }
  }, [onMapRef]);

  // Calcular o zoom do mapa
  const mapZoom = useMemo(() => {
    if (destination) return 15;
    if (searchCenter) return 15;
    return 13;
  }, [destination, searchCenter]);

  // Callback quando o mapa é clicado
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onMapClick(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onMapClick]
  );

  // Criar ícones apenas quando o Google Maps estiver carregado
  const currentLocationIcon = useMemo(() => {
    if (!isLoaded) return undefined;
    return createCustomIcon('#5B9FD8', false);
  }, [isLoaded]);

  const destinationIcon = useMemo(() => {
    if (!isLoaded) return undefined;
    return createCustomIcon('#F36F45', true);
  }, [isLoaded]);

  // Tratar erros de carregamento
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-2xl">
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold">Erro ao carregar o mapa</p>
          <p className="text-sm text-gray-600 mt-2">
            {GOOGLE_MAPS_API_KEY
              ? 'Verifique sua chave de API do Google Maps'
              : 'Configure a variável VITE_GOOGLE_MAPS_API_KEY no arquivo .env'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Obtenha uma chave em: <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a>
          </p>
        </div>
      </div>
    );
  }

  // Mostrar loading enquanto carrega
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando mapa...</p>
          {!GOOGLE_MAPS_API_KEY && (
            <p className="mt-2 text-xs text-yellow-600">
              ⚠️ Chave de API não configurada
            </p>
          )}
        </div>
      </div>
    );
  }

  // Verificar se o Google Maps está disponível
  if (typeof google === 'undefined' || !google.maps) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-2xl">
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold">Google Maps não disponível</p>
          <p className="text-sm text-gray-600 mt-2">
            Recarregue a página ou verifique sua conexão com a internet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={mapZoom}
      options={defaultMapOptions}
      onClick={handleMapClick}
      onLoad={onLoad}
    >
      {/* Marcador da localização atual */}
      {currentLocationIcon && (
        <Marker
          position={{ lat: center[0], lng: center[1] }}
          icon={currentLocationIcon}
          title="Sua localização"
          zIndex={1}
        />
      )}

      {/* Marcador temporário de busca (quando não há destino definido) */}
      {searchCenter && !destination && currentLocationIcon && (
        <Marker
          position={{ lat: searchCenter[0], lng: searchCenter[1] }}
          icon={createCustomIcon('#FFA500', false)}
          title="Localização encontrada - Clique para definir como destino"
          zIndex={1}
        />
      )}

      {/* Marcador e círculo do destino */}
      {destination && destinationIcon && (
        <>
          <Marker
            position={{ lat: destination[0], lng: destination[1] }}
            icon={destinationIcon}
            title="Destino"
            zIndex={2}
          />
          <Circle
            center={{ lat: destination[0], lng: destination[1] }}
            radius={radius}
            options={{
              strokeColor: '#F36F45',
              strokeOpacity: 1,
              strokeWeight: 2,
              fillColor: '#F36F45',
              fillOpacity: 0.15,
              zIndex: 0,
            }}
          />
        </>
      )}
    </GoogleMap>
  );
};

const LocationMap = (props: LocationMapProps) => {
  // Verificar se a chave de API está configurada
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
        <div className="text-center p-6 max-w-md mx-auto">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-yellow-600 dark:text-yellow-400 font-semibold text-lg mb-2">⚠️ Configuração necessária</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Para usar o Google Maps, você precisa configurar uma chave de API.
          </p>
          <div className="text-left bg-white dark:bg-gray-800 p-4 rounded-lg text-xs font-mono mb-4 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 mb-2">1. Crie um arquivo <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code> na raiz do projeto</p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">2. Adicione:</p>
            <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 text-gray-800 dark:text-gray-200">VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui</code>
            <p className="text-gray-700 dark:text-gray-300 mt-3 mb-2">3. Reinicie o servidor de desenvolvimento</p>
          </div>
          <a 
            href="https://console.cloud.google.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline text-sm font-medium"
          >
            Obter chave de API →
          </a>
        </div>
      </div>
    );
  }

  // Garantir que sempre retorne um elemento React válido
  const component = <LocationMapComponent {...props} />;
  if (!component) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gray-100 rounded-2xl">
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold">Erro ao renderizar mapa</p>
        </div>
      </div>
    );
  }
  return component;
};

export default LocationMap;
