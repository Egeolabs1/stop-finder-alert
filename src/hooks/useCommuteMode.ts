import { useState, useEffect, useCallback } from 'react';
import { CommuteSettings, SilentModeSchedule, DayOfWeek } from '@/types/commute';

const STORAGE_KEY = 'sonecaz_commute_settings';
const SILENT_MODE_STORAGE_KEY = 'sonecaz_silent_mode_schedule';

const DEFAULT_SETTINGS: CommuteSettings = {
  autoStart: false,
  autoEnd: false,
  silentMode: false,
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
};

const DEFAULT_SILENT_MODE: SilentModeSchedule = {
  enabled: false,
  startTime: '22:00',
  endTime: '08:00',
};

export const useCommuteMode = () => {
  const [settings, setSettings] = useState<CommuteSettings>(DEFAULT_SETTINGS);
  const [silentMode, setSilentMode] = useState<SilentModeSchedule>(DEFAULT_SILENT_MODE);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configurações do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      } else {
        setSettings(DEFAULT_SETTINGS);
      }

      const storedSilent = localStorage.getItem(SILENT_MODE_STORAGE_KEY);
      if (storedSilent) {
        setSilentMode(JSON.parse(storedSilent));
      } else {
        setSilentMode(DEFAULT_SILENT_MODE);
      }
    } catch (error) {
      console.error('Error loading commute settings:', error);
      setSettings(DEFAULT_SETTINGS);
      setSilentMode(DEFAULT_SILENT_MODE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar configurações
  const updateSettings = useCallback((newSettings: Partial<CommuteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving commute settings:', error);
    }
  }, [settings]);

  // Salvar modo silencioso
  const updateSilentMode = useCallback((newSilentMode: Partial<SilentModeSchedule>) => {
    const updated = { ...silentMode, ...newSilentMode };
    setSilentMode(updated);
    try {
      localStorage.setItem(SILENT_MODE_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving silent mode:', error);
    }
  }, [silentMode]);

  // Verificar se está em modo silencioso
  const isSilentModeActive = useCallback(() => {
    if (!silentMode.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'lowercase' }) as DayOfWeek;

    // Verificar se é um dia válido
    if (silentMode.daysOfWeek && !silentMode.daysOfWeek.includes(dayOfWeek)) {
      return false;
    }

    // Verificar se está no horário silencioso
    if (silentMode.startTime <= silentMode.endTime) {
      // Horário normal (ex: 22:00 - 08:00 do dia seguinte vira 22:00 - 08:00)
      return currentTime >= silentMode.startTime && currentTime <= silentMode.endTime;
    } else {
      // Horário que cruza meia-noite (ex: 22:00 - 08:00)
      return currentTime >= silentMode.startTime || currentTime <= silentMode.endTime;
    }
  }, [silentMode]);

  // Verificar se é dia de trabalho
  const isWorkingDay = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'lowercase' }) as DayOfWeek;
    return settings.workingDays.includes(dayOfWeek);
  }, [settings.workingDays]);

  return {
    settings,
    silentMode,
    isLoading,
    updateSettings,
    updateSilentMode,
    isSilentModeActive,
    isWorkingDay,
  };
};

