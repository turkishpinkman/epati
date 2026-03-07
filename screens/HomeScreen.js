// HomeScreen.js — Ana Sayfa
import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, StatusBar, Image, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { loadPets } from '../utils/storage';
import PetCard from '../components/PetCard';

export default function HomeScreen({ navigation }) {
    const { colors, shadows, isDark } = useTheme();
    const [pets, setPets] = useState([]);

    useFocusEffect(
        useCallback(() => {
            const fetchPets = async () => {
                const data = await loadPets();
                setPets(data);
            };
            fetchPets();
        }, [])
    );

    const renderEmpty = () => (
        <View style={s.emptyContainer}>
            <View style={[s.emptyIconCircle, { backgroundColor: colors.primary + '12' }]}>
                <MaterialCommunityIcons name="paw" size={64} color={colors.primary} />
            </View>
            <Text style={[s.emptyTitle, { color: colors.text }]}>Henüz evcil hayvanınız yok</Text>
            <Text style={[s.emptySubtitle, { color: colors.textSecondary }]}>
                İlk patili dostunuzu ekleyerek başlayın!
            </Text>
            <TouchableOpacity
                style={[s.emptyButton, { backgroundColor: colors.primary }, shadows.medium]}
                onPress={() => navigation.navigate('AddEditPet')}
            >
                <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                <Text style={s.emptyButtonText}>Pet Ekle</Text>
            </TouchableOpacity>
        </View>
    );

    const s = makeStyles(colors, shadows);

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={[s.welcomeText, { color: colors.textSecondary }]}>🐾 Hoş Geldin!</Text>
                    <Text style={[s.titleText, { color: colors.text }]}>e-pati</Text>
                </View>
                <View style={s.headerRight}>
                    <View style={[s.statBadge, { backgroundColor: colors.primary + '15' }]}>
                        <MaterialCommunityIcons name="paw" size={16} color={colors.primary} />
                        <Text style={[s.statText, { color: colors.primary }]}>{pets.length}</Text>
                    </View>
                </View>
            </View>

            {/* İstatistik Kartları */}
            {pets.length > 0 && (
                <View style={s.statsRow}>
                    <View style={[s.statCard, { backgroundColor: colors.primary + '15' }]}>
                        <MaterialCommunityIcons name="paw" size={24} color={colors.primary} />
                        <Text style={[s.statCardValue, { color: colors.primary }]}>{pets.length}</Text>
                        <Text style={[s.statCardLabel, { color: colors.textSecondary }]}>Toplam Pet</Text>
                    </View>
                    <View style={[s.statCard, { backgroundColor: colors.secondary + '15' }]}>
                        <MaterialCommunityIcons name="needle" size={24} color={colors.secondary} />
                        <Text style={[s.statCardValue, { color: colors.secondary }]}>
                            {pets.reduce((sum, p) => sum + (p.vaccinations?.length || 0), 0)}
                        </Text>
                        <Text style={[s.statCardLabel, { color: colors.textSecondary }]}>Aşı Kaydı</Text>
                    </View>
                    <View style={[s.statCard, { backgroundColor: colors.info + '15' }]}>
                        <MaterialCommunityIcons name="clipboard-pulse" size={24} color={colors.info} />
                        <Text style={[s.statCardValue, { color: colors.info }]}>
                            {pets.reduce((sum, p) => sum + (p.healthRecords?.length || 0), 0)}
                        </Text>
                        <Text style={[s.statCardLabel, { color: colors.textSecondary }]}>Sağlık</Text>
                    </View>
                </View>
            )}

            {/* Pet Listesi */}
            <FlatList
                data={pets}
                renderItem={({ item }) => (
                    <PetCard
                        pet={item}
                        onPress={() => navigation.navigate('PetDetail', { petId: item.id })}
                    />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={pets.length === 0 ? s.emptyList : s.listContent}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />

            {/* FAB */}
            {pets.length > 0 && (
                <TouchableOpacity
                    style={[s.fab, { backgroundColor: colors.primary }, shadows.large]}
                    onPress={() => navigation.navigate('AddEditPet')}
                    activeOpacity={0.85}
                >
                    <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const makeStyles = (colors, shadows) => StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
    welcomeText: { fontSize: 14 },
    titleText: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    statBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
    statText: { fontSize: 14, fontWeight: '700' },
    statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.md },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.lg, gap: 4 },
    statCardValue: { fontSize: 20, fontWeight: '800' },
    statCardLabel: { fontSize: 11, fontWeight: '600' },
    listContent: { paddingTop: SPACING.sm, paddingBottom: 100 },
    emptyList: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', padding: SPACING.xl },
    emptyIconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: SPACING.sm },
    emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: SPACING.lg },
    emptyButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: SPACING.lg, paddingVertical: 14, borderRadius: RADIUS.xl },
    emptyButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    fab: { position: 'absolute', right: SPACING.lg, bottom: SPACING.xl, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
});
