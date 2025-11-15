import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Import direto (sem lazy loading) para evitar erro React #306
// O code splitting será feito pelo Vite automaticamente via manualChunks
// Validar que os componentes existam antes de usar
import LocationMap from '@/components/LocationMap';
import AlarmControls from '@/components/AlarmControls';
import FavoritesPanel from '@/components/FavoritesPanel';
import FavoriteModal from '@/components/FavoriteModal';

// Garantir que os componentes sejam válidos
if (!LocationMap || !AlarmControls || !FavoritesPanel || !FavoriteModal) {
  console.error('[Index] Erro: Componentes não carregados corretamente');
}
import { toast } from 'sonner';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useLists } from '@/hooks/useLists';
import { useSettings } from '@/hooks/useSettings';
import { useFavorites, FavoriteDestination } from '@/hooks/useFavorites';
import { useAlarmHistory } from '@/hooks/useAlarmHistory';
import { useRecurringAlarms } from '@/hooks/useRecurringAlarms';
import { useCommuteMode } from '@/hooks/useCommuteMode';
import { usePlaceFilters } from '@/hooks/usePlaceFilters';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { checkNearbyRelevantPlaces } from '@/services/nearbyPlaces';
import { PlaceCategory, getCategoryIcon, getCategoryName } from '@/types/places';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ListTodo, Bell, Settings, User, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { playAlarmSound } from '@/utils/alarmSounds';

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
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

export default function Index() {
  // Hooks devem ser chamados no topo (regra dos hooks)
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  // Desestruturar getActiveCategories do hook useLists
  const { hasActiveShoppingItems, getActiveCategories } = useLists();
  const { settings } = useSettings();
  const { profile, incrementAlarms, incrementShoppingAlerts, updateFavoriteRadius } = useProfile();
  const { addFavorite, updateFavorite, incrementUseCount } = useFavorites();
  const { addToHistory } = useAlarmHistory();
  const { getActiveAlarmsForToday, alarms: recurringAlarms } = useRecurringAlarms();
  const { settings: commuteSettings, isSilentModeActive } = useCommuteMode();
  const { filters: placeFilters } = usePlaceFilters();
  const { isOnline } = useOfflineMode();
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([-23.5505, -46.6333]); // São Paulo default
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [startLocation, setStartLocation] = useState<[number, number]>([-23.5505, -46.6333]);
  const [radius, setRadius] = useState<number>(500); // Valor padrão inicial
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [watchId, setWatchId] = useState<number | string | null>(null);
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<FavoriteDestination | undefined>();
  
  // Monitoramento de estabelecimentos próximos
  const nearbyWatchIdRef = useRef<number | string | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  const alarmStartTimeRef = useRef<Date | null>(null);
  const watchIdRef = useRef<number | string | null>(null);

  // Atualizar radius quando as configurações mudarem
  useEffect(() => {
    if (!isAlarmActive && settings.defaultRadius) {
      setRadius(settings.defaultRadius);
    }
  }, [settings.defaultRadius, isAlarmActive]);

  // Request location permissions and get current location
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Verificar se estamos em ambiente web ou mobile
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          // Usar API nativa do navegador para web
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setCurrentLocation([
                position.coords.latitude,
                position.coords.longitude,
              ]);
              toast.success('Localização obtida com sucesso!');
            },
            (error) => {
              console.error('Error getting location:', error);
              toast.error('Erro ao obter localização. Usando localização padrão.');
            },
            { enableHighAccuracy: true }
          );
        } else {
          // Tentar usar Capacitor se disponível
          try {
            const permission = await Geolocation.requestPermissions();
            if (permission.location === 'granted') {
              const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
              });
              setCurrentLocation([
                position.coords.latitude,
                position.coords.longitude,
              ]);
              toast.success('Localização obtida com sucesso!');
            } else {
              toast.error('Permissão de localização negada');
            }
          } catch (capacitorError) {
            console.error('Capacitor geolocation error:', capacitorError);
            // Continuar com localização padrão
          }
        }
      } catch (error) {
        console.error('Error getting location:', error);
        toast.error('Erro ao obter localização. Usando localização padrão.');
      }
    };

    requestPermissions();
  }, []);

  // Request notification permissions
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      try {
        // Verificar se estamos em ambiente web
        if (typeof window !== 'undefined' && 'Notification' in window) {
          // Usar API nativa do navegador
          if (Notification.permission === 'default') {
            Notification.requestPermission();
          }
        } else {
          // Tentar usar Capacitor se disponível
          try {
            const permission = await LocalNotifications.requestPermissions();
            if (permission.display !== 'granted') {
              toast.error('Permissão de notificações negada');
            }
          } catch (capacitorError) {
            console.error('Capacitor notification error:', capacitorError);
          }
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
      }
    };

    requestNotificationPermissions();
  }, []);

  // Trigger alarm when destination is reached
  const triggerAlarm = useCallback(async () => {
    console.log('[triggerAlarm] Função chamada. alarmTriggered:', alarmTriggered);
    
    if (alarmTriggered) {
      console.log('[triggerAlarm] Alarme já foi disparado anteriormente. Ignorando.');
      return;
    }
    
    // Verificar modo silencioso
    const silentMode = isSilentModeActive();
    console.log('[triggerAlarm] Modo silencioso:', silentMode);
    if (silentMode) {
      console.log('[triggerAlarm] Modo silencioso ativo - alarme não será disparado');
      return;
    }

    console.log('[triggerAlarm] Disparando alarme...');
    setAlarmTriggered(true);
    
    // Calcular duração do alarme
    const duration = alarmStartTimeRef.current
      ? Math.round((Date.now() - alarmStartTimeRef.current.getTime()) / 60000) // em minutos
      : undefined;

    // Salvar no histórico
    if (destination && destinationAddress) {
      addToHistory({
        destinationName: destinationAddress.split(',')[0] || 'Destino',
        destinationAddress,
        destinationLocation: destination,
        startLocation,
        radius,
        distance: distance || 0,
        duration,
      });
    }
    
    // Incrementar contador de alarmes
    incrementAlarms();
    
    try {
      // Haptic feedback (se habilitado)
      if (settings.enableHaptics) {
        try {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        } catch (error) {
          // Ignorar erro em ambiente web
        }
      }

      // Send notification (se habilitada e não estiver em modo silencioso)
      console.log('[triggerAlarm] Notificações habilitadas:', settings.enableNotifications);
      console.log('[triggerAlarm] Modo silencioso:', isSilentModeActive());
      if (settings.enableNotifications && !isSilentModeActive()) {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          console.log('[triggerAlarm] Enviando notificação do navegador...');
          // Usar API nativa do navegador
          new Notification('🔔 Sonecaz - Você chegou!', {
            body: 'Você está próximo ao seu destino. Hora de acordar!',
            icon: '/favicon.ico',
          });
        } else {
          console.log('[triggerAlarm] Tentando usar Capacitor para notificação...');
          // Tentar usar Capacitor se disponível
          try {
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: '🔔 Sonecaz - Você chegou!',
                  body: 'Você está próximo ao seu destino. Hora de acordar!',
                  id: 1,
                  schedule: { at: new Date(Date.now() + 100) },
                  sound: 'beep.wav',
                  attachments: undefined,
                  actionTypeId: '',
                  extra: null,
                },
              ],
            });
            console.log('[triggerAlarm] Notificação agendada com sucesso');
          } catch (notificationError) {
            console.error('[triggerAlarm] Erro ao agendar notificação:', notificationError);
          }
        }
      } else {
        console.log('[triggerAlarm] Notificações não serão enviadas (desabilitadas ou modo silencioso)');
      }

      // Tocar som do alarme (usando o som escolhido nas configurações)
      await playAlarmSound(settings.alarmSound);

      // Visual alert
      toast.error('🔔 VOCÊ CHEGOU AO SEU DESTINO!', {
        duration: 10000,
        style: {
          background: '#F36F45',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
        },
      });

      // Auto-disable alarm
      setIsAlarmActive(false);
      alarmStartTimeRef.current = null;
    } catch (error) {
      console.error('Error triggering alarm:', error);
      toast.error('Erro ao disparar alarme');
    }
  }, [alarmTriggered, settings.enableHaptics, settings.enableNotifications, isSilentModeActive, incrementAlarms, destination, destinationAddress, startLocation, radius, distance, addToHistory]);

  // Watch location when alarm is active
  useEffect(() => {
    if (!isAlarmActive || !destination) {
      // Limpar watch anterior
      if (watchIdRef.current) {
        if (typeof watchIdRef.current === 'number') {
          // API nativa do navegador
          navigator.geolocation.clearWatch(watchIdRef.current);
        } else {
          // Capacitor
          try {
            Geolocation.clearWatch({ id: watchIdRef.current });
          } catch (error) {
            // Ignorar erro
          }
        }
        watchIdRef.current = null;
        setWatchId(null);
      }
      return;
    }

    const startWatching = async () => {
      try {
        // Verificar se estamos em ambiente web
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          // Usar API nativa do navegador
          const id = navigator.geolocation.watchPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              setCurrentLocation([lat, lng]);

              // Calculate distance to destination
              const dist = calculateDistance(
                lat,
                lng,
                destination[0],
                destination[1]
              );
              setDistance(dist);

              // Check if within radius
              console.log(`[Alarme] Distância: ${dist.toFixed(0)}m, Raio: ${radius}m`);
              if (dist <= radius) {
                console.log('[Alarme] Dentro do raio! Disparando alarme...');
                triggerAlarm();
              }
            },
            (error) => {
              console.error('Watch position error:', error);
              toast.error('Erro ao monitorar localização');
              setIsAlarmActive(false);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            }
          );
          watchIdRef.current = id;
          setWatchId(id);
        } else {
          // Tentar usar Capacitor se disponível
          try {
            const id = await Geolocation.watchPosition(
              {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
              },
              (position, err) => {
                if (err) {
                  console.error('Watch position error:', err);
                  return;
                }

                if (position) {
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;
                  setCurrentLocation([lat, lng]);

                  // Calculate distance to destination
                  const dist = calculateDistance(
                    lat,
                    lng,
                    destination[0],
                    destination[1]
                  );
                  setDistance(dist);

                  // Check if within radius
                  console.log(`[Alarme] Distância: ${dist.toFixed(0)}m, Raio: ${radius}m`);
                  if (dist <= radius) {
                    console.log('[Alarme] Dentro do raio! Disparando alarme...');
                    triggerAlarm();
                  }
                }
              }
            );
            watchIdRef.current = id;
            setWatchId(id);
          } catch (capacitorError) {
            console.error('Error watching position:', capacitorError);
            toast.error('Erro ao monitorar localização');
            setIsAlarmActive(false);
          }
        }
      } catch (error) {
        console.error('Error watching position:', error);
        toast.error('Erro ao monitorar localização');
        setIsAlarmActive(false);
      }
    };

    startWatching();

    return () => {
      if (watchIdRef.current) {
        if (typeof watchIdRef.current === 'number') {
          // API nativa do navegador
          navigator.geolocation.clearWatch(watchIdRef.current);
        } else {
          // Capacitor
          try {
            Geolocation.clearWatch({ id: watchIdRef.current });
          } catch (error) {
            // Ignorar erro
          }
        }
        watchIdRef.current = null;
      }
    };
  }, [isAlarmActive, destination, radius, triggerAlarm]);

  // Update distance when destination or current location changes
  useEffect(() => {
    if (destination && currentLocation) {
      const dist = calculateDistance(
        currentLocation[0],
        currentLocation[1],
        destination[0],
        destination[1]
      );
      setDistance(dist);
    }
  }, [destination, currentLocation]);

  // Função para disparar alerta de estabelecimento próximo
  const triggerNearbyAlert = useCallback(async (
    type: PlaceCategory,
    place: { name: string; address: string; distance: number; isOpen?: boolean }
  ) => {
    const typeName = getCategoryName(type);
    const emoji = getCategoryIcon(type);
    const distanceText = place.distance >= 1000 
      ? `${(place.distance / 1000).toFixed(1)} km`
      : `${Math.round(place.distance)} m`;
    const statusText = place.isOpen !== undefined 
      ? (place.isOpen ? ' (Aberto)' : ' (Fechado)')
      : '';

    try {
      // Haptic feedback (se habilitado)
      if (settings.enableHaptics) {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (error) {
          // Ignorar em ambiente web
        }
      }

      // Notificação (se habilitada e não estiver em modo silencioso)
      if (settings.enableNotifications && !isSilentModeActive()) {
        // Notificação do navegador
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`${emoji} ${typeName} próximo!`, {
            body: `${place.name} está a ${distanceText} de você.`,
            icon: '/favicon.ico',
          });
        } else {
          // Tentar usar Capacitor
          try {
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: `${emoji} ${typeName} próximo!`,
                  body: `${place.name} está a ${distanceText} de você.`,
                  id: Date.now(),
                  schedule: { at: new Date(Date.now() + 100) },
                  sound: 'beep.wav',
                  attachments: undefined,
                  actionTypeId: '',
                  extra: null,
                },
              ],
            });
          } catch (notificationError) {
            console.error('Notification error:', notificationError);
          }
        }
      }

      // Toast visual
      toast.success(`${emoji} ${typeName} próximo!`, {
        description: `${place.name} está a ${distanceText} de você.${statusText}`,
        duration: 8000,
        style: {
          background: place.isOpen === false ? '#6B7280' : '#10B981',
          color: 'white',
        },
      });
      
      // Incrementar contador de alertas de compras
      incrementShoppingAlerts();
    } catch (error) {
      console.error('Error triggering nearby alert:', error);
    }
  }, [settings.enableHaptics, settings.enableNotifications, isSilentModeActive, incrementShoppingAlerts]);

  // Monitorar estabelecimentos próximos (independente do alarme principal)
  useEffect(() => {
    // Verificar se alertas de estabelecimentos estão habilitados
    if (!settings.enableNearbyAlerts) {
      // Limpar monitoramento se desabilitado
      if (nearbyWatchIdRef.current) {
        if (typeof nearbyWatchIdRef.current === 'number') {
          navigator.geolocation.clearWatch(nearbyWatchIdRef.current);
        } else {
          try {
            Geolocation.clearWatch({ id: nearbyWatchIdRef.current });
          } catch (error) {
            // Ignorar erro
          }
        }
        nearbyWatchIdRef.current = null;
      }
      return;
    }

    // Obter categorias ativas baseado nos itens das listas
    if (!getActiveCategories) {
      return;
    }
    const activeCategories = getActiveCategories();
    
    // Filtrar apenas categorias habilitadas nos filtros
    const enabledCategories = activeCategories.filter(cat => 
      placeFilters.enabledCategories.includes(cat)
    );
    
    if (enabledCategories.length === 0) {
      // Limpar monitoramento se não há categorias ativas
      if (nearbyWatchIdRef.current) {
        if (typeof nearbyWatchIdRef.current === 'number') {
          navigator.geolocation.clearWatch(nearbyWatchIdRef.current);
        } else {
          try {
            Geolocation.clearWatch({ id: nearbyWatchIdRef.current });
          } catch (error) {
            // Ignorar erro
          }
        }
        nearbyWatchIdRef.current = null;
      }
      return;
    }

    // Verificar se Google Maps está disponível - aguardar carregamento
    const checkGoogleMaps = () => {
      if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        // Tentar novamente após 1 segundo
        setTimeout(checkGoogleMaps, 1000);
        return;
      }
      
      startNearbyMonitoring();
    };

    const startNearbyMonitoring = () => {
      try {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          const id = navigator.geolocation.watchPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              
              // Verificar cooldown
              const now = Date.now();
              const alertCooldown = settings.alertCooldown * 1000; // Converter segundos para milissegundos
              if (now - lastAlertTimeRef.current < alertCooldown) {
                return;
              }

              // Verificar se Google Maps está disponível
              if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
                return;
              }

              // Obter categorias ativas
              if (!getActiveCategories) return;
              const activeCategories = getActiveCategories();
              const enabledCategories = activeCategories.filter(cat => 
                placeFilters.enabledCategories.includes(cat)
              );

              if (enabledCategories.length === 0) return;

              // Verificar estabelecimentos próximos
              const nearbyPlace = await checkNearbyRelevantPlaces(
                [lat, lng],
                enabledCategories,
                placeFilters.alertRadius || settings.nearbyAlertRadius,
                placeFilters.filterOpenOnly
              );

              if (nearbyPlace) {
                lastAlertTimeRef.current = now;
                triggerNearbyAlert(nearbyPlace.type, {
                  name: nearbyPlace.place.name,
                  address: nearbyPlace.place.address,
                  distance: nearbyPlace.place.distance,
                  isOpen: nearbyPlace.place.isOpen,
                });
              }
            },
            (error) => {
              console.error('Nearby monitoring error:', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 30000, // 30 segundos
            }
          );
          nearbyWatchIdRef.current = id;
        } else {
          // Tentar usar Capacitor
          try {
            Geolocation.watchPosition(
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000,
              },
              async (position, err) => {
                if (err || !position) return;

                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Verificar cooldown
                const now = Date.now();
                const alertCooldown = settings.alertCooldown * 1000; // Converter segundos para milissegundos
                if (now - lastAlertTimeRef.current < alertCooldown) {
                  return;
                }

                // Verificar se Google Maps está disponível
                if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
                  return;
                }

                // Obter categorias ativas
                if (!getActiveCategories) return;
                const activeCategories = getActiveCategories();
                const enabledCategories = activeCategories.filter(cat => 
                  placeFilters.enabledCategories.includes(cat)
                );

                if (enabledCategories.length === 0) return;

                // Verificar estabelecimentos próximos
                const nearbyPlace = await checkNearbyRelevantPlaces(
                  [lat, lng],
                  enabledCategories,
                  placeFilters.alertRadius || settings.nearbyAlertRadius,
                  placeFilters.filterOpenOnly
                );

                if (nearbyPlace) {
                  lastAlertTimeRef.current = now;
                  triggerNearbyAlert(nearbyPlace.type, {
                    name: nearbyPlace.place.name,
                    address: nearbyPlace.place.address,
                    distance: nearbyPlace.place.distance,
                    isOpen: nearbyPlace.place.isOpen,
                  });
                }
              }
            ).then((id) => {
              nearbyWatchIdRef.current = id;
            }).catch((error) => {
              console.error('Error starting nearby monitoring:', error);
            });
          } catch (error) {
            console.error('Error starting nearby monitoring:', error);
          }
        }
      } catch (error) {
        console.error('Error starting nearby monitoring:', error);
      }
    };

    checkGoogleMaps();

    return () => {
      if (nearbyWatchIdRef.current) {
        if (typeof nearbyWatchIdRef.current === 'number') {
          navigator.geolocation.clearWatch(nearbyWatchIdRef.current);
        } else {
          try {
            Geolocation.clearWatch({ id: nearbyWatchIdRef.current });
          } catch (error) {
            // Ignorar erro
          }
        }
        nearbyWatchIdRef.current = null;
      }
    };
  }, [getActiveCategories, placeFilters, triggerNearbyAlert, settings.enableNearbyAlerts, settings.alertCooldown, settings.nearbyAlertRadius]);

  // Ativação automática de alarmes recorrentes
  useEffect(() => {
    if (!commuteSettings.autoStart) return;

    const checkRecurringAlarms = () => {
      const activeAlarms = getActiveAlarmsForToday();
      
      activeAlarms.forEach((alarm) => {
        // Verificar se o alarme já está ativo
        if (isAlarmActive && destination && 
            destination[0] === alarm.destination.location[0] && 
            destination[1] === alarm.destination.location[1]) {
          return; // Já está ativo
        }

        // Ativar o alarme automaticamente
        setDestination(alarm.destination.location);
        setDestinationAddress(alarm.destination.address);
        setRadius(alarm.radius);
        setIsAlarmActive(true);
        setStartLocation(currentLocation);
        alarmStartTimeRef.current = new Date();
        
        toast.info(`Alarme "${alarm.name}" ativado automaticamente`, {
          description: `Ativo até ${alarm.endTime || 'manualmente desativado'}`,
        });
      });
    };

    // Verificar a cada minuto
    const interval = setInterval(checkRecurringAlarms, 60000);
    checkRecurringAlarms(); // Verificar imediatamente

    return () => clearInterval(interval);
  }, [commuteSettings.autoStart, getActiveAlarmsForToday, isAlarmActive, destination, currentLocation]);

  // Desativação automática de alarmes recorrentes por horário
  useEffect(() => {
    if (!commuteSettings.autoEnd || !isAlarmActive) return;

    const checkEndTime = () => {
      const activeAlarms = getActiveAlarmsForToday();
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      activeAlarms.forEach((alarm) => {
        if (alarm.endTime && currentTime > alarm.endTime) {
          // Desativar alarme se passou do horário de fim
          setIsAlarmActive(false);
          setAlarmTriggered(false);
          alarmStartTimeRef.current = null;
          
          toast.info(`Alarme "${alarm.name}" desativado automaticamente`, {
            description: `Horário de fim: ${alarm.endTime}`,
          });
        }
      });
    };

    // Verificar a cada minuto
    const interval = setInterval(checkEndTime, 60000);
    checkEndTime(); // Verificar imediatamente

    return () => clearInterval(interval);
  }, [commuteSettings.autoEnd, isAlarmActive, getActiveAlarmsForToday]);

  // Handle map click to set destination
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (isAlarmActive) return;

    setDestination([lat, lng]);
    setAlarmTriggered(false);
    
    // Tentar obter endereço através de geocoding reverso
    try {
      if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results && results[0]) {
              setDestinationAddress(results[0].formatted_address);
              toast.success('Destino definido no mapa!');
            } else {
              setDestinationAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          }
        );
      } else {
        setDestinationAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error geocoding:', error);
      setDestinationAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }

    // Haptic feedback
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      // Ignorar erro em ambiente web
    }
  }, [isAlarmActive]);

  // Handle address select from search
  const handleAddressSelect = useCallback((lat: number, lng: number, address: string) => {
    setSearchCenter([lat, lng]);
    setDestinationAddress('');
    toast.info('Endereço encontrado! Clique no mapa para definir como destino.');
  }, []);

  // Handle destination select from search
  const handleDestinationSelect = useCallback((lat: number, lng: number, address: string) => {
    setDestination([lat, lng]);
    setDestinationAddress(address);
    setAlarmTriggered(false);
    toast.success('Destino definido com sucesso!');
  }, []);

  // Handle map center change
  const handleMapCenterChange = useCallback((lat: number, lng: number) => {
    setSearchCenter([lat, lng]);
  }, []);

  // Handle toggle alarm
  const handleToggleAlarm = useCallback(async () => {
    if (!destination) {
      toast.error('Defina um destino antes de ativar o alarme');
      return;
    }

    if (isAlarmActive) {
      // Desativar alarme
      setIsAlarmActive(false);
      setAlarmTriggered(false);
      alarmStartTimeRef.current = null;
      toast.info('Alarme desativado');
    } else {
      // Ativar alarme
      setIsAlarmActive(true);
      setAlarmTriggered(false);
      setStartLocation(currentLocation);
      alarmStartTimeRef.current = new Date();
      toast.success('Alarme ativado! Monitorando sua localização...');
      
      // Atualizar raio favorito no perfil
      updateFavoriteRadius(radius);
    }

    // Haptic feedback
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      // Ignorar erro em ambiente web
    }
  }, [destination, isAlarmActive, currentLocation, radius, updateFavoriteRadius]);

  // Handle radius change
  const handleRadiusChange = useCallback(async (newRadius: number) => {
    setRadius(newRadius);
    
    // Haptic feedback
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      // Ignorar erro em ambiente web
    }
  }, []);

  // Handle save favorite
  const handleSaveFavorite = useCallback(() => {
    if (!destination || !destinationAddress) {
      toast.error('Defina um destino antes de salvar como favorito');
      return;
    }
    setShowFavoriteModal(true);
    setEditingFavorite(undefined);
  }, [destination, destinationAddress]);

  // Handle favorite save
  const handleFavoriteSave = useCallback((favoriteData: Omit<FavoriteDestination, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>) => {
    if (editingFavorite) {
      updateFavorite(editingFavorite.id, favoriteData);
      toast.success('Favorito atualizado!');
    } else {
      addFavorite({
        ...favoriteData,
        location: destination!,
      });
      toast.success('Favorito salvo!');
    }
    setShowFavoriteModal(false);
    setEditingFavorite(undefined);
  }, [editingFavorite, destination, addFavorite, updateFavorite]);

  // Handle favorite select
  const handleFavoriteSelect = useCallback((favorite: FavoriteDestination) => {
    setDestination(favorite.location);
    setDestinationAddress(favorite.address);
    setRadius(favorite.radius);
    setAlarmTriggered(false);
    setShowFavorites(false);
    incrementUseCount(favorite.id);
    toast.success(`Destino "${favorite.name}" selecionado!`);
  }, [incrementUseCount]);

  // Handle edit favorite
  const handleEditFavorite = useCallback((favorite: FavoriteDestination) => {
    setEditingFavorite(favorite);
    setShowFavoriteModal(true);
  }, []);

  // Get map reference for centering
  const mapRef = useRef<google.maps.Map | null>(null);
  const handleMapRef = useCallback((map: google.maps.Map | null) => {
    mapRef.current = map;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Sonecaz</h1>
            <div className={cn(
              "p-2 rounded-full transition-all duration-300",
              isAlarmActive ? "bg-success/20 animate-pulse" : "bg-muted/50"
            )}>
              {isAlarmActive ? (
                <Bell className="w-5 h-5 text-success" />
              ) : (
                <Bell className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            {!isOnline && (
              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                Offline
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFavorites(!showFavorites)}
              className="relative"
            >
              <Star className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/lists')}
            >
              <ListTodo className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="relative"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage 
                  src={authUser?.photoURL || profile.avatar} 
                  alt={authUser?.name || profile.name} 
                />
                <AvatarFallback>
                  {(authUser?.name || profile.name).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>

      {/* Favorites Panel */}
      {showFavorites && (
        <div className="container mx-auto px-4 py-4">
          <FavoritesPanel
            onSelectFavorite={handleFavoriteSelect}
            onEditFavorite={handleEditFavorite}
          />
        </div>
      )}

      {/* Map */}
      <div className="container mx-auto px-4 py-4">
        <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-xl border border-border/50">
          <LocationMap
            center={currentLocation}
            destination={destination}
            radius={radius}
            searchCenter={searchCenter}
            onMapClick={handleMapClick}
            onLocationUpdate={(lat, lng) => setCurrentLocation([lat, lng])}
            onMapRef={handleMapRef}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="container mx-auto px-4 py-4">
        <AlarmControls
          isActive={isAlarmActive}
          distance={distance}
          radius={radius}
          destinationAddress={destinationAddress}
          onToggleAlarm={handleToggleAlarm}
          onRadiusChange={handleRadiusChange}
          onAddressSelect={handleAddressSelect}
          onDestinationSelect={handleDestinationSelect}
          onMapCenterChange={handleMapCenterChange}
          mapCenter={searchCenter || currentLocation}
          onSaveFavorite={handleSaveFavorite}
        />
      </div>

      {/* Favorite Modal */}
      {showFavoriteModal && (
        <FavoriteModal
          open={showFavoriteModal}
          onClose={() => {
            setShowFavoriteModal(false);
            setEditingFavorite(undefined);
          }}
          onSave={handleFavoriteSave}
          initialData={destination && destinationAddress ? {
            name: destinationAddress.split(',')[0] || 'Destino',
            address: destinationAddress,
            location: destination,
            radius,
          } : undefined}
          favorite={editingFavorite}
        />
      )}
    </div>
  );
}

