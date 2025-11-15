/**
 * Serviço de busca aprimorado com POI, categoria, voz e histórico
 */

import { PlaceCategory, getCategoryName, getCategoryIcon } from '@/types/places';

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: 'address' | 'poi' | 'coordinate';
  category?: PlaceCategory;
  location?: [number, number];
  timestamp: Date;
}

export interface POISearchResult {
  placeId: string;
  name: string;
  address: string;
  location: [number, number];
  category: PlaceCategory;
  rating?: number;
  isOpen?: boolean;
}

const SEARCH_HISTORY_KEY = 'sonecaz_search_history';
const MAX_HISTORY_ITEMS = 50;

/**
 * Salvar item no histórico de buscas
 */
export const saveSearchHistory = (item: Omit<SearchHistoryItem, 'id' | 'timestamp'>): void => {
  try {
    const history = getSearchHistory();
    const newItem: SearchHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    // Remover duplicatas
    const filteredHistory = history.filter(
      (h) => !(h.query === item.query && h.type === item.type)
    );

    // Adicionar novo item no início
    const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

/**
 * Obter histórico de buscas
 */
export const getSearchHistory = (): SearchHistoryItem[] => {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch (error) {
    console.error('Error reading search history:', error);
    return [];
  }
};

/**
 * Limpar histórico de buscas
 */
export const clearSearchHistory = (): void => {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};

/**
 * Remover item específico do histórico
 */
export const removeSearchHistoryItem = (id: string): void => {
  try {
    const history = getSearchHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing search history item:', error);
  }
};

/**
 * Buscar POIs por categoria usando Google Places API
 */
export const searchPOIByCategory = async (
  center: [number, number],
  category: PlaceCategory,
  radius: number = 5000
): Promise<POISearchResult[]> => {
  return new Promise((resolve, reject) => {
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    const placesService = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(center[0], center[1]),
      radius,
      type: mapCategoryToGoogleType(category),
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const pois: POISearchResult[] = results.map((place) => ({
          placeId: place.place_id || '',
          name: place.name || '',
          address: place.vicinity || '',
          location: [
            place.geometry?.location?.lat() || 0,
            place.geometry?.location?.lng() || 0,
          ] as [number, number],
          category,
          rating: place.rating,
          isOpen: place.opening_hours?.isOpen(),
        }));

        resolve(pois);
      } else {
        reject(new Error(`Places API error: ${status}`));
      }
    });
  });
};

/**
 * Buscar por coordenadas (geocoding reverso)
 */
export const searchByCoordinates = async (
  lat: number,
  lng: number
): Promise<{ address: string; location: [number, number] }> => {
  return new Promise((resolve, reject) => {
    if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve({
            address: results[0].formatted_address,
            location: [lat, lng],
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      }
    );
  });
};

/**
 * Mapear categoria para tipo do Google Places
 */
const mapCategoryToGoogleType = (category: PlaceCategory): string => {
  const mapping: Record<PlaceCategory, string> = {
    supermarket: 'supermarket',
    pharmacy: 'pharmacy',
    pharmacy_24h: 'pharmacy',
    gas_station: 'gas_station',
    restaurant: 'restaurant',
    cafe: 'cafe',
    gym: 'gym',
    bank: 'bank',
  };
  return mapping[category] || 'establishment';
};

/**
 * Busca por voz usando Web Speech API
 */
export const startVoiceSearch = (language: string = 'pt-BR'): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    let resolved = false;

    recognition.onresult = (event: any) => {
      if (!resolved) {
        resolved = true;
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Speech recognition error: ${event.error}`));
      }
    };

    recognition.onend = () => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Speech recognition ended without result'));
      }
    };

    try {
      recognition.start();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Verificar se busca por voz está disponível
 */
export const isVoiceSearchAvailable = (): boolean => {
  return (
    'webkitSpeechRecognition' in window ||
    'SpeechRecognition' in window
  );
};
