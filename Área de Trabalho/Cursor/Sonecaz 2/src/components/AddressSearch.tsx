import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface AddressSearchProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onDestinationSelect?: (lat: number, lng: number, address: string) => void;
  disabled?: boolean;
  mapCenter?: [number, number];
  onMapCenterChange?: (lat: number, lng: number) => void;
}

const AddressSearch = ({ 
  onLocationSelect,
  onDestinationSelect,
  disabled = false,
  mapCenter,
  onMapCenterChange 
}: AddressSearchProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Verificar se Google Maps já está carregado (será carregado pelo LocationMap)
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        setIsLoaded(true);
      } else {
        // Tentar novamente após um tempo
        setTimeout(checkGoogleMaps, 100);
      }
    };
    
    checkGoogleMaps();
  }, []);

  // Inicializar serviços do Google Maps
  useEffect(() => {
    if (isLoaded && typeof google !== 'undefined' && google.maps) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
      
      // Criar um div oculto para o PlacesService
      const div = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(div);
    }
  }, [isLoaded]);

  // Buscar sugestões de endereços
  const searchAddresses = useCallback(
    (query: string) => {
      if (!query.trim() || !autocompleteServiceRef.current) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'br' }, // Restringir ao Brasil
        },
        (predictions, status) => {
          setIsSearching(false);

          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    },
    []
  );

  // Debounce para busca - só buscar após o usuário parar de digitar
  useEffect(() => {
    // Limpar sugestões imediatamente se o campo estiver vazio
    if (!searchValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Aguardar pelo menos 3 caracteres antes de buscar
    if (searchValue.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce aumentado para 600ms para dar tempo do usuário digitar
    const timer = setTimeout(() => {
      if (searchValue.trim().length >= 3) {
        searchAddresses(searchValue);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchValue, searchAddresses]);

  // Buscar detalhes do lugar selecionado
  const getPlaceDetails = useCallback(
    (placeId: string, description: string) => {
      if (!placesServiceRef.current) {
        // Fallback: usar Geocoder
        if (geocoderRef.current) {
          geocoderRef.current.geocode(
            { address: description },
            (results, status) => {
              if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                
                onLocationSelect(lat, lng, description);
                if (onMapCenterChange) {
                  onMapCenterChange(lat, lng);
                }
                
                setSearchValue(description);
                setShowSuggestions(false);
                toast.success('Endereço encontrado! Clique no mapa para definir o destino.');
              } else {
                toast.error('Erro ao buscar endereço. Tente novamente.');
              }
            }
          );
        }
        return;
      }

      placesServiceRef.current.getDetails(
        {
          placeId: placeId,
          fields: ['geometry', 'formatted_address', 'name'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
            const location = place.geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            
            const address = place.formatted_address || place.name || description;
            onLocationSelect(lat, lng, address);
            if (onMapCenterChange) {
              onMapCenterChange(lat, lng);
            }
            
            setSearchValue(address);
            setShowSuggestions(false);
            toast.success('Endereço encontrado! Clique no mapa para definir o destino.');
          } else {
            toast.error('Erro ao buscar endereço. Tente novamente.');
          }
        }
      );
    },
    [onLocationSelect, onMapCenterChange]
  );

  // Lidar com seleção de sugestão
  const handleSuggestionClick = (prediction: google.maps.places.AutocompletePrediction, setAsDestination: boolean = false, event?: React.MouseEvent) => {
    // Prevenir que o evento de blur do input interfira
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Manter o foco no input temporariamente para evitar problemas
    inputRef.current?.focus();
    
    if (setAsDestination && onDestinationSelect) {
      // Buscar detalhes e definir como destino diretamente
      getPlaceDetailsForDestination(prediction.place_id, prediction.description);
    } else {
      // Apenas centralizar no mapa
      getPlaceDetails(prediction.place_id, prediction.description);
    }
    
    // Fechar sugestões após um pequeno delay
    setTimeout(() => {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }, 100);
  };

  // Buscar detalhes e definir como destino
  const getPlaceDetailsForDestination = useCallback(
    (placeId: string, description: string) => {
      if (!placesServiceRef.current) {
        // Fallback: usar Geocoder
        if (geocoderRef.current && onDestinationSelect) {
          geocoderRef.current.geocode(
            { address: description },
            (results, status) => {
              if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                const address = results[0].formatted_address || description;
                
                onDestinationSelect(lat, lng, address);
                if (onMapCenterChange) {
                  onMapCenterChange(lat, lng);
                }
                
                setSearchValue(address);
                setShowSuggestions(false);
                toast.success('Destino definido com sucesso!');
              } else {
                toast.error('Erro ao buscar endereço. Tente novamente.');
              }
            }
          );
        }
        return;
      }

      if (!onDestinationSelect) return;

      placesServiceRef.current.getDetails(
        {
          placeId: placeId,
          fields: ['geometry', 'formatted_address', 'name'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
            const location = place.geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            const address = place.formatted_address || place.name || description;
            
            onDestinationSelect(lat, lng, address);
            if (onMapCenterChange) {
              onMapCenterChange(lat, lng);
            }
            
            setSearchValue(address);
            setShowSuggestions(false);
            toast.success('Destino definido com sucesso!');
          } else {
            toast.error('Erro ao buscar endereço. Tente novamente.');
          }
        }
      );
    },
    [onDestinationSelect, onMapCenterChange]
  );

  // Limpar busca
  const handleClear = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSearchValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    // Manter o foco no input após limpar
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Buscar usando Geocoding (fallback)
  const handleSearch = () => {
    if (!searchValue.trim()) {
      toast.error('Digite um endereço para buscar');
      return;
    }

    if (!geocoderRef.current) {
      toast.error('Serviço de busca não disponível');
      return;
    }

    setIsSearching(true);
    geocoderRef.current.geocode(
      { address: searchValue },
      (results, status) => {
        setIsSearching(false);
        
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          const address = results[0].formatted_address || searchValue;
          
          onLocationSelect(lat, lng, address);
          if (onMapCenterChange) {
            onMapCenterChange(lat, lng);
          }
          
          setSearchValue(address);
          toast.success('Endereço encontrado! Clique no mapa para definir o destino.');
        } else {
          toast.error('Endereço não encontrado. Tente ser mais específico.');
        }
      }
    );
  };

  // Fechar sugestões ao clicar fora - com delay para permitir cliques nas sugestões
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        // Pequeno delay para garantir que o clique foi processado
        setTimeout(() => {
          setShowSuggestions(false);
        }, 150);
      }
    };

    // Usar 'mousedown' ao invés de 'click' para melhor controle
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!GOOGLE_MAPS_API_KEY || !isLoaded) {
    return null; // Não mostrar se a API não estiver disponível
  }

  return (
    <div className="relative w-full">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Buscar endereço (ex: Avenida Paulista, São Paulo)"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
              // Não fechar sugestões enquanto o usuário digita
              // As sugestões serão atualizadas pelo debounce
            }}
            onFocus={(e) => {
              // Mostrar sugestões apenas se já houver sugestões e o campo tiver conteúdo
              if (suggestions.length > 0 && searchValue.trim().length >= 3) {
                setShowSuggestions(true);
              }
            }}
            onBlur={(e) => {
              // Não fechar sugestões imediatamente - aguardar um pouco para permitir cliques
              setTimeout(() => {
                // Verificar se o elemento que recebeu o foco não está dentro das sugestões
                const activeElement = document.activeElement;
                if (
                  !suggestionsRef.current?.contains(activeElement) &&
                  !inputRef.current?.contains(activeElement)
                ) {
                  setShowSuggestions(false);
                }
              }, 200);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setShowSuggestions(false);
                handleSearch();
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
                inputRef.current?.blur();
              } else if (e.key === 'ArrowDown' && showSuggestions && suggestions.length > 0) {
                e.preventDefault();
                // Focar no primeiro item da lista (implementação futura)
                const firstButton = suggestionsRef.current?.querySelector('button');
                if (firstButton) {
                  (firstButton as HTMLElement).focus();
                }
              }
            }}
            disabled={disabled || isSearching}
            className="pl-10 pr-10"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClear}
              onMouseDown={(e) => {
                // Prevenir que o input perca o foco
                e.preventDefault();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              disabled={disabled}
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          onClick={handleSearch}
          disabled={disabled || isSearching || !searchValue.trim()}
          size="default"
          className="px-4"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Sugestões de endereços */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((prediction) => (
            <div
              key={prediction.place_id}
              className="flex items-center gap-1"
            >
              <button
                type="button"
                onClick={(e) => handleSuggestionClick(prediction, false, e)}
                onMouseDown={(e) => {
                  // Prevenir que o input perca o foco antes do clique
                  e.preventDefault();
                }}
                className="flex-1 text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors flex items-start gap-3 focus:outline-none focus:bg-accent"
              >
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{prediction.structured_formatting.main_text}</p>
                  {prediction.structured_formatting.secondary_text && (
                    <p className="text-xs text-muted-foreground truncate">
                      {prediction.structured_formatting.secondary_text}
                    </p>
                  )}
                </div>
              </button>
              {onDestinationSelect && (
                <button
                  type="button"
                  onClick={(e) => handleSuggestionClick(prediction, true, e)}
                  onMouseDown={(e) => {
                    // Prevenir que o input perca o foco antes do clique
                    e.preventDefault();
                  }}
                  className="px-3 py-3 hover:bg-primary hover:text-primary-foreground transition-colors text-primary text-xs font-medium flex-shrink-0 focus:outline-none"
                  title="Definir como destino"
                >
                  ✓
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSearch;

