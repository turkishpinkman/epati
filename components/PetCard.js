// PetCard.js — Liquid Glass pet kartı (büyük fotoğraf + cam info panel)
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, PET_TYPE_ICONS, getPetColor, RADIUS, SPACING } from '../utils/theme';
import { getTelegramFileUrl } from '../utils/telegram';
import GlassPanel from './GlassPanel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = SPACING.md;
const MAX_CARD_WIDTH = 520;

export default function PetCard({ pet, onPress, photoUrlOverride }) {
    const { colors } = useTheme();
    const typeInfo = PET_TYPE_ICONS[pet.type] || PET_TYPE_ICONS['Diğer'];
    const petColor = getPetColor(pet.type, colors);
    const [photoUrl, setPhotoUrl] = useState(photoUrlOverride || null);

    useEffect(() => {
        let isMounted = true;

        const resolvePhoto = async () => {
            // HomeScreen'den gelen URL varsa onu kullan
            if (photoUrlOverride) {
                setPhotoUrl(photoUrlOverride);
                return;
            }

            if (pet.photo) {
                try {
                    const url = await getTelegramFileUrl(pet.photo);
                    if (isMounted) {
                        setPhotoUrl(url);
                    }
                } catch {
                    if (isMounted) {
                        setPhotoUrl(null);
                    }
                }
            } else if (isMounted) {
                setPhotoUrl(null);
            }
        };

        resolvePhoto();

        return () => {
            isMounted = false;
        };
    }, [pet.photo, photoUrlOverride]);

    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [spinValue]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const getAge = () => {
        if (!pet.birthDate) return '';
        const birth = new Date(pet.birthDate);
        const now = new Date();
        const years = now.getFullYear() - birth.getFullYear();
        const months = now.getMonth() - birth.getMonth();
        if (years > 0) return `${years} yaş`;
        if (months > 0) return `${months} ay`;
        return 'Yeni doğan';
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={styles.cardWrapper}
        >
            <View style={styles.glowBorderContainer}>
                {/* Dönen Glow Arka Plan */}
                <Animated.View style={[
                    styles.glowAnimated,
                    { transform: [{ rotate: spin }] }
                ]}>
                    <LinearGradient
                        colors={[petColor, 'transparent', petColor]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ flex: 1 }}
                    />
                </Animated.View>

                {/* İçerik */}
                <View style={styles.cardInner}>
                    <GlassPanel borderRadius={RADIUS.xl - 2} noPadding style={styles.card}>
                        {/* Fotoğraf Alanı */}
                        <View style={styles.imageContainer}>
                            {photoUrl ? (
                                <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
                            ) : (
                                <View style={[styles.placeholderImage, { backgroundColor: petColor + '25' }]}>
                                    <MaterialCommunityIcons name={typeInfo.icon} size={72} color={petColor} />
                                </View>
                            )}
                        </View>

                        {/* Alt Bilgi Paneli (koyu cam) */}
                        <View style={styles.infoPanel}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoLeft}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.name} numberOfLines={1}>{pet.name}</Text>
                                        {pet.gender && (
                                            <MaterialCommunityIcons
                                                name={pet.gender === 'Erkek' ? 'gender-male' : 'gender-female'}
                                                size={20}
                                                color={pet.gender === 'Erkek' ? '#5DADE2' : '#FF8EAA'}
                                            />
                                        )}
                                    </View>
                                    <Text style={styles.breed} numberOfLines={1}>
                                        {pet.type}{pet.breed ? ` · ${pet.breed}` : ''}
                                    </Text>
                                    {getAge() ? <Text style={styles.age}>{getAge()}</Text> : null}
                                </View>
                                {pet.weight && (
                                    <View style={styles.weightBadge}>
                                        <Text style={styles.weightText}>{pet.weight} kg</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </GlassPanel>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardWrapper: {
        paddingHorizontal: CARD_HORIZONTAL_PADDING,
        marginBottom: SPACING.md,
        width: '100%',
        alignItems: 'center',
    },
    glowBorderContainer: {
        width: '100%',
        maxWidth: MAX_CARD_WIDTH,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        position: 'relative',
        padding: 2, // Glow kalınlığı
    },
    glowAnimated: {
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        right: '-50%',
        bottom: '-50%',
    },
    cardInner: {
        width: '100%',
        borderRadius: RADIUS.xl - 2,
        overflow: 'hidden',
        backgroundColor: '#020617', // Arkası görünmesin diye arka plan
    },
    card: {
        overflow: 'hidden',
        width: '100%',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 4 / 3,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoPanel: {
        backgroundColor: 'rgba(0,0,0,0.45)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLeft: { flex: 1 },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    breed: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.75)',
        marginTop: 2,
    },
    age: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 1,
    },
    weightBadge: {
        backgroundColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    weightText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});
