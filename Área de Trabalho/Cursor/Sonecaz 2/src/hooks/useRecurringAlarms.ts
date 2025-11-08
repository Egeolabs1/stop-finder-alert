import { useState, useEffect, useCallback } from 'react';
import { RecurringAlarm, DayOfWeek } from '@/types/commute';

const STORAGE_KEY = 'sonecaz_recurring_alarms';

export const useRecurringAlarms = () => {
  const [alarms, setAlarms] = useState<RecurringAlarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar alarmes do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const alarmsWithDates = parsed.map((alarm: any) => ({
          ...alarm,
          createdAt: new Date(alarm.createdAt),
          updatedAt: new Date(alarm.updatedAt),
        }));
        setAlarms(alarmsWithDates);
      } else {
        setAlarms([]);
      }
    } catch (error) {
      console.error('Error loading recurring alarms:', error);
      setAlarms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar alarmes no localStorage
  const saveAlarms = useCallback((newAlarms: RecurringAlarm[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAlarms));
      setAlarms(newAlarms);
    } catch (error) {
      console.error('Error saving recurring alarms:', error);
    }
  }, []);

  // Adicionar alarme recorrente
  const addAlarm = useCallback(
    (alarm: Omit<RecurringAlarm, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newAlarm: RecurringAlarm = {
        ...alarm,
        id: `${Date.now()}-${Math.random()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const newAlarms = [...alarms, newAlarm];
      saveAlarms(newAlarms);
      return newAlarm;
    },
    [alarms, saveAlarms]
  );

  // Atualizar alarme recorrente
  const updateAlarm = useCallback(
    (id: string, updates: Partial<RecurringAlarm>) => {
      const newAlarms = alarms.map((alarm) =>
        alarm.id === id
          ? { ...alarm, ...updates, updatedAt: new Date() }
          : alarm
      );
      saveAlarms(newAlarms);
    },
    [alarms, saveAlarms]
  );

  // Remover alarme recorrente
  const removeAlarm = useCallback(
    (id: string) => {
      const newAlarms = alarms.filter((alarm) => alarm.id !== id);
      saveAlarms(newAlarms);
    },
    [alarms, saveAlarms]
  );

  // Obter alarmes ativos para hoje
  const getActiveAlarmsForToday = useCallback(() => {
    const today = new Date();
    // Obter dia da semana corretamente (0 = domingo, 1 = segunda, etc.)
    const dayIndex = today.getDay();
    const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[dayIndex];
    
    return alarms.filter((alarm) => {
      if (!alarm.enabled) return false;
      if (!alarm.daysOfWeek.includes(dayOfWeek)) return false;
      
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Verificar se está no horário de início
      if (currentTime >= alarm.startTime) {
        // Se tem horário de fim, verificar se ainda está dentro
        if (alarm.endTime) {
          return currentTime <= alarm.endTime;
        }
        return true;
      }
      
      return false;
    });
  }, [alarms]);

  // Obter próximo alarme
  const getNextAlarm = useCallback(() => {
    const today = new Date();
    // Obter dia da semana corretamente (0 = domingo, 1 = segunda, etc.)
    const dayIndex = today.getDay();
    const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[dayIndex];
    const currentTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    
    const enabledAlarms = alarms.filter((alarm) => alarm.enabled);
    if (enabledAlarms.length === 0) return null;

    // Procurar no dia atual
    const todayAlarms = enabledAlarms.filter((alarm) => 
      alarm.daysOfWeek.includes(dayOfWeek) && alarm.startTime > currentTime
    );
    
    if (todayAlarms.length > 0) {
      return todayAlarms.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
    }

    // Procurar nos próximos dias
    const daysOfWeekOrder: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayIndex = daysOfWeekOrder.indexOf(dayOfWeek);
    
    for (let i = 1; i < 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDay = daysOfWeekOrder[nextDayIndex];
      
      const nextDayAlarms = enabledAlarms.filter((alarm) => 
        alarm.daysOfWeek.includes(nextDay)
      );
      
      if (nextDayAlarms.length > 0) {
        return nextDayAlarms.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
      }
    }

    return null;
  }, [alarms]);

  return {
    alarms,
    isLoading,
    addAlarm,
    updateAlarm,
    removeAlarm,
    getActiveAlarmsForToday,
    getNextAlarm,
  };
};

