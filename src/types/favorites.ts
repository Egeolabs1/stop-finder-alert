export interface FavoriteDestination {
  id: string;
  name: string;
  address: string;
  location: [number, number]; // [lat, lng]
  icon?: 'home' | 'briefcase' | 'map-pin' | 'star' | 'heart' | 'flag';
  color?: string;
  radius?: number; // Raio preferido para este destino
  createdAt: Date;
  updatedAt: Date;
  useCount: number; // Quantas vezes foi usado
  lastUsedAt?: Date;
}

export interface AlarmHistory {
  id: string;
  destinationName: string;
  destinationAddress: string;
  destinationLocation: [number, number];
  startLocation: [number, number];
  radius: number;
  triggeredAt: Date;
  distance: number; // Distância quando foi acionado
  duration?: number; // Duração em minutos (se disponível)
}

export interface SavedRoute {
  id: string;
  name: string;
  startLocation: [number, number];
  endLocation: [number, number];
  waypoints?: [number, number][];
  createdAt: Date;
  updatedAt: Date;
  useCount: number;
}



