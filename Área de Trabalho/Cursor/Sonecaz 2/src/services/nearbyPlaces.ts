import { PlaceCategory, Place, PLACE_CATEGORIES, NearbyPlace } from '@/types/places';

// Calcular distância entre duas coordenadas (Haversine)
export const calculateDistance = (
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

// Verificar se um estabelecimento está aberto
const checkIfPlaceIsOpen = (
  place: google.maps.places.PlaceResult,
  category: PlaceCategory
): boolean => {
  if (!place.opening_hours) return true; // Se não há informação, assume aberto
  
  // Para farmácias 24h, verificar se tem "24 horas" no nome ou informações
  if (category === 'pharmacy_24h') {
    const name = (place.name || '').toLowerCase();
    const has24h = name.includes('24') || name.includes('24h') || name.includes('vinte e quatro');
    if (has24h) return true;
  }

  return place.opening_hours.isOpen() || false;
};

// Buscar estabelecimentos próximos usando Places API
export const findNearbyPlaces = async (
  location: [number, number],
  categories: PlaceCategory[],
  radius: number = 2000, // 2km por padrão
  filterOpenOnly: boolean = false
): Promise<Place[]> => {
  if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
    console.error('Google Maps Places API not loaded');
    return [];
  }

  const places: Place[] = [];
  const [lat, lng] = location;

  try {
    for (const category of categories) {
      const categoryConfig = PLACE_CATEGORIES[category];
      if (!categoryConfig) continue;

      // Usar PlacesService para buscar estabelecimentos
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      // Para cada tipo do Google Places, fazer uma busca
      for (const googleType of categoryConfig.googlePlaceType) {
        const request: google.maps.places.PlaceSearchRequest = {
          location: new google.maps.LatLng(lat, lng),
          radius: radius,
          type: googleType as google.maps.places.PlaceType,
          keyword: categoryConfig.keywords.join(' '),
        };

        await new Promise<void>((resolve) => {
          service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              results.forEach((place) => {
                if (place.geometry && place.geometry.location) {
                  const placeLat = place.geometry.location.lat();
                  const placeLng = place.geometry.location.lng();
                  const distance = calculateDistance(lat, lng, placeLat, placeLng);

                  // Filtrar por farmácia 24h se necessário
                  if (category === 'pharmacy_24h') {
                    const name = (place.name || '').toLowerCase();
                    const has24h = name.includes('24') || name.includes('24h') || name.includes('vinte e quatro');
                    if (!has24h) return; // Pular se não for 24h
                  }

                  // Verificar se está aberto se necessário
                  const isOpen = checkIfPlaceIsOpen(place, category);
                  if (filterOpenOnly && !isOpen) return;

                  // Verificar se já existe (evitar duplicatas)
                  const existingIndex = places.findIndex(
                    (p) => p.id === place.place_id
                  );
                  if (existingIndex >= 0) {
                    // Atualizar categoria se necessário
                    if (!places[existingIndex].category || places[existingIndex].category === 'pharmacy') {
                      places[existingIndex].category = category;
                    }
                    return;
                  }

                  places.push({
                    id: place.place_id || `place-${Date.now()}-${Math.random()}`,
                    name: place.name || 'Estabelecimento',
                    address: place.vicinity || place.formatted_address || '',
                    location: [placeLat, placeLng],
                    category: category,
                    distance: distance,
                    rating: place.rating,
                    isOpen: isOpen,
                    phoneNumber: place.formatted_phone_number || place.international_phone_number,
                    website: place.website,
                  });
                }
              });
            } else {
              console.log(`Places API status: ${status} for category ${category}`);
            }
            resolve();
          });
        });
      }
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
  activeCategories: PlaceCategory[],
  alertRadius: number = 500, // 500m
  filterOpenOnly: boolean = true
): Promise<NearbyPlace | null> => {
  if (activeCategories.length === 0) {
    return null;
  }

  const places = await findNearbyPlaces(location, activeCategories, alertRadius, filterOpenOnly);

  if (places.length > 0) {
    // Retornar o estabelecimento mais próximo
    const nearest = places[0];
    return {
      type: nearest.category,
      place: nearest,
    };
  }

  return null;
};

// Obter detalhes completos de um lugar
export const getPlaceDetails = async (
  placeId: string
): Promise<Place | null> => {
  if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
    console.error('Google Maps Places API not loaded');
    return null;
  }

  try {
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    return new Promise<Place | null>((resolve) => {
      service.getDetails(
        {
          placeId: placeId,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'geometry',
            'rating',
            'opening_hours',
            'formatted_phone_number',
            'website',
            'types',
          ],
        },
        (place, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.geometry &&
            place.geometry.location
          ) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // Determinar categoria baseado nos tipos
            let category: PlaceCategory = 'restaurant';
            if (place.types) {
              if (place.types.includes('supermarket') || place.types.includes('grocery_or_supermarket')) {
                category = 'supermarket';
              } else if (place.types.includes('pharmacy') || place.types.includes('drugstore')) {
                const name = (place.name || '').toLowerCase();
                category = name.includes('24') || name.includes('24h') ? 'pharmacy_24h' : 'pharmacy';
              } else if (place.types.includes('gas_station')) {
                category = 'gas_station';
              } else if (place.types.includes('restaurant') || place.types.includes('food')) {
                category = 'restaurant';
              } else if (place.types.includes('cafe') || place.types.includes('bakery')) {
                category = 'cafe';
              } else if (place.types.includes('gym') || place.types.includes('health')) {
                category = 'gym';
              } else if (place.types.includes('bank') || place.types.includes('atm')) {
                category = 'bank';
              }
            }

            resolve({
              id: place.place_id || '',
              name: place.name || 'Estabelecimento',
              address: place.formatted_address || '',
              location: [lat, lng],
              category: category,
              distance: 0, // Não temos distância aqui
              rating: place.rating,
              isOpen: place.opening_hours?.isOpen() || false,
              phoneNumber: place.formatted_phone_number || place.international_phone_number,
              website: place.website,
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};
