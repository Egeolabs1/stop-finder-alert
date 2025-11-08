import { PlaceCategory } from './places';

export type ListType = 'todo' | 'shopping' | 'places';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface ShoppingItem {
  id: string;
  text: string;
  completed: boolean;
  category?: PlaceCategory | 'other';
  createdAt: Date;
  completedAt?: Date;
}

export interface List {
  id: string;
  type: ListType;
  name: string;
  items: (TodoItem | ShoppingItem)[];
  createdAt: Date;
  updatedAt: Date;
}

// Mantido para compatibilidade
export interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  location: [number, number];
  type: PlaceCategory;
  distance: number;
  placeId?: string;
}
