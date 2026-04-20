import React, { createContext, useContext, useEffect, useState } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // Try to load currency from LocalStorage, fallback to USD
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('subtrack_currency') || 'USD';
  });

  // Whenever currency changes, save it to LocalStorage
  useEffect(() => {
    localStorage.setItem('subtrack_currency', currency);
  }, [currency]);

  return (
    <SettingsContext.Provider value={{ currency, setCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
