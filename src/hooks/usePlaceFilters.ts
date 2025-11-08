import { useState, useEffect, useCallback } from 'react';
import { PlaceCategory } from '@/types/places';

const STORAGE_KEY = 'sonecaz_place_filters';

export interface PlaceFilterSettings {
  enabledCategories: PlaceCategory[];
  filterOpenOnly: boolean;
  maxDistance: number; // em metros
  alertRadius: number; // em metros
}

const DEFAULT_FILTERS: PlaceFilterSettings = {
  enabledCategories: ['supermarket', 'pharmacy', 'gas_station', 'pharmacy_24h'],
  filterOpenOnly: true,
  maxDistance: 2000,
  alertRadius: 500,
};

export const usePlaceFilters = () => {
  const [filters, setFilters] = useState<PlaceFilterSettings>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar filtros do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFilters({ ...DEFAULT_FILTERS, ...parsed });
      } else {
        setFilters(DEFAULT_FILTERS);
      }
    } catch (error) {
      console.error('Error loading place filters:', error);
      setFilters(DEFAULT_FILTERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar filtros no localStorage
  const updateFilters = useCallback((newFilters: Partial<PlaceFilterSettings>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving place filters:', error);
    }
  }, [filters]);

  // Toggle categoria
  const toggleCategory = useCallback((category: PlaceCategory) => {
    const enabledCategories = filters.enabledCategories.includes(category)
      ? filters.enabledCategories.filter(c => c !== category)
      : [...filters.enabledCategories, category];
    updateFilters({ enabledCategories });
  }, [filters.enabledCategories, updateFilters]);

  // Ativar todas as categorias
  const enableAllCategories = useCallback(() => {
    updateFilters({
      enabledCategories: [
        'supermarket',
        'pharmacy',
        'pharmacy_24h',
        'gas_station',
        'restaurant',
        'cafe',
        'gym',
        'bank',
      ],
    });
  }, [updateFilters]);

  // Desativar todas as categorias
  const disableAllCategories = useCallback(() => {
    updateFilters({ enabledCategories: [] });
  }, [updateFilters]);

  return {
    filters,
    isLoading,
    updateFilters,
    toggleCategory,
    enableAllCategories,
    disableAllCategories,
  };
};

