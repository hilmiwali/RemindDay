import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

// Create theme context
const ThemeContext = createContext();

// Light theme colors
export const lightTheme = {
  // Main brand colors
  primary: '#6366F1',
  secondary: '#EC4899',
  
  // Background colors
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  
  // Text colors
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  
  // Status colors
  accent: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // UI colors
  border: '#E2E8F0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Special colors
  todayBanner: '#FEF3C7',
  upcomingBg: '#EFF6FF',
};

// Dark theme colors
export const darkTheme = {
  // Main brand colors
  primary: '#818CF8',
  secondary: '#F472B6',
  
  // Background colors
  background: '#0F172A',
  cardBg: '#1E293B',
  
  // Text colors
  textPrimary: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textLight: '#94A3B8',
  
  // Status colors
  accent: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  
  // UI colors
  border: '#334155',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  // Special colors
  todayBanner: '#451A03',
  upcomingBg: '#1E293B',
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleTheme,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};