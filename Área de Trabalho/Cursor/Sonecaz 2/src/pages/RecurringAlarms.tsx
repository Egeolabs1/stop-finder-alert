import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Calendar, Clock, MapPin, Radio, Trash2, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useRecurringAlarms } from '@/hooks/useRecurringAlarms';
import RecurringAlarmModal from '@/components/RecurringAlarmModal';
import { RecurringAlarm } from '@/types/commute';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const RecurringAlarms = () => {
  const navigate = useNavigate();
  const { alarms, isLoading, addAlarm, removeAlarm, updateAlarm } = useRecurringAlarms();
  const [showModal, setShowModal] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<RecurringAlarm | undefined>();
  const [selectedFavorite, setSelectedFavorite] = useState<{
    name: string;
    address: string;
    location: [number, number];
  } | null>(null);

  const handleAddAlarm = () => {
    setEditingAlarm(undefined);
    setSelectedFavorite(null);
    setShowModal(true);
  };

  const handleEditAlarm = (alarm: RecurringAlarm) => {
    setEditingAlarm(alarm);
    setSelectedFavorite(alarm.destination);
    setShowModal(true);
  };

  const handleSaveAlarm = (alarmData: Omit<RecurringAlarm, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingAlarm) {
      updateAlarm(editingAlarm.id, alarmData);
      toast.success('Alarme recorrente atualizado!');
    } else {
      addAlarm(alarmData);
      toast.success('Alarme recorrente criado!');
    }
    setShowModal(false);
    setEditingAlarm(undefined);
    setSelectedFavorite(null);
  };

  const handleToggleAlarm = (alarm: RecurringAlarm) => {
    updateAlarm(alarm.id, { enabled: !alarm.enabled });
    toast.success(`Alarme ${alarm.enabled ? 'desativado' : 'ativado'}!`);
  };

  const formatDays = (days: string[]) => {
    const dayMap: Record<string, string> = {
      monday: 'Seg',
      tuesday: 'Ter',
      wednesday: 'Qua',
      thursday: 'Qui',
      friday: 'Sex',
      saturday: 'Sáb',
      sunday: 'Dom',
    };
    return days.map((day) => dayMap[day] || day).join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando alarmes recorrentes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 pb-safe">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button onClick={handleAddAlarm} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Alarme
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Alarmes Recorrentes</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure alarmes que se ativam automaticamente em horários específicos
          </p>
        </div>

        {/* Alarms List */}
        {alarms.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Nenhum alarme recorrente
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Crie alarmes que se ativam automaticamente em dias e horários específicos
            </p>
            <Button onClick={handleAddAlarm}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Alarme
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {alarms.map((alarm) => (
              <Card key={alarm.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Radio className={`w-5 h-5 ${alarm.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h3 className="font-semibold text-foreground">{alarm.name}</h3>
                      {alarm.enabled ? (
                        <ToggleRight className="w-5 h-5 text-primary" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {alarm.destination.address}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDays(alarm.daysOfWeek)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alarm.startTime}
                        {alarm.endTime && ` - ${alarm.endTime}`}
                      </span>
                      <span>Raio: {alarm.radius >= 1000 ? `${(alarm.radius / 1000).toFixed(1)} km` : `${alarm.radius} m`}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAlarm(alarm)}
                      className={alarm.enabled ? 'text-primary' : 'text-muted-foreground'}
                    >
                      {alarm.enabled ? 'Desativar' : 'Ativar'}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          ⋯
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditAlarm(alarm)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (confirm('Tem certeza que deseja remover este alarme recorrente?')) {
                              removeAlarm(alarm.id);
                              toast.success('Alarme removido!');
                            }
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>Dica:</strong> Os alarmes recorrentes serão ativados automaticamente nos horários e dias configurados. Certifique-se de ter o modo "Início automático" habilitado nas configurações.
          </p>
        </Card>
      </div>

      {/* Modal */}
      <RecurringAlarmModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAlarm(undefined);
          setSelectedFavorite(null);
        }}
        onSave={handleSaveAlarm}
        initialData={selectedFavorite ? {
          name: selectedFavorite.name,
          destination: selectedFavorite,
          radius: 500,
        } : undefined}
        alarm={editingAlarm}
      />
    </div>
  );
};

export default RecurringAlarms;

