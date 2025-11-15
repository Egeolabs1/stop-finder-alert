import { useState, useEffect, useCallback } from 'react';
import { setCompressedItem, getCompressedItem } from '@/utils/compression';

export type AlarmSoundType = 'beep' | 'buzzer' | 'bell' | 'alert' | 'chime';

export interface AppSettings {
  defaultRadius: number;
  enableNearbyAlerts: boolean;
  nearbyAlertRadius: number;
  enableHaptics: boolean;
  enableNotifications: boolean;
  alertCooldown: number; // em segundos
  alarmSound: AlarmSoundType;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultRadius: 500,
  enableNearbyAlerts: true,
  nearbyAlertRadius: 500,
  enableHaptics: true,
  enableNotifications: true,
  alertCooldown: 60, // 60 segundos
  alarmSound: 'beep',
};

const STORAGE_KEY = 'sonecaz_settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configurações do localStorage (com suporte a compressão)
  useEffect(() => {
    try {
      // Tentar ler com compressão primeiro
      const compressed = getCompressedItem<AppSettings>(STORAGE_KEY);
      if (compressed) {
        setSettings({ ...DEFAULT_SETTINGS, ...compressed });
        setIsLoading(false);
        return;
      }

      // Fallback: ler sem compressão
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge com defaults para garantir que novas propriedades existam
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar configurações com compressão se necessário
  const saveSettings = useCallback((newSettings: AppSettings) => {
    try {
      const serialized = JSON.stringify(newSettings);
      // Usar compressão se os dados forem grandes
      if (serialized.length > 1024) {
        setCompressedItem(STORAGE_KEY, newSettings);
      } else {
        localStorage.setItem(STORAGE_KEY, serialized);
      }
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, []);

  // Atualizar uma configuração específica
  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  return {
    settings,
    isLoading,
    updateSetting,
    saveSettings,
    DEFAULT_SETTINGS,
  };
};
