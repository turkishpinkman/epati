// e-pati Tema Sistemi — Açık & Koyu Mod + Liquid Glass tokenleri
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@epati_theme';

// Renkler
const lightColors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#22C55E',
  secondaryLight: '#4ADE80',
  accent: '#FACC15',
  accentOrange: '#FB923C',

  background: '#020617',
  surface: '#020617',
  surfaceAlt: '#0F172A',

  text: '#E5E7EB',
  textSecondary: '#9CA3AF',
  textLight: '#6B7280',
  textWhite: '#FFFFFF',

  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
  info: '#38BDF8',

  border: '#1F2937',
  divider: '#111827',
  shadow: '#020617',

  cat: '#F97316',
  dog: '#22C55E',
  bird: '#FACC15',
  fish: '#38BDF8',
  rabbit: '#E879F9',
  other: '#F97316',

  statusBar: 'light-content',
  navBar: '#020617',

  // Liquid Glass tokenleri
  glassBackground: 'rgba(15,23,42,0.75)',
  glassBorder: 'rgba(148,163,184,0.45)',
  glassOverlay: 'rgba(15,23,42,0.65)',
  glassDark: 'rgba(15,23,42,0.85)',
  glassDarkBorder: 'rgba(148,163,184,0.55)',
  glassText: '#FFFFFF',
  glassTextSecondary: 'rgba(226,232,240,0.85)',
  glassTextMuted: 'rgba(148,163,184,0.75)',
  gradientColors: ['#0F172A', '#1D4ED8', '#7C3AED', '#EC4899'],
};

const darkColors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#22C55E',
  secondaryLight: '#4ADE80',
  accent: '#FACC15',
  accentOrange: '#FB923C',

  background: '#020617',
  surface: '#020617',
  surfaceAlt: '#0B1220',

  text: '#E5E7EB',
  textSecondary: '#9CA3AF',
  textLight: '#6B7280',
  textWhite: '#FFFFFF',

  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
  info: '#38BDF8',

  border: '#1F2937',
  divider: '#111827',
  shadow: '#000000',

  cat: '#F97316',
  dog: '#22C55E',
  bird: '#FACC15',
  fish: '#38BDF8',
  rabbit: '#E879F9',
  other: '#F97316',

  statusBar: 'light-content',
  navBar: '#020617',

  // Liquid Glass tokenleri (koyu mod)
  glassBackground: 'rgba(15,23,42,0.85)',
  glassBorder: 'rgba(148,163,184,0.55)',
  glassOverlay: 'rgba(15,23,42,0.75)',
  glassDark: 'rgba(15,23,42,0.95)',
  glassDarkBorder: 'rgba(148,163,184,0.65)',
  glassText: '#FFFFFF',
  glassTextSecondary: 'rgba(226,232,240,0.9)',
  glassTextMuted: 'rgba(148,163,184,0.8)',
  gradientColors: ['#020617', '#020617', '#111827', '#1E293B'],
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
  const isDark = true; // Sadece Koyu Mod (Kullanıcı İsteği)

  const toggleTheme = async () => {
    // Koyu mod kalıcı, toggle pasif
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

// Eski uyumluluk için (import eden dosyalar bozulmasın, kalıcı darkColors)
export const COLORS = darkColors;
export const SHADOWS = getShadows(darkColors);
export const TYPOGRAPHY = {
  hero: { fontSize: 32, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '500' },
  small: { fontSize: 11, fontWeight: '600' },
};
