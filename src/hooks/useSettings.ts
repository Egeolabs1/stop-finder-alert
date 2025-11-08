import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  defaultRadius: number;
  enableNearbyAlerts: boolean;
  nearbyAlertRadius: number;
  enableHaptics: boolean;
  enableNotifications: boolean;
  alertCooldown: number; // em minutos
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultRadius: 500,
  enableNearbyAlerts: true,
  nearbyAlertRadius: 500,
  enableHaptics: true,
  enableNotifications: true,
  alertCooldown: 1,
};

const STORAGE_KEY = 'sonecaz_settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configurações do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar configurações
  const saveSettings = useCallback((newSettings: AppSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
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



