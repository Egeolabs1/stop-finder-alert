import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, MapPin, Mic, History as HistoryIcon, Trash2, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  saveSearchHistory, 
  getSearchHistory, 
  clearSearchHistory, 
  removeSearchHistoryItem,
  startVoiceSearch,
  isVoiceSearchAvailable,
  searchByCoordinates,
  searchPOIByCategory,
  type POISearchResult
} from '@/services/searchService';
import { PlaceCategory } from '@/types/places';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EnhancedAddressSearchProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onDestinationSelect?: (lat: number, lng: number, address: string) => void;
  disabled?: boolean;
  mapCenter?: [number, number];
  onMapCenterChange?: (lat: number, lng: number) => void;
  showPOISearch?: boolean;
  showVoiceSearch?: boolean;
  showHistory?: boolean;
}

const EnhancedAddressSearch = ({ 
  onLocationSelect,
  onDestinationSelect,
  disabled = false,
  mapCenter,
  onMapCenterChange,
  showPOISearch = true,
  showVoiceSearch = true,
  showHistory = true,
}: EnhancedAddressSearchProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [poiResults, setPoiResults] = useState<POISearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
  
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearchValue = useDebounce(searchValue, 600);
  const searchHistory = getSearchHistory();

  // Verificar se Google Maps está carregado
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        setIsLoaded(true);
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };
    checkGoogleMaps();
  }, []);

  // Inicializar serviços
  useEffect(() => {
    if (isLoaded && typeof google !== 'undefined' && google.maps) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
      const div = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(div);
    }
  }, [isLoaded]);

  // Buscar endereços
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
          componentRestrictions: { country: 'br' },
        },
        (predictions, status) => {
          setIsSearching(false);

          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
            
            // Salvar no histórico
            saveSearchHistory({
              query,
              type: 'address',
            });
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    },
    []
  );

  // Buscar POIs por categoria
  const searchPOIs = useCallback(async (category: PlaceCategory) => {
    if (!mapCenter || !isLoaded) return;

    try {
      setIsSearching(true);
      const results = await searchPOIByCategory(mapCenter, category, 5000);
      setPoiResults(results);
      setSelectedCategory(category);
      setShowSuggestions(true);
      
      saveSearchHistory({
        query: category,
        type: 'poi',
        category,
      });
    } catch (error) {
      console.error('Error searching POIs:', error);
      toast.error('Erro ao buscar pontos de interesse');
    } finally {
      setIsSearching(false);
    }
  }, [mapCenter, isLoaded]);

  // Busca por voz
  const handleVoiceSearch = useCallback(async () => {
    if (!isVoiceSearchAvailable()) {
      toast.error('Busca por voz não disponível no seu navegador');
      return;
    }

    try {
      setIsVoiceSearching(true);
      const transcript = await startVoiceSearch();
      setSearchValue(transcript);
      searchAddresses(transcript);
      toast.success('Busca por voz concluída');
    } catch (error) {
      console.error('Voice search error:', error);
      toast.error('Erro na busca por voz');
    } finally {
      setIsVoiceSearching(false);
    }
  }, [searchAddresses]);

  // Buscar por coordenadas
  const handleCoordinateSearch = useCallback(async (lat: number, lng: number) => {
    try {
      setIsSearching(true);
      const result = await searchByCoordinates(lat, lng);
      onLocationSelect(result.location[0], result.location[1], result.address);
      if (onDestinationSelect) {
        onDestinationSelect(result.location[0], result.location[1], result.address);
      }
      
      saveSearchHistory({
        query: `${lat}, ${lng}`,
        type: 'coordinate',
        location: result.location,
      });
      
      toast.success('Localização encontrada!');
    } catch (error) {
      console.error('Coordinate search error:', error);
      toast.error('Erro ao buscar coordenadas');
    } finally {
      setIsSearching(false);
    }
  }, [onLocationSelect, onDestinationSelect]);

  // Efeito para busca com debounce
  useEffect(() => {
    if (debouncedSearchValue.trim().length >= 3) {
      searchAddresses(debouncedSearchValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchValue, searchAddresses]);

  // Obter detalhes do lugar
  const getPlaceDetails = useCallback(
    (placeId: string, prediction: google.maps.places.AutocompletePrediction) => {
      if (!placesServiceRef.current) return;

      placesServiceRef.current.getDetails(
        { placeId },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const lat = place.geometry?.location?.lat() || 0;
            const lng = place.geometry?.location?.lng() || 0;
            const address = place.formatted_address || prediction.description;

            onLocationSelect(lat, lng, address);
            if (onDestinationSelect) {
              onDestinationSelect(lat, lng, address);
            }

            setSearchValue('');
            setShowSuggestions(false);
          }
        }
      );
    },
    [onLocationSelect, onDestinationSelect]
  );

  // Selecionar sugestão
  const handleSuggestionClick = useCallback(
    (prediction: google.maps.places.AutocompletePrediction) => {
      if (prediction.place_id) {
        getPlaceDetails(prediction.place_id, prediction);
      }
    },
    [getPlaceDetails]
  );

  // Selecionar POI
  const handlePOIClick = useCallback(
    (poi: POISearchResult) => {
      onLocationSelect(poi.location[0], poi.location[1], poi.address);
      if (onDestinationSelect) {
        onDestinationSelect(poi.location[0], poi.location[1], poi.address);
      }
      setShowSuggestions(false);
      setPoiResults([]);
    },
    [onLocationSelect, onDestinationSelect]
  );

  // Selecionar do histórico
  const handleHistoryClick = useCallback(
    (item: typeof searchHistory[0]) => {
      if (item.type === 'coordinate' && item.location) {
        handleCoordinateSearch(item.location[0], item.location[1]);
      } else {
        setSearchValue(item.query);
        searchAddresses(item.query);
      }
      setShowHistoryPanel(false);
    },
    [searchAddresses, handleCoordinateSearch]
  );

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => {
              if (showHistory && searchHistory.length > 0) {
                setShowHistoryPanel(true);
              }
            }}
            placeholder="Buscar endereço ou ponto de interesse..."
            disabled={disabled || !isLoaded}
            className="pl-10 pr-10"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchValue('');
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {showVoiceSearch && isVoiceSearchAvailable() && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceSearch}
            disabled={disabled || isVoiceSearching}
            className={cn(isVoiceSearching && 'animate-pulse')}
          >
            <Mic className="w-4 h-4" />
          </Button>
        )}
        
        {showHistory && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            disabled={disabled}
          >
            <HistoryIcon className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Histórico de buscas */}
      {showHistoryPanel && searchHistory.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 p-2 max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Histórico de Buscas</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearSearchHistory();
                setShowHistoryPanel(false);
                toast.success('Histórico limpo');
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {searchHistory.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                onClick={() => handleHistoryClick(item)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{item.query}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSearchHistoryItem(item.id);
                    toast.success('Item removido do histórico');
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sugestões e resultados */}
      {showSuggestions && (suggestions.length > 0 || poiResults.length > 0) && (
        <Card
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 p-2 max-h-60 overflow-y-auto"
        >
          {poiResults.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pontos de Interesse</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPoiResults([]);
                    setSelectedCategory(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {poiResults.map((poi) => (
                <div
                  key={poi.placeId}
                  className="p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => handlePOIClick(poi)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{poi.name}</p>
                      <p className="text-xs text-muted-foreground">{poi.address}</p>
                    </div>
                    {poi.isOpen !== undefined && (
                      <Badge variant={poi.isOpen ? 'default' : 'secondary'}>
                        {poi.isOpen ? 'Aberto' : 'Fechado'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {suggestions.map((prediction) => (
                <div
                  key={prediction.place_id}
                  className="p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => handleSuggestionClick(prediction)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {prediction.structured_formatting.main_text}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {prediction.structured_formatting.secondary_text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Busca por categoria (POI) */}
      {showPOISearch && mapCenter && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(['supermarket', 'pharmacy', 'gas_station', 'restaurant', 'cafe', 'bank'] as PlaceCategory[]).map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => searchPOIs(category)}
              disabled={disabled || isSearching}
              className={cn(
                selectedCategory === category && 'bg-primary text-primary-foreground'
              )}
            >
              {category}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedAddressSearch;



