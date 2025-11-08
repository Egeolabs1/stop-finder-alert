const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  location: [number, number];
  type: 'supermarket' | 'pharmacy';
  distance: number;
  placeId: string;
  rating?: number;
}

// Calcular distância entre duas coordenadas (Haversine)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Buscar estabelecimentos próximos usando Places API
export const findNearbyPlaces = async (
  location: [number, number],
  types: ('supermarket' | 'pharmacy')[],
  radius: number = 2000 // 2km por padrão
): Promise<NearbyPlace[]> => {
  if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
    console.error('Google Maps Places API not loaded');
    return [];
  }

  const places: NearbyPlace[] = [];
  const [lat, lng] = location;

  try {
    for (const type of types) {
      // Mapear tipos para tipos do Google Places
      const placeType = type === 'supermarket' 
        ? 'supermarket' 
        : 'pharmacy';

      // Usar PlacesService para buscar estabelecimentos
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(lat, lng),
        radius: radius,
        type: placeType,
        keyword: type === 'supermarket' ? 'supermercado' : 'farmácia',
      };

      await new Promise<void>((resolve) => {
        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach((place) => {
              if (place.geometry && place.geometry.location) {
                const placeLat = place.geometry.location.lat();
                const placeLng = place.geometry.location.lng();
                const distance = calculateDistance(lat, lng, placeLat, placeLng);

                places.push({
                  id: place.place_id || `place-${Date.now()}-${Math.random()}`,
                  name: place.name || 'Estabelecimento',
                  address: place.vicinity || place.formatted_address || '',
                  location: [placeLat, placeLng],
                  type: type,
                  distance: distance,
                  placeId: place.place_id || '',
                  rating: place.rating,
                });
              }
            });
          } else {
            console.log(`Places API status: ${status} for type ${type}`);
          }
          resolve();
        });
      });
    }

    // Ordenar por distância
    return places.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error finding nearby places:', error);
    return [];
  }
};

// Verificar se está próximo de estabelecimentos relevantes
export const checkNearbyRelevantPlaces = async (
  location: [number, number],
  hasShoppingItems: boolean,
  hasPharmacyItems: boolean,
  alertRadius: number = 500 // 500m
): Promise<{ type: 'supermarket' | 'pharmacy'; place: NearbyPlace } | null> => {
  if (!hasShoppingItems && !hasPharmacyItems) {
    return null;
  }

  const typesToCheck: ('supermarket' | 'pharmacy')[] = [];
  if (hasShoppingItems) typesToCheck.push('supermarket');
  if (hasPharmacyItems) typesToCheck.push('pharmacy');

  const places = await findNearbyPlaces(location, typesToCheck, alertRadius);

  if (places.length > 0) {
    // Retornar o estabelecimento mais próximo
    const nearest = places[0];
    return {
      type: nearest.type,
      place: nearest,
    };
  }

  return null;
};

