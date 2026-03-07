// e-pati Tema Sistemi — Açık & Koyu Mod
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@epati_theme';

// Renkler
const lightColors = {
  primary: '#FF6B6B',
  primaryLight: '#FF8E8E',
  primaryDark: '#E05555',
  secondary: '#4ECDC4',
  secondaryLight: '#7EDDD6',
  accent: '#FFE66D',
  accentOrange: '#FFA07A',

  background: '#FFF9F5',
  surface: '#FFFFFF',
  surfaceAlt: '#FFF0EB',

  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#BDC3C7',
  textWhite: '#FFFFFF',

  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',

  border: '#F0E6E0',
  divider: '#F5EDE8',
  shadow: '#2C3E50',

  cat: '#FF6B6B',
  dog: '#4ECDC4',
  bird: '#FFE66D',
  fish: '#3498DB',
  rabbit: '#E8A0BF',
  other: '#FFA07A',

  statusBar: 'dark-content',
  navBar: '#FFF9F5',
};

const darkColors = {
  primary: '#FF6B6B',
  primaryLight: '#FF8E8E',
  primaryDark: '#E05555',
  secondary: '#4ECDC4',
  secondaryLight: '#7EDDD6',
  accent: '#FFE66D',
  accentOrange: '#FFA07A',

  background: '#121216',
  surface: '#1E1E24',
  surfaceAlt: '#28282F',

  text: '#EAEAEF',
  textSecondary: '#9595A0',
  textLight: '#5A5A65',
  textWhite: '#FFFFFF',

  success: '#2ECC71',
  warning: '#F1C40F',
  danger: '#E74C3C',
  info: '#5DADE2',

  border: '#2A2A32',
  divider: '#232328',
  shadow: '#000000',

  cat: '#FF6B6B',
  dog: '#4ECDC4',
  bird: '#FFE66D',
  fish: '#5DADE2',
  rabbit: '#E8A0BF',
  other: '#FFA07A',

  statusBar: 'light-content',
  navBar: '#121216',
};

export const PET_TYPE_ICONS = {
  'Kedi': { icon: 'cat', library: 'MaterialCommunityIcons' },
  'Köpek': { icon: 'dog', library: 'MaterialCommunityIcons' },
  'Kuş': { icon: 'bird', library: 'MaterialCommunityIcons' },
  'Balık': { icon: 'fish', library: 'MaterialCommunityIcons' },
  'Tavşan': { icon: 'rabbit', library: 'MaterialCommunityIcons' },
  'Diğer': { icon: 'paw', library: 'MaterialCommunityIcons' },
};

export const getPetColor = (type, colors) => {
  const map = { 'Kedi': colors.cat, 'Köpek': colors.dog, 'Kuş': colors.bird, 'Balık': colors.fish, 'Tavşan': colors.rabbit };
  return map[type] || colors.other;
};

export const PET_TYPES = ['Kedi', 'Köpek', 'Kuş', 'Balık', 'Tavşan', 'Diğer'];
export const GENDERS = ['Erkek', 'Dişi'];

export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const RADIUS = { sm: 8, md: 14, lg: 20, xl: 28, full: 999 };

export const getShadows = (colors) => ({
  small: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  medium: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  large: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
});

// Context
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  };

  const colors = isDark ? darkColors : lightColors;
  const shadows = getShadows(colors);

  return (
    <ThemeContext.Provider value={{ colors, shadows, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Eski uyumluluk için (import eden dosyalar bozulmasın)
export const COLORS = lightColors;
export const SHADOWS = getShadows(lightColors);
export const TYPOGRAPHY = {
  hero: { fontSize: 32, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '500' },
  small: { fontSize: 11, fontWeight: '600' },
};
