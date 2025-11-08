import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RecurringAlarm, DayOfWeek } from '@/types/commute';
import { DAYS_OF_WEEK } from '@/utils/timeUtils';
import { Clock } from 'lucide-react';

interface RecurringAlarmModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (alarm: Omit<RecurringAlarm, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: {
    name: string;
    destination: {
      name: string;
      address: string;
      location: [number, number];
    };
    radius: number;
  };
  alarm?: RecurringAlarm;
}

const RecurringAlarmModal = ({
  open,
  onClose,
  onSave,
  initialData,
  alarm,
}: RecurringAlarmModalProps) => {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState<{
    name: string;
    address: string;
    location: [number, number];
  } | null>(null);
  const [radius, setRadius] = useState(500);
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>([]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (alarm) {
      setName(alarm.name);
      setDestination(alarm.destination);
      setRadius(alarm.radius);
      setDaysOfWeek(alarm.daysOfWeek);
      setStartTime(alarm.startTime);
      setEndTime(alarm.endTime || '');
      setEnabled(alarm.enabled);
    } else if (initialData) {
      setName(initialData.name || 'Alarme Recorrente');
      setDestination(initialData.destination);
      setRadius(initialData.radius);
      setDaysOfWeek(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
      setStartTime('08:00');
      setEndTime('');
      setEnabled(true);
    } else {
      setName('');
      setDestination(null);
      setRadius(500);
      setDaysOfWeek([]);
      setStartTime('08:00');
      setEndTime('');
      setEnabled(true);
    }
  }, [open, alarm, initialData]);

  const handleDayToggle = (day: DayOfWeek) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !destination || daysOfWeek.length === 0) {
      return;
    }

    onSave({
      name: name.trim(),
      destination,
      radius,
      daysOfWeek,
      startTime,
      endTime: endTime || undefined,
      enabled,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {alarm ? 'Editar Alarme Recorrente' : 'Novo Alarme Recorrente'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Trabalho, Academia..."
              maxLength={50}
            />
          </div>

          {destination && (
            <div className="space-y-2">
              <Label>Destino</Label>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm font-medium">{destination.name}</p>
                <p className="text-xs text-muted-foreground">{destination.address}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="radius">Raio (metros)</Label>
            <Input
              id="radius"
              type="number"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value) || 500)}
              min={50}
              max={5000}
              step={50}
            />
            <p className="text-xs text-muted-foreground">
              {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Dias da Semana *</Label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.value}
                    checked={daysOfWeek.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <Label
                    htmlFor={day.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
            {daysOfWeek.length === 0 && (
              <p className="text-xs text-destructive">
                Selecione pelo menos um dia
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horário de Início *
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horário de Fim (opcional)
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Se especificado, o alarme será desativado automaticamente neste horário
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="enabled"
              checked={enabled}
              onCheckedChange={(checked) => setEnabled(checked === true)}
            />
            <Label htmlFor="enabled" className="text-sm font-normal cursor-pointer">
              Ativar alarme
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !destination || daysOfWeek.length === 0}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecurringAlarmModal;

