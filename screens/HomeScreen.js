// HomeScreen.js — Ana Sayfa (iOS Liquid Glass Tasarım)
import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, StatusBar, Image, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { loadPets } from '../utils/storage';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';
import PetCard from '../components/PetCard';
import { batchResolveTelegramUrls } from '../utils/telegram';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const { colors, shadows, isDark } = useTheme();
    const [pets, setPets] = useState([]);
    const [photoUrlMap, setPhotoUrlMap] = useState({});

    useFocusEffect(
        useCallback(() => {
            const fetchPets = async () => {
                const data = await loadPets();
                setPets(data);

                // Telegram fotoğraflarını toplu ve cache'li şekilde çözüyoruz
                const telegramIds = data
                    .map((p) => p.photo)
                    .filter(Boolean);

                if (telegramIds.length > 0) {
                    try {
                        const map = {};
                        const resultMap = await batchResolveTelegramUrls(telegramIds);
                        resultMap.forEach((url, fileId) => {
                            map[fileId] = url;
                        });
                        setPhotoUrlMap(map);
                    } catch {
                        setPhotoUrlMap({});
                    }
                } else {
                    setPhotoUrlMap({});
                }
            };
            fetchPets();
        }, [])
    );

    const vaccCount = pets.reduce((sum, p) => sum + (p.vaccinations?.length || 0), 0);
    const healthCount = pets.reduce((sum, p) => sum + (p.healthRecords?.length || 0), 0);

    const s = makeStyles(colors, isDark);

    const renderEmpty = () => (
        <View style={s.emptyContainer}>
            <GlassPanel borderRadius={RADIUS.xl} style={s.emptyPanelOuter}>
                <View style={s.emptyPanelInner}>
                    <View style={s.emptyIconCircle}>
                        <MaterialCommunityIcons name="paw" size={64} color="rgba(255,255,255,0.9)" />
                    </View>
                    <Text style={s.emptyTitle}>Henüz evcil hayvanınız yok</Text>
                    <Text style={s.emptySubtitle}>
                        İlk patili dostunuzu ekleyerek başlayın!
                    </Text>
                    <TouchableOpacity
                        style={s.emptyButton}
                        onPress={() => navigation.navigate('AddEditPet')}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                        <Text style={s.emptyButtonText}>Pet Ekle</Text>
                    </TouchableOpacity>
                </View>
            </GlassPanel>
        </View>
    );

    return (
        <GlassBackground>
            <SafeAreaView style={s.container}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

                {/* Glass Header */}
                <GlassPanel borderRadius={RADIUS.xl} style={s.headerPanel}>
                    <View style={s.headerRow}>
                        <View>
                            <Text style={s.welcomeText}>Hoş Geldin!</Text>
                            <Text style={s.titleText}>e-pati</Text>
                        </View>
                        {pets.length > 0 && (
                            <View style={s.petCountChip}>
                                <MaterialCommunityIcons name="paw" size={18} color="#FFF" />
                                <Text style={s.petCountText}>{pets.length} pet</Text>
                            </View>
                        )}
                    </View>
                </GlassPanel>

                {/* İstatistik Bubbles */}
                {pets.length > 0 && (
                    <View style={s.statsRow}>
                        {[
                            { icon: 'paw', count: pets.length, color: '#FF6B6B', label: 'Pet' },
                            { icon: 'needle', count: vaccCount, color: '#4ECDC4', label: 'Aşı' },
                            { icon: 'clipboard-pulse', count: healthCount, color: '#3498DB', label: 'Kayıt' },
                        ].map((stat, i) => (
                            <View key={i} style={s.statBubbleWrap}>
                                <GlassPanel borderRadius={999} noPadding style={s.statBubble}>
                                    <View style={s.statInner}>
                                        <MaterialCommunityIcons name={stat.icon} size={22} color={stat.color} />
                                        <Text style={s.statCountText}>{stat.count}</Text>
                                        <Text style={s.statLabelText}>{stat.label}</Text>
                                    </View>
                                </GlassPanel>
                            </View>
                        ))}
                    </View>
                )}

                {/* Pet Listesi */}
                <FlatList
                    data={pets}
                    renderItem={({ item }) => (
                        <PetCard
                            pet={item}
                            photoUrlOverride={item.photo ? photoUrlMap[item.photo] : null}
                            onPress={() => navigation.navigate('PetDetail', { petId: item.id })}
                        />
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={pets.length === 0 ? s.emptyList : s.listContent}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                />

            </SafeAreaView>
        </GlassBackground>
    );
}

const makeStyles = (colors, isDark) => StyleSheet.create({
    container: { flex: 1 },

    // Header
    headerPanel: { marginHorizontal: SPACING.md, marginTop: SPACING.sm },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    welcomeText: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
    titleText: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
    petCountChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: 'rgba(15,23,42,0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        gap: 6,
    },
    petCountText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
        paddingHorizontal: SPACING.lg,
    },
    statBubbleWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    statBubble: {
        width: 90,
        height: 90,
    },
    statInner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    statCountText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    statLabelText: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 12,
        fontWeight: '600',
    },

    // List
    listContent: { paddingTop: SPACING.sm, paddingBottom: 100 },
    emptyList: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Empty
    emptyContainer: { alignItems: 'center', paddingHorizontal: SPACING.lg },
    emptyPanelOuter: { width: '100%' },
    emptyPanelInner: { alignItems: 'center' },
    emptyIconCircle: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: SPACING.sm },
    emptySubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: SPACING.lg },
    emptyButton: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: colors.primary,
        paddingHorizontal: SPACING.lg, paddingVertical: 14,
        borderRadius: RADIUS.xl,
    },
    emptyButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

});
