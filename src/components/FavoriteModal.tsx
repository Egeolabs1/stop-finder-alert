import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Home, 
  Briefcase, 
  MapPin, 
  Star, 
  Heart, 
  Flag,
  X
} from 'lucide-react';
import { FavoriteDestination } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface FavoriteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (favorite: Omit<FavoriteDestination, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>) => void;
  initialData?: {
    name: string;
    address: string;
    location: [number, number];
    radius?: number;
  };
  favorite?: FavoriteDestination;
}

const iconOptions = [
  { value: 'home', label: 'Casa', icon: Home, color: 'blue' },
  { value: 'briefcase', label: 'Trabalho', icon: Briefcase, color: 'green' },
  { value: 'map-pin', label: 'Localização', icon: MapPin, color: 'red' },
  { value: 'star', label: 'Favorito', icon: Star, color: 'yellow' },
  { value: 'heart', label: 'Coração', icon: Heart, color: 'pink' },
  { value: 'flag', label: 'Bandeira', icon: Flag, color: 'purple' },
];

const FavoriteModal = ({ 
  open, 
  onClose, 
  onSave, 
  initialData,
  favorite 
}: FavoriteModalProps) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<[number, number]>([0, 0]);
  const [selectedIcon, setSelectedIcon] = useState<FavoriteDestination['icon']>('map-pin');
  const [selectedColor, setSelectedColor] = useState<string>('blue');
  const [radius, setRadius] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (favorite) {
      setName(favorite.name);
      setAddress(favorite.address);
      setLocation(favorite.location);
      setSelectedIcon(favorite.icon || 'map-pin');
      setSelectedColor(favorite.color || 'blue');
      setRadius(favorite.radius);
    } else if (initialData) {
      setName(initialData.name || '');
      setAddress(initialData.address || '');
      setLocation(initialData.location);
      setRadius(initialData.radius);
    } else {
      setName('');
      setAddress('');
      setLocation([0, 0]);
      setSelectedIcon('map-pin');
      setSelectedColor('blue');
      setRadius(undefined);
    }
  }, [open, favorite, initialData]);

  const handleSave = () => {
    if (!name.trim() || !address.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      address: address.trim(),
      location,
      icon: selectedIcon,
      color: selectedColor,
      radius,
    });

    onClose();
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      pink: 'bg-pink-500',
      purple: 'bg-purple-500',
    };
    return colorMap[color] || 'bg-blue-500';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {favorite ? 'Editar Favorito' : 'Salvar Favorito'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Casa, Trabalho, Academia..."
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Endereço completo"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = selectedIcon === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedIcon(option.value as FavoriteDestination['icon'])}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <IconComponent
                      className={cn(
                        "w-5 h-5 mx-auto",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2">
              {['blue', 'green', 'red', 'yellow', 'pink', 'purple'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all",
                    getColorClass(color),
                    selectedColor === color
                      ? "border-foreground scale-110"
                      : "border-transparent opacity-50 hover:opacity-75"
                  )}
                />
              ))}
            </div>
          </div>

          {radius !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="radius">
                Raio preferido (opcional)
              </Label>
              <Input
                id="radius"
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Raio em metros"
                min={50}
                max={5000}
                step={50}
              />
              {radius && (
                <p className="text-xs text-muted-foreground">
                  {radius >= 1000 
                    ? `${(radius / 1000).toFixed(1)} km` 
                    : `${radius} m`}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !address.trim()}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FavoriteModal;

