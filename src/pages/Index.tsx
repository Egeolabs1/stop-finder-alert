import { useState, useEffect, useCallback } from 'react';
import LocationMap from '@/components/LocationMap';
import AlarmControls from '@/components/AlarmControls';
import { toast } from 'sonner';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([-23.5505, -46.6333]); // São Paulo default
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState<number>(500);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [watchId, setWatchId] = useState<string | null>(null);
  const [alarmTriggered, setAlarmTriggered] = useState(false);

  // Request location permissions and get current location
  useEffect(() => {
    const requestPermissions = async () => {
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
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display !== 'granted') {
          toast.error('Permissão de notificações negada');
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
    
    try {
      // Haptic feedback
      await Haptics.impact({ style: ImpactStyle.Heavy });

      // Send notification
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
  }, [alarmTriggered]);

  // Watch location when alarm is active
  useEffect(() => {
    if (!isAlarmActive || !destination) {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
        setWatchId(null);
      }
      return;
    }

    const startWatching = async () => {
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
      } catch (error) {
        console.error('Error watching position:', error);
        toast.error('Erro ao monitorar localização');
        setIsAlarmActive(false);
      }
    };

    startWatching();

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
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

  const handleMapClick = (lat: number, lng: number) => {
    if (!isAlarmActive) {
      setDestination([lat, lng]);
      toast.success('Destino definido no mapa!');
      Haptics.impact({ style: ImpactStyle.Light });
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
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else {
      setIsAlarmActive(false);
      toast.info('Alarme desativado');
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const handleRadiusChange = (value: number) => {
    setRadius(value);
    Haptics.impact({ style: ImpactStyle.Light });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 pb-safe">
      <div className="max-w-2xl mx-auto h-screen flex flex-col gap-4">
        {/* Map Section */}
        <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border border-border/50">
          <LocationMap
            center={currentLocation}
            destination={destination}
            radius={radius}
            onMapClick={handleMapClick}
            onLocationUpdate={(lat, lng) => setCurrentLocation([lat, lng])}
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
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
