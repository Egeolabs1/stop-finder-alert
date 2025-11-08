import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Bell, BellOff, MapPin, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddressSearch from '@/components/AddressSearch';

interface AlarmControlsProps {
  isActive: boolean;
  radius: number;
  destination: [number, number] | null;
  onToggleAlarm: () => void;
  onRadiusChange: (value: number) => void;
  distance: number | null;
  onAddressSelect: (lat: number, lng: number, address: string) => void;
  onDestinationSelect?: (lat: number, lng: number, address: string) => void;
  onMapCenterChange: (lat: number, lng: number) => void;
  mapCenter?: [number, number];
}

const AlarmControls = ({
  isActive,
  radius,
  destination,
  onToggleAlarm,
  onRadiusChange,
  distance,
  onAddressSelect,
  onDestinationSelect,
  onMapCenterChange,
  mapCenter,
}: AlarmControlsProps) => {
  return (
    <Card className="p-6 space-y-6 bg-card/95 backdrop-blur-sm shadow-lg border-border/50">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className={cn(
            "p-3 rounded-full transition-all duration-300",
            isActive ? "bg-success/20 animate-pulse" : "bg-muted"
          )}>
            {isActive ? (
              <Radio className="w-6 h-6 text-success" />
            ) : (
              <Bell className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {isActive 
            ? "Monitorando sua localização..." 
            : "Busque um endereço ou toque no mapa para definir seu destino"}
        </p>
      </div>

      {/* Address Search */}
      {!isActive && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Buscar endereço
          </label>
          <AddressSearch
            onLocationSelect={onAddressSelect}
            onDestinationSelect={onDestinationSelect}
            onMapCenterChange={onMapCenterChange}
            mapCenter={mapCenter}
            disabled={isActive}
          />
        </div>
      )}

      {/* Distance Indicator */}
      {destination && distance !== null && (
        <div className="p-4 bg-secondary/50 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">Distância do destino</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {distance >= 1000 
              ? `${(distance / 1000).toFixed(1)} km`
              : `${Math.round(distance)} m`}
          </p>
        </div>
      )}

      {/* Radius Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Raio de ação
          </label>
          <span className="text-sm font-bold text-primary">
            {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`}
          </span>
        </div>
        <Slider
          value={[radius]}
          onValueChange={(values) => onRadiusChange(values[0])}
          min={50}
          max={5000}
          step={50}
          className="w-full"
          disabled={isActive}
        />
        <p className="text-xs text-muted-foreground text-center">
          {isActive 
            ? "Desative o alarme para ajustar o raio"
            : "Arraste para ajustar a área de ativação"}
        </p>
      </div>

      {/* Activate Button */}
      <Button
        onClick={onToggleAlarm}
        disabled={!destination}
        className={cn(
          "w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300",
          isActive
            ? "bg-destructive hover:bg-destructive/90 shadow-lg"
            : "bg-gradient-to-r from-primary to-primary-glow hover:shadow-xl"
        )}
      >
        {isActive ? (
          <>
            <BellOff className="w-5 h-5 mr-2" />
            Desativar Alarme
          </>
        ) : (
          <>
            <Bell className="w-5 h-5 mr-2" />
            Ativar Alarme
          </>
        )}
      </Button>

      {!destination && (
        <p className="text-xs text-center text-muted-foreground">
          Busque um endereço ou toque no mapa para marcar seu destino antes de ativar
        </p>
      )}
    </Card>
  );
};

export default AlarmControls;

