export type ListType = 'todo' | 'shopping' | 'pharmacy';

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
  category?: 'supermarket' | 'pharmacy' | 'other';
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

export interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  location: [number, number];
  type: 'supermarket' | 'pharmacy';
  distance: number;
  placeId?: string;
}



