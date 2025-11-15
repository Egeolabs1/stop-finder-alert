import { useState, useEffect, useCallback } from 'react';

export interface AlarmHistory {
  id: string;
  destinationName: string;
  destinationAddress: string;
  destinationLocation: [number, number];
  startLocation: [number, number];
  radius: number;
  triggeredAt: Date;
  distance: number;
  duration?: number;
}

const STORAGE_KEY = 'sonecaz_alarm_history';
const MAX_HISTORY_ITEMS = 100; // Limitar histórico a 100 itens

export const useAlarmHistory = () => {
  const [history, setHistory] = useState<AlarmHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar histórico do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Converter datas de string para Date
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          triggeredAt: new Date(item.triggeredAt),
        }));
        setHistory(historyWithDates);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error loading alarm history:', error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar histórico no localStorage
  const saveHistory = useCallback((newHistory: AlarmHistory[]) => {
    try {
      // Manter apenas os últimos MAX_HISTORY_ITEMS
      const limitedHistory = newHistory.slice(-MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
      setHistory(limitedHistory);
    } catch (error) {
      console.error('Error saving alarm history:', error);
    }
  }, []);

  // Adicionar item ao histórico
  const addToHistory = useCallback(
    (alarm: Omit<AlarmHistory, 'id' | 'triggeredAt'>) => {
      const newItem: AlarmHistory = {
        ...alarm,
        id: `${Date.now()}-${Math.random()}`,
        triggeredAt: new Date(),
      };
      const newHistory = [...history, newItem];
      saveHistory(newHistory);
      return newItem;
    },
    [history, saveHistory]
  );

  // Remover item do histórico
  const removeFromHistory = useCallback(
    (id: string) => {
      const newHistory = history.filter((item) => item.id !== id);
      saveHistory(newHistory);
    },
    [history, saveHistory]
  );

  // Limpar histórico
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  // Obter histórico recente
  const getRecentHistory = useCallback(
    (limit: number = 10) => {
      return [...history]
        .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
        .slice(0, limit);
    },
    [history]
  );

  // Obter estatísticas
  const getStatistics = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    return {
      total: history.length,
      today: history.filter((item) => item.triggeredAt >= today).length,
      thisWeek: history.filter((item) => item.triggeredAt >= thisWeek).length,
      thisMonth: history.filter((item) => item.triggeredAt >= thisMonth).length,
    };
  }, [history]);

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getRecentHistory,
    getStatistics,
  };
};



