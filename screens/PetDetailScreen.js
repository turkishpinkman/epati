// PetDetailScreen.js — Pet Detay Sayfası (Liquid Glass)
import React, { useState, useCallback } from 'react';
import {
    View, Text, Image, ScrollView, TouchableOpacity,
    StyleSheet, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, PET_TYPE_ICONS, getPetColor, SPACING, RADIUS } from '../utils/theme';
import { loadPet, deletePet } from '../utils/storage';
import { getTelegramFileUrl } from '../utils/telegram';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';
import QRIDCard from '../components/QRIDCard';
import { setLastActivePet } from '../utils/activePet';

export default function PetDetailScreen({ navigation, route }) {
    const { petId } = route.params;
    const { colors, shadows } = useTheme();
    const [pet, setPet] = useState(null);
    const [showIDCard, setShowIDCard] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const fetchPet = async () => {
                const found = await loadPet(petId);
                setPet(found || null);
                if (found) {
                    setLastActivePet(petId, found.name);
                }
                if (found?.photo) {
                    try {
                        let url = await getTelegramFileUrl(found.photo);

                        // İlk deneme null dönerse hafif bir tekrar denemesi yap
                        if (!url) {
                            url = await getTelegramFileUrl(found.photo);
                        }

                        setPhotoUrl(url || null);
                    } catch {
                        setPhotoUrl(null);
                    }
                } else {
                    setPhotoUrl(null);
                }
            };
            fetchPet();
        }, [petId])
    );

    const handleDelete = () => {
        Alert.alert('Sil', `${pet.name} silinsin mi? Bu işlem geri alınamaz.`, [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: async () => { await deletePet(petId); navigation.goBack(); } },
        ]);
    };

    if (!pet) {
        return (
            <GlassBackground>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="loading" size={32} color="#FFF" />
                </View>
            </GlassBackground>
        );
    }

    const typeInfo = PET_TYPE_ICONS[pet.type] || PET_TYPE_ICONS['Diğer'];
    const petColor = getPetColor(pet.type, colors);

    const getAge = () => {
        if (!pet.birthDate) return '—';
        const birth = new Date(pet.birthDate);
        const now = new Date();
        const years = now.getFullYear() - birth.getFullYear();
        const months = now.getMonth() - birth.getMonth();
        if (years > 0) return `${years} yaş`;
        if (months > 0) return `${months} ay`;
        return 'Yeni doğan';
    };

    const vaccCount = pet.vaccinations?.length || 0;
    const healthCount = pet.healthRecords?.length || 0;
    const galleryCount = pet.gallery?.length || 0;
    const weightCount = pet.weightHistory?.length || 0;
    const nutritionCount = pet.nutritionLog?.length || 0;

    return (
        <GlassBackground>
            <SafeAreaView style={s.container} edges={['bottom']}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Hero Header */}
                    <View style={s.heroHeader}>
                        {/* Glow Ring Wrapper */}
                        <View style={[
                            s.glowRing,
                            Platform.OS === 'web' ? {
                                boxShadow: [
                                    `0 0 20px ${petColor}50`,
                                    `0 0 40px ${petColor}30`,
                                    `0 0 60px ${petColor}15`,
                                    `inset 0 0 15px ${petColor}20`,
                                ].join(', '),
                            } : {
                                shadowColor: petColor,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.6,
                                shadowRadius: 20,
                                elevation: 12,
                            },
                            { borderColor: petColor + '55' },
                        ]}>
                            {photoUrl ? (
                                <Image source={{ uri: photoUrl }} style={s.heroPhoto} />
                            ) : (
                                <View style={[s.heroPhotoPlaceholder, { backgroundColor: petColor + '30' }]}>
                                    <MaterialCommunityIcons name={typeInfo.icon} size={56} color={petColor} />
                                </View>
                            )}
                        </View>
                        <Text style={s.heroName}>{pet.name}</Text>
                        <View style={s.heroBadges}>
                            <View style={s.heroBadge}>
                                <MaterialCommunityIcons name={typeInfo.icon} size={14} color={petColor} />
                                <Text style={[s.heroBadgeText, { color: petColor }]}>{pet.type}</Text>
                            </View>
                            {pet.breed ? (
                                <View style={s.heroBadge}>
                                    <Text style={[s.heroBadgeText, { color: colors.secondary }]}>{pet.breed}</Text>
                                </View>
                            ) : null}
                            {pet.gender ? (
                                <View style={s.heroBadge}>
                                    <MaterialCommunityIcons name={pet.gender === 'Erkek' ? 'gender-male' : 'gender-female'} size={14} color={pet.gender === 'Erkek' ? '#5DADE2' : '#FF8EAA'} />
                                    <Text style={[s.heroBadgeText, { color: pet.gender === 'Erkek' ? '#5DADE2' : '#FF8EAA' }]}>{pet.gender}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <GlassPanel borderRadius={RADIUS.lg} style={s.quickStatsOuter} noPadding>
                        <View style={s.quickStatsInner}>
                            <View style={s.quickStatItem}>
                                <Text style={s.quickStatValue}>{getAge()}</Text>
                                <Text style={s.quickStatLabel}>Yaş</Text>
                            </View>
                            <View style={s.quickStatDivider} />
                            <View style={s.quickStatItem}>
                                <Text style={s.quickStatValue}>{pet.weight ? `${pet.weight} kg` : '—'}</Text>
                                <Text style={s.quickStatLabel}>Kilo</Text>
                            </View>
                            <View style={s.quickStatDivider} />
                            <View style={s.quickStatItem}>
                                <Text style={s.quickStatValue}>{vaccCount}</Text>
                                <Text style={s.quickStatLabel}>Aşı</Text>
                            </View>
                        </View>
                    </GlassPanel>

                    {/* Bilgi Kartları */}
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>Genel Bilgiler</Text>
                        <GlassPanel borderRadius={RADIUS.lg} noPadding>
                            {[
                                { icon: 'calendar-heart', label: 'Doğum Tarihi', value: pet.birthDate || '—', color: colors.accentOrange },
                                { icon: 'palette', label: 'Renk', value: pet.color || '—', color: colors.accent },
                                { icon: 'chip', label: 'Mikroçip', value: pet.microchip || '—', color: colors.info },
                            ].map((item, i) => (
                                <View key={i} style={[s.infoRow, i === 2 && { borderBottomWidth: 0 }]}>
                                    <View style={s.infoRowLeft}>
                                        <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                                        <Text style={s.infoLabel}>{item.label}</Text>
                                    </View>
                                    <Text style={s.infoValue}>{item.value}</Text>
                                </View>
                            ))}
                        </GlassPanel>
                    </View>

                    {/* Acil Durum */}
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>Acil Durum & Veteriner</Text>
                        <GlassPanel borderRadius={RADIUS.lg} noPadding>
                            {[
                                { icon: 'doctor', label: 'Veteriner', value: pet.vetName || '—', color: colors.success },
                                { icon: 'phone', label: 'Vet Telefon', value: pet.vetPhone || '—', color: colors.success },
                                { icon: 'alert-circle', label: 'Alerjiler', value: pet.allergies || 'Bilinen alerji yok', color: colors.danger },
                            ].map((item, i) => (
                                <View key={i} style={[s.infoRow, i === 2 && { borderBottomWidth: 0 }]}>
                                    <View style={s.infoRowLeft}>
                                        <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                                        <Text style={s.infoLabel}>{item.label}</Text>
                                    </View>
                                    <Text style={[s.infoValue, { maxWidth: '50%' }]} numberOfLines={2}>{item.value}</Text>
                                </View>
                            ))}
                        </GlassPanel>
                    </View>

                    {/* Notlar */}
                    {pet.notes ? (
                        <View style={s.section}>
                            <Text style={s.sectionTitle}>Notlar</Text>
                            <GlassPanel borderRadius={RADIUS.lg}>
                                <Text style={s.notesText}>{pet.notes}</Text>
                            </GlassPanel>
                        </View>
                    ) : null}

                    {/* Aksiyonlar */}
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>İşlemler</Text>
                        <View style={s.actionGrid}>
                            {[
                                { icon: 'needle', label: 'Aşılar', count: `${vaccCount} kayıt`, color: colors.secondary, screen: 'Vaccinations' },
                                { icon: 'clipboard-pulse', label: 'Sağlık', count: `${healthCount} kayıt`, color: colors.info, screen: 'HealthRecords' },
                                { icon: 'scale-bathroom', label: 'Kilo', count: `${weightCount} kayıt`, color: colors.primary, screen: 'Weight' },
                                { icon: 'food-drumstick', label: 'Beslenme', count: `${nutritionCount} kayıt`, color: colors.accentOrange, screen: 'Nutrition' },
                                { icon: 'image-multiple', label: 'Galeri', count: `${galleryCount} fotoğraf`, color: colors.info, screen: 'PhotoGallery' },
                                { icon: 'qrcode', label: 'Kimlik', count: 'QR Kart', color: petColor, screen: null },
                            ].map((action, i) => (
                                <TouchableOpacity
                                    key={i}
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        action.screen
                                            ? navigation.navigate(action.screen, { petId: pet.id, petName: pet.name })
                                            : setShowIDCard(!showIDCard)
                                    }
                                >
                                    <GlassPanel borderRadius={RADIUS.lg} style={s.actionCardOuter} noPadding>
                                        <View style={s.actionCardInner}>
                                            <MaterialCommunityIcons name={action.icon} size={28} color={action.color} />
                                            <Text style={s.actionText}>{action.label}</Text>
                                            <Text style={s.actionCount}>{action.count}</Text>
                                        </View>
                                    </GlassPanel>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* QR ID Kartı */}
                    {showIDCard && (
                        <View style={s.section}>
                            <Text style={s.sectionTitle}>Dijital Kimlik Kartı</Text>
                            <QRIDCard pet={pet} />
                        </View>
                    )}

                    {/* Düzenle + Sil */}
                    <View style={s.bottomActions}>
                        <TouchableOpacity style={s.editButton}
                            onPress={() => navigation.navigate('AddEditPet', { petId: pet.id })}
                            activeOpacity={0.85}>
                            <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
                            <Text style={s.editButtonText}>Düzenle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
                            <MaterialCommunityIcons name="delete-outline" size={20} color={colors.danger} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </GlassBackground>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    heroHeader: { alignItems: 'center', paddingTop: 80, paddingBottom: SPACING.xl },
    glowRing: {
        width: 132,
        height: 132,
        borderRadius: 66,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2.5,
        backgroundColor: 'transparent',
    },
    heroPhoto: { width: 118, height: 118, borderRadius: 59, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
    heroPhotoPlaceholder: { width: 118, height: 118, borderRadius: 59, justifyContent: 'center', alignItems: 'center' },
    heroName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginTop: SPACING.md },
    heroBadges: { flexDirection: 'row', gap: 8, marginTop: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center' },
    heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    heroBadgeText: { fontSize: 12, fontWeight: '600' },

    quickStatsOuter: { marginHorizontal: SPACING.md },
    quickStatsInner: { flexDirection: 'row', padding: SPACING.md },
    quickStatItem: { flex: 1, alignItems: 'center' },
    quickStatValue: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
    quickStatLabel: { fontSize: 12, marginTop: 2, color: 'rgba(255,255,255,0.65)' },
    quickStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

    section: { marginTop: SPACING.lg, paddingHorizontal: SPACING.md },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm, color: '#FFFFFF' },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.12)' },
    infoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },

    notesText: { fontSize: 14, lineHeight: 22, color: 'rgba(255,255,255,0.85)' },

    actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center' },
    actionCardOuter: { width: '31%', minWidth: 100, marginBottom: SPACING.xs },
    actionCardInner: { alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.xs },
    actionText: { fontSize: 13, fontWeight: '700', marginTop: 6, color: '#FFFFFF', textAlign: 'center' },
    actionCount: { fontSize: 10, marginTop: 2, color: 'rgba(255,255,255,0.55)', textAlign: 'center' },

    bottomActions: { flexDirection: 'row', gap: SPACING.sm, marginHorizontal: SPACING.md, marginTop: SPACING.xl },
    editButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: RADIUS.lg, backgroundColor: '#FF6B6B' },
    editButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    deleteButton: { width: 50, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: 'rgba(231,76,60,0.3)', backgroundColor: 'rgba(231,76,60,0.1)' },
});
