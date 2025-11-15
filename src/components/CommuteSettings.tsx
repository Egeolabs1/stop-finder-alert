import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Calendar } from 'lucide-react';
import { CommuteSettings, SilentModeSchedule, DayOfWeek } from '@/types/commute';
import { DAYS_OF_WEEK } from '@/utils/timeUtils';

interface CommuteSettingsProps {
  settings: CommuteSettings;
  silentMode: SilentModeSchedule;
  onSettingsChange: (settings: Partial<CommuteSettings>) => void;
  onSilentModeChange: (silentMode: Partial<SilentModeSchedule>) => void;
}

const CommuteSettings = ({
  settings,
  silentMode,
  onSettingsChange,
  onSilentModeChange,
}: CommuteSettingsProps) => {
  const handleDayToggle = (day: DayOfWeek, type: 'workingDays' | 'silentDays') => {
    if (type === 'workingDays') {
      const currentDays = settings.workingDays;
      if (currentDays.includes(day)) {
        onSettingsChange({
          workingDays: currentDays.filter((d) => d !== day),
        });
      } else {
        onSettingsChange({
          workingDays: [...currentDays, day],
        });
      }
    } else {
      const currentDays = silentMode.daysOfWeek || [];
      if (currentDays.includes(day)) {
        onSilentModeChange({
          daysOfWeek: currentDays.filter((d) => d !== day),
        });
      } else {
        onSilentModeChange({
          daysOfWeek: [...currentDays, day],
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Auto Start/End */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Início e Fim Automáticos
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoStart" className="text-sm font-medium">
                Ativar início automático
              </Label>
              <p className="text-xs text-muted-foreground">
                Ativar alarmes recorrentes automaticamente nos horários configurados
              </p>
            </div>
            <Switch
              id="autoStart"
              checked={settings.autoStart}
              onCheckedChange={(checked) => onSettingsChange({ autoStart: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoEnd" className="text-sm font-medium">
                Ativar fim automático
              </Label>
              <p className="text-xs text-muted-foreground">
                Desativar alarmes automaticamente no horário de fim configurado
              </p>
            </div>
            <Switch
              id="autoEnd"
              checked={settings.autoEnd}
              onCheckedChange={(checked) => onSettingsChange({ autoEnd: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>Dias de Trabalho</Label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`working-${day.value}`}
                    checked={settings.workingDays.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value, 'workingDays')}
                  />
                  <Label
                    htmlFor={`working-${day.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Silent Mode */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Modo Silencioso
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="silentMode" className="text-sm font-medium">
                Ativar modo silencioso
              </Label>
              <p className="text-xs text-muted-foreground">
                Silenciar notificações durante horários específicos
              </p>
            </div>
            <Switch
              id="silentMode"
              checked={silentMode.enabled}
              onCheckedChange={(checked) => onSilentModeChange({ enabled: checked })}
            />
          </div>

          {silentMode.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="silentStartTime" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Início
                  </Label>
                  <Input
                    id="silentStartTime"
                    type="time"
                    value={silentMode.startTime}
                    onChange={(e) => onSilentModeChange({ startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="silentEndTime" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Fim
                  </Label>
                  <Input
                    id="silentEndTime"
                    type="time"
                    value={silentMode.endTime}
                    onChange={(e) => onSilentModeChange({ endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dias da Semana (opcional)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Deixe em branco para aplicar todos os dias
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`silent-${day.value}`}
                        checked={silentMode.daysOfWeek?.includes(day.value) || false}
                        onCheckedChange={() => handleDayToggle(day.value, 'silentDays')}
                      />
                      <Label
                        htmlFor={`silent-${day.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {day.short}
                      </Label>
                    </div>
                  ))}
                </div>
                {silentMode.daysOfWeek && silentMode.daysOfWeek.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Aplicando a todos os dias
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CommuteSettings;





