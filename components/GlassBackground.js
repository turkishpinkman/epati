// GlassBackground.js — Vibrant gradient arka plan (iOS Liquid Glass)
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/theme';

const { width, height } = Dimensions.get('window');

export default function GlassBackground({ children, style }) {
    const { colors } = useTheme();

    const gradientColors = colors.gradientColors;

    return (
        <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, style]}
        >
            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        width: '100%',
    },
});
