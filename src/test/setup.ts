/**
 * Configuração de testes
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Estender expect com matchers do jest-dom
expect.extend(matchers);

// Limpar após cada teste
afterEach(() => {
  cleanup();
});

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock do Google Maps
global.google = {
  maps: {
    Geocoder: class {},
    places: {
      AutocompleteService: class {},
      PlacesService: class {},
      PlacesServiceStatus: {
        OK: 'OK',
        ZERO_RESULTS: 'ZERO_RESULTS',
      },
    },
    LatLng: class {},
  },
} as any;



