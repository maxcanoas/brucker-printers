import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from '../lib/theme';

const THEME_KEY = '@theme_preference';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState('system'); // 'dark' | 'light' | 'system'
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val) setPreferenceState(val);
      setLoaded(true);
    });
  }, []);

  const setPreference = (pref) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(THEME_KEY, pref);
  };

  const themeMode = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'light' ? 'light' : 'dark';
    }
    return preference;
  }, [preference, systemScheme]);

  const colors = themeMode === 'dark' ? darkColors : lightColors;

  const value = useMemo(() => ({
    colors,
    themeMode,
    preference,
    setPreference,
  }), [colors, themeMode, preference]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
