import { useColorScheme as _useColorScheme } from 'react-native';
import { useEffect, useState, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';

// Create context to share theme state across app
type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  setColorScheme: (theme: 'light' | 'dark') => void;
  isLoading: boolean;
};

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  setColorScheme: () => {},
  isLoading: true,
});

// Provider component to wrap around app
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = _useColorScheme();
  const [storedTheme, setStoredTheme] = useState<'light' | 'dark' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load the user's theme preference from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setStoredTheme(savedTheme);
        }
        setIsLoading(false);
      } catch (e) {
        console.error('Failed to load the theme preference.', e);
        setIsLoading(false);
      }
    };
    
    loadTheme();
  }, []);

  // Function to save the theme preference
  const setColorScheme = async (theme: 'light' | 'dark') => {
    try {
      await AsyncStorage.setItem('theme', theme);
      setStoredTheme(theme);
    } catch (e) {
      console.error('Failed to save the theme preference.', e);
    }
  };

  const colorScheme = storedTheme || systemColorScheme || 'light';
  
  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme values
export function useColorScheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useColorScheme must be used within a ThemeProvider');
  }
  
  return context.colorScheme;
}

// Hook to access theme setter
export function useThemeControl() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useThemeControl must be used within a ThemeProvider');
  }
  
  return {
    colorScheme: context.colorScheme,
    setColorScheme: context.setColorScheme,
    isLoading: context.isLoading
  };
}