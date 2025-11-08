import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationMap from '@/components/LocationMap';
import AlarmControls from '@/components/AlarmControls';
import { toast } from 'sonner';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useLists } from '@/hooks/useLists';
import { useSettings } from '@/hooks/useSettings';
import { checkNearbyRelevantPlaces } from '@/services/nearbyPlaces';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ListTodo, Bell, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';

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

const Index = () => {
  const navigate = useNavigate();
  const { hasActiveShoppingItems } = useLists();
  const { settings } = useSettings();
  const { profile, incrementAlarms, incrementShoppingAlerts, updateFavoriteRadius } = useProfile();
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([-23.5505, -46.6333]); // São Paulo default
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState<number>(500); // Valor padrão inicial
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [watchId, setWatchId] = useState<number | string | null>(null);
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
  
  // Monitoramento de estabelecimentos próximos
  const nearbyWatchIdRef = useRef<number | string | null>(null);
  const lastAlertTimeRef = useRef<number>(0);

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
    if (alarmTriggered) return;

    setAlarmTriggered(true);
    
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

      // Send notification (se habilitada)
      if (settings.enableNotifications) {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          // Usar API nativa do navegador
          new Notification('🔔 Sonecaz - Você chegou!', {
            body: 'Você está próximo ao seu destino. Hora de acordar!',
            icon: '/favicon.ico',
          });
        } else {
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
          } catch (notificationError) {
            console.error('Notification error:', notificationError);
          }
        }
      }

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
    } catch (error) {
      console.error('Error triggering alarm:', error);
      toast.error('Erro ao disparar alarme');
    }
  }, [alarmTriggered, settings.enableHaptics, settings.enableNotifications, incrementAlarms]);

  // Watch location when alarm is active
  useEffect(() => {
    if (!isAlarmActive || !destination) {
      if (watchId) {
        // Limpar watch anterior
        if (typeof watchId === 'number') {
          // API nativa do navegador
          navigator.geolocation.clearWatch(watchId);
        } else {
          // Capacitor
          try {
            Geolocation.clearWatch({ id: watchId });
          } catch (error) {
            // Ignorar erro
          }
        }
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
              if (dist <= radius) {
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
                  if (dist <= radius) {
                    triggerAlarm();
                  }
                }
              }
            );
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
      if (watchId) {
        if (typeof watchId === 'number') {
          // API nativa do navegador
          navigator.geolocation.clearWatch(watchId);
        } else {
          // Capacitor
          try {
            Geolocation.clearWatch({ id: watchId });
          } catch (error) {
            // Ignorar erro
          }
        }
      }
    };
  }, [isAlarmActive, destination, radius, triggerAlarm, watchId]);

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
    type: 'supermarket' | 'pharmacy',
    place: { name: string; address: string; distance: number }
  ) => {
    const typeName = type === 'supermarket' ? 'supermercado' : 'farmácia';
    const emoji = type === 'supermarket' ? '🛒' : '💊';
    const distanceText = place.distance >= 1000 
      ? `${(place.distance / 1000).toFixed(1)} km`
      : `${Math.round(place.distance)} m`;

    try {
      // Haptic feedback (se habilitado)
      if (settings.enableHaptics) {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (error) {
          // Ignorar em ambiente web
        }
      }

      // Notificação (se habilitada)
      if (settings.enableNotifications) {
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
        description: `${place.name} está a ${distanceText} de você.`,
        duration: 8000,
        style: {
          background: type === 'supermarket' ? '#10B981' : '#8B5CF6',
          color: 'white',
        },
      });
      
      // Incrementar contador de alertas de compras
      incrementShoppingAlerts();
    } catch (error) {
      console.error('Error triggering nearby alert:', error);
    }
  }, [settings.enableHaptics, settings.enableNotifications, incrementShoppingAlerts]);

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

    // Verificar se há itens ativos nas listas
    const shoppingStatus = hasActiveShoppingItems();
    
    if (!shoppingStatus.hasAny) {
      // Limpar monitoramento se não há itens
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
      
      startNearbyMonitoring(shoppingStatus);
    };

    const startNearbyMonitoring = (shoppingStatus: { hasShopping: boolean; hasPharmacy: boolean }) => {

      try {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          const id = navigator.geolocation.watchPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              
              // Verificar cooldown
              const now = Date.now();
              const alertCooldown = settings.alertCooldown * 60000; // Converter minutos para milissegundos
              if (now - lastAlertTimeRef.current < alertCooldown) {
                return;
              }

              // Verificar se Google Maps está disponível
              if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
                return;
              }

              // Verificar estabelecimentos próximos
              const nearbyPlace = await checkNearbyRelevantPlaces(
                [lat, lng],
                shoppingStatus.hasShopping,
                shoppingStatus.hasPharmacy,
                settings.nearbyAlertRadius // Usar raio das configurações
              );

              if (nearbyPlace) {
                lastAlertTimeRef.current = now;
                triggerNearbyAlert(nearbyPlace.type, nearbyPlace.place);
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
                const alertCooldown = settings.alertCooldown * 60000; // Converter minutos para milissegundos
                if (now - lastAlertTimeRef.current < alertCooldown) {
                  return;
                }

                // Verificar se Google Maps está disponível
                if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
                  return;
                }

                // Verificar estabelecimentos próximos
                const nearbyPlace = await checkNearbyRelevantPlaces(
                  [lat, lng],
                  shoppingStatus.hasShopping,
                  shoppingStatus.hasPharmacy,
                  settings.nearbyAlertRadius // Usar raio das configurações
                );

                if (nearbyPlace) {
                  lastAlertTimeRef.current = now;
                  triggerNearbyAlert(nearbyPlace.type, nearbyPlace.place);
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
  }, [hasActiveShoppingItems, triggerNearbyAlert, settings.enableNearbyAlerts, settings.nearbyAlertRadius, settings.alertCooldown]);

  const handleMapClick = async (lat: number, lng: number) => {
    if (!isAlarmActive) {
      setDestination([lat, lng]);
      setSearchCenter(null); // Limpar busca quando definir destino no mapa
      toast.success('Destino definido no mapa!');
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (error) {
        // Ignorar erro em ambiente web
      }
    }
  };

  const handleToggleAlarm = async () => {
    if (!destination) return;

    if (!isAlarmActive) {
      setAlarmTriggered(false);
      setIsAlarmActive(true);
      toast.success('Alarme ativado! Monitorando sua localização...', {
        icon: '🔔',
      });
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (error) {
        // Ignorar erro em ambiente web
      }
    } else {
      setIsAlarmActive(false);
      toast.info('Alarme desativado');
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (error) {
        // Ignorar erro em ambiente web
      }
    }
  };

  const handleRadiusChange = async (value: number) => {
    setRadius(value);
    // Atualizar raio favorito no perfil
    updateFavoriteRadius(value);
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      // Ignorar erro em ambiente web
    }
  };

  const handleAddressSelect = (lat: number, lng: number, address: string) => {
    // Limpar destino anterior quando buscar novo endereço
    setDestination(null);
    setSearchCenter([lat, lng]);
    toast.success(`Endereço encontrado! Clique no mapa para definir como destino.`, {
      description: address,
      duration: 5000,
    });
  };

  const handleMapCenterChange = (lat: number, lng: number) => {
    setSearchCenter([lat, lng]);
  };

  const handleDestinationSelect = async (lat: number, lng: number, address: string) => {
    setDestination([lat, lng]);
    setSearchCenter(null); // Limpar busca quando destino for definido
    toast.success('Destino definido com sucesso!', {
      description: address,
      duration: 3000,
    });
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      // Ignorar erro em ambiente web
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 pb-safe">
      <div className="max-w-2xl mx-auto h-screen flex flex-col gap-4">
        {/* Header com botões de ação */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Sonecaz</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/lists')}
              className="flex items-center gap-2"
            >
              <ListTodo className="w-4 h-4" />
              <span>Listas</span>
              {hasActiveShoppingItems().hasAny && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  !
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2"
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {profile.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>

        {/* Map Section */}
        <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border border-border/50">
          <LocationMap
            center={currentLocation}
            destination={destination}
            radius={radius}
            onMapClick={handleMapClick}
            onLocationUpdate={(lat, lng) => setCurrentLocation([lat, lng])}
            searchCenter={searchCenter}
          />
        </div>

        {/* Controls Section */}
        <div className="pb-4">
          <AlarmControls
            isActive={isAlarmActive}
            radius={radius}
            destination={destination}
            onToggleAlarm={handleToggleAlarm}
            onRadiusChange={handleRadiusChange}
            distance={distance}
            onAddressSelect={handleAddressSelect}
            onDestinationSelect={handleDestinationSelect}
            onMapCenterChange={handleMapCenterChange}
            mapCenter={searchCenter || currentLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;


