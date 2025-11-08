export type PlaceCategory = 
  | 'supermarket'
  | 'pharmacy'
  | 'gas_station'
  | 'restaurant'
  | 'cafe'
  | 'gym'
  | 'bank'
  | 'pharmacy_24h';

export interface PlaceCategoryConfig {
  id: PlaceCategory;
  name: string;
  icon: string;
  keywords: string[];
  googlePlaceType: string[];
  operatingHours?: {
    [key: string]: { open: string; close: string } | null; // null = fechado no dia
  };
}

export interface Place {
  id: string;
  name: string;
  address: string;
  location: [number, number];
  category: PlaceCategory;
  distance: number;
  rating?: number;
  isOpen?: boolean;
  openingHours?: {
    [key: string]: { open: string; close: string } | null;
  };
  phoneNumber?: string;
  website?: string;
}

export interface NearbyPlace {
  type: PlaceCategory;
  place: Place;
}

export const PLACE_CATEGORIES: Record<PlaceCategory, PlaceCategoryConfig> = {
  supermarket: {
    id: 'supermarket',
    name: 'Supermercado',
    icon: '🛒',
    keywords: ['supermarket', 'grocery', 'supermercado', 'mercado'],
    googlePlaceType: ['supermarket', 'grocery_or_supermarket'],
  },
  pharmacy: {
    id: 'pharmacy',
    name: 'Farmácia',
    icon: '💊',
    keywords: ['pharmacy', 'drugstore', 'farmácia', 'drogaria'],
    googlePlaceType: ['pharmacy', 'drugstore'],
  },
  pharmacy_24h: {
    id: 'pharmacy_24h',
    name: 'Farmácia 24h',
    icon: '🌙💊',
    keywords: ['pharmacy 24h', 'farmácia 24h', 'farmácia 24 horas'],
    googlePlaceType: ['pharmacy'],
  },
  gas_station: {
    id: 'gas_station',
    name: 'Posto de Gasolina',
    icon: '⛽',
    keywords: ['gas station', 'gasoline', 'posto', 'combustível'],
    googlePlaceType: ['gas_station'],
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurante',
    icon: '🍽️',
    keywords: ['restaurant', 'restaurante', 'comida'],
    googlePlaceType: ['restaurant', 'food'],
  },
  cafe: {
    id: 'cafe',
    name: 'Cafeteria',
    icon: '☕',
    keywords: ['cafe', 'coffee', 'cafeteria', 'café'],
    googlePlaceType: ['cafe', 'bakery'],
  },
  gym: {
    id: 'gym',
    name: 'Academia',
    icon: '💪',
    keywords: ['gym', 'fitness', 'academia', 'academia de ginástica'],
    googlePlaceType: ['gym', 'health'],
  },
  bank: {
    id: 'bank',
    name: 'Banco',
    icon: '🏦',
    keywords: ['bank', 'banco', 'banco de brasil', 'banco itau'],
    googlePlaceType: ['bank', 'atm'],
  },
};

export const getCategoryIcon = (category: PlaceCategory): string => {
  return PLACE_CATEGORIES[category]?.icon || '📍';
};

export const getCategoryName = (category: PlaceCategory): string => {
  return PLACE_CATEGORIES[category]?.name || category;
};

