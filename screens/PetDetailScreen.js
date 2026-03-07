// PetDetailScreen.js — Pet Detay Sayfası
import React, { useState, useCallback } from 'react';
import {
    View, Text, Image, ScrollView, TouchableOpacity,
    StyleSheet, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, PET_TYPE_ICONS, getPetColor, SPACING, RADIUS } from '../utils/theme';
import { loadPets, deletePet } from '../utils/storage';
import QRIDCard from '../components/QRIDCard';

export default function PetDetailScreen({ navigation, route }) {
    const { petId } = route.params;
    const { colors, shadows } = useTheme();
    const [pet, setPet] = useState(null);
    const [showIDCard, setShowIDCard] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchPet = async () => {
                const pets = await loadPets();
                const found = pets.find(p => p.id === petId);
                setPet(found || null);
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <MaterialCommunityIcons name="loading" size={32} color={colors.primary} />
            </View>
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

    const s = makeStyles(colors, shadows);

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Header */}
                <View style={[s.heroHeader, { backgroundColor: petColor + '12' }]}>
                    {pet.photo ? (
                        <Image source={{ uri: pet.photo }} style={[s.heroPhoto, { borderColor: colors.surface }]} />
                    ) : (
                        <View style={[s.heroPhotoPlaceholder, { backgroundColor: petColor + '22' }]}>
                            <MaterialCommunityIcons name={typeInfo.icon} size={56} color={petColor} />
                        </View>
                    )}
                    <Text style={[s.heroName, { color: colors.text }]}>{pet.name}</Text>
                    <View style={s.heroBadges}>
                        <View style={[s.heroBadge, { backgroundColor: petColor + '20' }]}>
                            <MaterialCommunityIcons name={typeInfo.icon} size={14} color={petColor} />
                            <Text style={[s.heroBadgeText, { color: petColor }]}>{pet.type}</Text>
                        </View>
                        {pet.breed ? (
                            <View style={[s.heroBadge, { backgroundColor: colors.secondary + '20' }]}>
                                <Text style={[s.heroBadgeText, { color: colors.secondary }]}>{pet.breed}</Text>
                            </View>
                        ) : null}
                        {pet.gender ? (
                            <View style={[s.heroBadge, { backgroundColor: (pet.gender === 'Erkek' ? colors.info : colors.primary) + '20' }]}>
                                <MaterialCommunityIcons name={pet.gender === 'Erkek' ? 'gender-male' : 'gender-female'} size={14} color={pet.gender === 'Erkek' ? colors.info : colors.primary} />
                                <Text style={[s.heroBadgeText, { color: pet.gender === 'Erkek' ? colors.info : colors.primary }]}>{pet.gender}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={[s.quickStats, { backgroundColor: colors.surface }, shadows.medium]}>
                    <View style={s.quickStatItem}>
                        <Text style={[s.quickStatValue, { color: colors.text }]}>{getAge()}</Text>
                        <Text style={[s.quickStatLabel, { color: colors.textSecondary }]}>Yaş</Text>
                    </View>
                    <View style={[s.quickStatDivider, { backgroundColor: colors.divider }]} />
                    <View style={s.quickStatItem}>
                        <Text style={[s.quickStatValue, { color: colors.text }]}>{pet.weight ? `${pet.weight} kg` : '—'}</Text>
                        <Text style={[s.quickStatLabel, { color: colors.textSecondary }]}>Kilo</Text>
                    </View>
                    <View style={[s.quickStatDivider, { backgroundColor: colors.divider }]} />
                    <View style={s.quickStatItem}>
                        <Text style={[s.quickStatValue, { color: colors.text }]}>{vaccCount}</Text>
                        <Text style={[s.quickStatLabel, { color: colors.textSecondary }]}>Aşı</Text>
                    </View>
                </View>

                {/* Bilgi Kartları */}
                <View style={s.section}>
                    <Text style={[s.sectionTitle, { color: colors.text }]}>Genel Bilgiler</Text>
                    <View style={[s.infoCard, { backgroundColor: colors.surface }, shadows.small]}>
                        {[
                            { icon: 'calendar-heart', label: 'Doğum Tarihi', value: pet.birthDate || '—', color: colors.accentOrange },
                            { icon: 'palette', label: 'Renk', value: pet.color || '—', color: colors.accent },
                            { icon: 'chip', label: 'Mikroçip', value: pet.microchip || '—', color: colors.info },
                        ].map((item, i) => (
                            <View key={i} style={[s.infoRow, i === 2 && { borderBottomWidth: 0 }, { borderBottomColor: colors.divider }]}>
                                <View style={s.infoRowLeft}>
                                    <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                                    <Text style={[s.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                                </View>
                                <Text style={[s.infoValue, { color: colors.text }]}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Acil Durum */}
                <View style={s.section}>
                    <Text style={[s.sectionTitle, { color: colors.text }]}>Acil Durum & Veteriner</Text>
                    <View style={[s.infoCard, { backgroundColor: colors.surface }, shadows.small]}>
                        {[
                            { icon: 'doctor', label: 'Veteriner', value: pet.vetName || '—', color: colors.success },
                            { icon: 'phone', label: 'Vet Telefon', value: pet.vetPhone || '—', color: colors.success },
                            { icon: 'alert-circle', label: 'Alerjiler', value: pet.allergies || 'Bilinen alerji yok', color: colors.danger },
                        ].map((item, i) => (
                            <View key={i} style={[s.infoRow, i === 2 && { borderBottomWidth: 0 }, { borderBottomColor: colors.divider }]}>
                                <View style={s.infoRowLeft}>
                                    <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                                    <Text style={[s.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                                </View>
                                <Text style={[s.infoValue, { color: colors.text, maxWidth: '50%' }]} numberOfLines={2}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Notlar */}
                {pet.notes ? (
                    <View style={s.section}>
                        <Text style={[s.sectionTitle, { color: colors.text }]}>Notlar</Text>
                        <View style={[s.notesCard, { backgroundColor: colors.surface }, shadows.small]}>
                            <Text style={[s.notesText, { color: colors.text }]}>{pet.notes}</Text>
                        </View>
                    </View>
                ) : null}

                {/* Aksiyonlar */}
                <View style={s.section}>
                    <Text style={[s.sectionTitle, { color: colors.text }]}>İşlemler</Text>
                    <View style={s.actionGrid}>
                        <TouchableOpacity style={[s.actionCard, { backgroundColor: colors.secondary + '10' }]}
                            onPress={() => navigation.navigate('Vaccinations', { petId: pet.id, petName: pet.name })}>
                            <MaterialCommunityIcons name="needle" size={26} color={colors.secondary} />
                            <Text style={[s.actionText, { color: colors.text }]}>Aşılar</Text>
                            <Text style={[s.actionCount, { color: colors.textSecondary }]}>{vaccCount} kayıt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.actionCard, { backgroundColor: colors.info + '10' }]}
                            onPress={() => navigation.navigate('HealthRecords', { petId: pet.id, petName: pet.name })}>
                            <MaterialCommunityIcons name="clipboard-pulse" size={26} color={colors.info} />
                            <Text style={[s.actionText, { color: colors.text }]}>Sağlık</Text>
                            <Text style={[s.actionCount, { color: colors.textSecondary }]}>{healthCount} kayıt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.actionCard, { backgroundColor: colors.primary + '10' }]}
                            onPress={() => navigation.navigate('Weight', { petId: pet.id, petName: pet.name })}>
                            <MaterialCommunityIcons name="scale-bathroom" size={26} color={colors.primary} />
                            <Text style={[s.actionText, { color: colors.text }]}>Kilo</Text>
                            <Text style={[s.actionCount, { color: colors.textSecondary }]}>{weightCount} kayıt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.actionCard, { backgroundColor: colors.accentOrange + '10' }]}
                            onPress={() => navigation.navigate('Nutrition', { petId: pet.id, petName: pet.name })}>
                            <MaterialCommunityIcons name="food-drumstick" size={26} color={colors.accentOrange} />
                            <Text style={[s.actionText, { color: colors.text }]}>Beslenme</Text>
                            <Text style={[s.actionCount, { color: colors.textSecondary }]}>{nutritionCount} kayıt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.actionCard, { backgroundColor: colors.info + '10' }]}
                            onPress={() => navigation.navigate('PhotoGallery', { petId: pet.id, petName: pet.name })}>
                            <MaterialCommunityIcons name="image-multiple" size={26} color={colors.info} />
                            <Text style={[s.actionText, { color: colors.text }]}>Galeri</Text>
                            <Text style={[s.actionCount, { color: colors.textSecondary }]}>{galleryCount} fotoğraf</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.actionCard, { backgroundColor: petColor + '10' }]}
                            onPress={() => setShowIDCard(!showIDCard)}>
                            <MaterialCommunityIcons name="qrcode" size={26} color={petColor} />
                            <Text style={[s.actionText, { color: colors.text }]}>Kimlik</Text>
                            <Text style={[s.actionCount, { color: colors.textSecondary }]}>QR Kart</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* QR ID Kartı */}
                {showIDCard && (
                    <View style={s.section}>
                        <Text style={[s.sectionTitle, { color: colors.text }]}>Dijital Kimlik Kartı</Text>
                        <QRIDCard pet={pet} />
                    </View>
                )}

                {/* Düzenle + Sil */}
                <View style={s.bottomActions}>
                    <TouchableOpacity style={[s.editButton, { backgroundColor: colors.primary }, shadows.medium]}
                        onPress={() => navigation.navigate('AddEditPet', { petId: pet.id })}>
                        <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
                        <Text style={s.editButtonText}>Düzenle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.deleteButton, { borderColor: colors.danger + '30', backgroundColor: colors.danger + '08' }]} onPress={handleDelete}>
                        <MaterialCommunityIcons name="delete-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const makeStyles = (colors, shadows) => StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    heroHeader: { alignItems: 'center', paddingTop: SPACING.lg, paddingBottom: SPACING.xl, borderBottomLeftRadius: RADIUS.xl, borderBottomRightRadius: RADIUS.xl },
    heroPhoto: { width: 110, height: 110, borderRadius: 55, borderWidth: 4 },
    heroPhotoPlaceholder: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center' },
    heroName: { fontSize: 26, fontWeight: '800', marginTop: SPACING.md },
    heroBadges: { flexDirection: 'row', gap: 8, marginTop: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center' },
    heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full },
    heroBadgeText: { fontSize: 12, fontWeight: '600' },
    quickStats: { flexDirection: 'row', marginHorizontal: SPACING.md, marginTop: -SPACING.md, borderRadius: RADIUS.lg, paddingVertical: SPACING.md },
    quickStatItem: { flex: 1, alignItems: 'center' },
    quickStatValue: { fontSize: 18, fontWeight: '800' },
    quickStatLabel: { fontSize: 12, marginTop: 2 },
    quickStatDivider: { width: 1 },
    section: { marginTop: SPACING.lg, paddingHorizontal: SPACING.md },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm },
    infoCard: { borderRadius: RADIUS.lg, overflow: 'hidden' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 14, borderBottomWidth: 0.5 },
    infoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoLabel: { fontSize: 14 },
    infoValue: { fontSize: 14, fontWeight: '600' },
    notesCard: { borderRadius: RADIUS.lg, padding: SPACING.md },
    notesText: { fontSize: 14, lineHeight: 22 },
    actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    actionCard: { width: '31%', alignItems: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
    actionText: { fontSize: 13, fontWeight: '700', marginTop: 6 },
    actionCount: { fontSize: 10, marginTop: 2 },
    bottomActions: { flexDirection: 'row', gap: SPACING.sm, marginHorizontal: SPACING.md, marginTop: SPACING.xl },
    editButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: RADIUS.lg },
    editButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    deleteButton: { width: 50, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.lg, borderWidth: 1.5 },
});
