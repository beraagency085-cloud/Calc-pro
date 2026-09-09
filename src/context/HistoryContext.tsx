import React, { createContext, useContext, useState, useEffect } from 'react';
import { CalculationHistoryItem } from '../types';

interface HistoryContextType {
  history: CalculationHistoryItem[];
  addHistoryItem: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  lastRestoredItem: CalculationHistoryItem | null;
  restoreHistoryItem: (item: CalculationHistoryItem) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const STORAGE_KEY = 'calcpro_calculation_history_v1';

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [lastRestoredItem, setLastRestoredItem] = useState<CalculationHistoryItem | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // storage full or blocked
    }
  }, [history]);

  const addHistoryItem = (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: CalculationHistoryItem = {
      ...item,
      id: `${item.calculatorId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      // Avoid duplicate consecutive identical calculations
      const filtered = prev.filter(
        (h) => !(h.calculatorId === item.calculatorId && h.summary === item.summary)
      );
      // Keep up to 50 most recent calculations
      return [newItem, ...filtered].slice(0, 50);
    });
  };

  const removeHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const restoreHistoryItem = (item: CalculationHistoryItem) => {
    setLastRestoredItem(item);
    setIsHistoryOpen(false);
  };

  return (
    <HistoryContext.Provider
      value={{
        history,
        addHistoryItem,
        removeHistoryItem,
        clearHistory,
        isHistoryOpen,
        setIsHistoryOpen,
        lastRestoredItem,
        restoreHistoryItem,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
