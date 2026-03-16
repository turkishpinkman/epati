// GlassPanel.js — Gerçekçi 3D Cam Panel (iOS Liquid Glass)
import React from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function GlassPanel({
    children,
    style,
    intensity = 50,
    borderRadius = 20,
    tint = 'light', // 'light' | 'dark'
    noPadding = false,
}) {
    const containerStyle = [
        styles.container,
        { borderRadius },
        !noPadding && styles.padding,
        style,
    ];

    // Web: CSS backdrop-filter ile gerçekçi cam efekti
    if (Platform.OS === 'web') {
        const blurAmount = Math.min(intensity * 0.6, 35); // 20-35px tatlı nokta
        const isDark = tint === 'dark';

        return (
            <View style={[
                containerStyle,
                {
                    backgroundColor: isDark
                        ? 'rgba(8, 12, 30, 0.45)'
                        : 'rgba(255, 255, 255, 0.08)',
                    // Blur + saturation — Apple'ın sırrı
                    backdropFilter: `blur(${blurAmount}px) saturate(160%)`,
                    WebkitBackdropFilter: `blur(${blurAmount}px) saturate(160%)`,
                    // İç glow + dış gölge — cam derinliği
                    boxShadow: [
                        // İç ışık dağılımı
                        `inset 0 0 30px rgba(255, 255, 255, 0.06)`,
                        // İç üst kenar parlama
                        `inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
                        // Dış gölge — havada süzülme hissi
                        `0 8px 32px rgba(0, 0, 0, 0.25)`,
                        // Yumuşak dış glow — borderRadius'a uyumlu
                        `0 0 0 0.5px ${isDark ? 'rgba(148,163,184,0.25)' : 'rgba(255,255,255,0.25)'}`,
                    ].join(', '),
                    // Kenar ışık kırılması — borderRadius'a uyumlu basit border
                    borderWidth: 1,
                    borderColor: isDark
                        ? 'rgba(148, 163, 184, 0.18)'
                        : 'rgba(255, 255, 255, 0.20)',
                    position: 'relative',
                    overflow: 'hidden',
                },
            ]}>
                {/* L-şeklinde specular highlight — ışık sol üstten geliyor */}
                <View 
                    pointerEvents="none"
                    style={[StyleSheet.absoluteFill, {
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(200,210,255,0.04) 30%, transparent 60%)',
                        borderRadius,
                    }]} 
                />
                {/* Alt kenar ince yansıma */}
                <View 
                    pointerEvents="none"
                    style={[StyleSheet.absoluteFill, {
                        background: 'linear-gradient(to top, rgba(255,255,255,0.03) 0%, transparent 20%)',
                        borderRadius,
                    }]} 
                />
                {children}
            </View>
        );
    }

    // Native: BlurView + gradient katmanlar ile gerçekçi cam
    return (
        <View style={[{
            borderRadius,
            overflow: 'hidden',
            // iOS shadow — havada süzülme
            ...Platform.select({
                ios: {
                    shadowColor: 'rgba(80, 100, 200, 0.3)',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.35,
                    shadowRadius: 20,
                },
                android: {
                    elevation: 6,
                },
            }),
        }, style]}>
            <BlurView
                intensity={Math.min(intensity, 55)}
                tint={tint === 'dark' ? 'dark' : 'light'}
                style={[styles.blur, !noPadding && styles.padding]}
            >
                {/* Temel cam overlay — hafif mavi/mor tonu */}
                <View style={[
                    styles.overlay,
                    {
                        backgroundColor: tint === 'dark'
                            ? 'rgba(8, 15, 40, 0.30)'
                            : 'rgba(220, 225, 255, 0.10)',
                        borderRadius,
                    },
                ]} />
                {/* Specular highlight — sol üstten gelen ışık */}
                <LinearGradient
                    pointerEvents="none"
                    colors={[
                        'rgba(255, 255, 255, 0.15)',
                        'rgba(200, 210, 255, 0.05)',
                        'transparent',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.7, y: 0.7 }}
                    style={[StyleSheet.absoluteFill, { borderRadius }]}
                />
                {/* Üst kenar ince parlak çizgi */}
                <LinearGradient
                    pointerEvents="none"
                    colors={[
                        'rgba(255, 255, 255, 0.25)',
                        'rgba(255, 255, 255, 0.03)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 1.5,
                        borderTopLeftRadius: borderRadius,
                        borderTopRightRadius: borderRadius,
                    }}
                />
                {/* Kenar ışık kırılması */}
                <View 
                    pointerEvents="none"
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        borderRadius,
                        borderWidth: 1,
                        borderColor: tint === 'dark'
                            ? 'rgba(148, 163, 184, 0.20)'
                            : 'rgba(255, 255, 255, 0.22)',
                    }} 
                />
                {children}
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    blur: {
        overflow: 'hidden',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    padding: {
        padding: 16,
    },
});
