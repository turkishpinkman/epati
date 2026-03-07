// PetCard.js — Ana sayfada kullanılan pet kartı bileşeni
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, PET_TYPE_ICONS, getPetColor, RADIUS, SPACING } from '../utils/theme';

export default function PetCard({ pet, onPress }) {
    const { colors, shadows } = useTheme();
    const typeInfo = PET_TYPE_ICONS[pet.type] || PET_TYPE_ICONS['Diğer'];
    const petColor = getPetColor(pet.type, colors);

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

    const upcomingVaccCount = (pet.vaccinations || []).filter(v => {
        if (!v.nextDate) return false;
        return new Date(v.nextDate) > new Date();
    }).length;

    return (
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface }, shadows.medium]} onPress={onPress} activeOpacity={0.85}>
            <View style={[styles.colorStripe, { backgroundColor: petColor }]} />
            <View style={styles.imageContainer}>
                {pet.photo ? (
                    <Image source={{ uri: pet.photo }} style={styles.image} />
                ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: petColor + '18' }]}>
                        <MaterialCommunityIcons name={typeInfo.icon} size={36} color={petColor} />
                    </View>
                )}
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.topRow}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{pet.name}</Text>
                    {pet.gender && (
                        <MaterialCommunityIcons
                            name={pet.gender === 'Erkek' ? 'gender-male' : 'gender-female'}
                            size={18}
                            color={pet.gender === 'Erkek' ? colors.info : colors.primary}
                        />
                    )}
                </View>
                <Text style={[styles.breed, { color: colors.textSecondary }]} numberOfLines={1}>
                    {pet.type}{pet.breed ? ` · ${pet.breed}` : ''}
                </Text>
                {getAge() ? <Text style={[styles.age, { color: colors.textLight }]}>{getAge()}</Text> : null}
                <View style={styles.badges}>
                    {upcomingVaccCount > 0 && (
                        <View style={[styles.badgeWarning, { backgroundColor: colors.accent + '25' }]}>
                            <MaterialCommunityIcons name="needle" size={12} color={colors.warning} />
                            <Text style={[styles.badgeWarningText, { color: colors.warning }]}>{upcomingVaccCount} aşı</Text>
                        </View>
                    )}
                    {pet.weight && (
                        <View style={[styles.badgeInfo, { backgroundColor: colors.secondary + '18' }]}>
                            <Text style={[styles.badgeInfoText, { color: colors.secondary }]}>{pet.weight} kg</Text>
                        </View>
                    )}
                    {(pet.gallery?.length || 0) > 0 && (
                        <View style={[styles.badgeInfo, { backgroundColor: colors.info + '18' }]}>
                            <MaterialCommunityIcons name="image" size={11} color={colors.info} />
                            <Text style={[styles.badgeInfoText, { color: colors.info }]}>{pet.gallery.length}</Text>
                        </View>
                    )}
                </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textLight} style={styles.arrow} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, marginHorizontal: SPACING.md, marginBottom: SPACING.md, padding: SPACING.md, overflow: 'hidden' },
    colorStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: RADIUS.lg, borderBottomLeftRadius: RADIUS.lg },
    imageContainer: { marginLeft: SPACING.sm, marginRight: SPACING.md },
    image: { width: 64, height: 64, borderRadius: RADIUS.lg },
    placeholderImage: { width: 64, height: 64, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
    infoContainer: { flex: 1 },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { fontSize: 17, fontWeight: '700' },
    breed: { fontSize: 13, marginTop: 2 },
    age: { fontSize: 12, marginTop: 1 },
    badges: { flexDirection: 'row', gap: 6, marginTop: 6 },
    badgeWarning: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
    badgeWarningText: { fontSize: 11, fontWeight: '600' },
    badgeInfo: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
    badgeInfoText: { fontSize: 11, fontWeight: '600' },
    arrow: { marginLeft: SPACING.sm },
});
