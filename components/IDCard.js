// IDCard.js — Dijital Pet Kimlik Kartı Bileşeni
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS, SPACING, PET_TYPE_ICONS } from '../utils/theme';

export default function IDCard({ pet }) {
    const typeInfo = PET_TYPE_ICONS[pet.type] || PET_TYPE_ICONS['Diğer'];

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

    return (
        <View style={styles.card}>
            {/* Üst Başlık */}
            <View style={[styles.header, { backgroundColor: typeInfo.color }]}>
                <MaterialCommunityIcons name="paw" size={20} color="#FFF" />
                <Text style={styles.headerTitle}>e-pati Kimlik Kartı</Text>
                <MaterialCommunityIcons name="paw" size={20} color="#FFF" />
            </View>

            {/* İçerik */}
            <View style={styles.body}>
                {/* Fotoğraf */}
                <View style={styles.photoSection}>
                    {pet.photo ? (
                        <Image source={{ uri: pet.photo }} style={styles.photo} />
                    ) : (
                        <View style={[styles.photoPlaceholder, { backgroundColor: typeInfo.color + '20' }]}>
                            <MaterialCommunityIcons name={typeInfo.icon} size={40} color={typeInfo.color} />
                        </View>
                    )}
                </View>

                {/* Bilgiler */}
                <View style={styles.infoSection}>
                    <Text style={styles.petName}>{pet.name}</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Tür</Text>
                        <Text style={styles.value}>{pet.type}</Text>
                    </View>
                    {pet.breed ? (
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Cins</Text>
                            <Text style={styles.value}>{pet.breed}</Text>
                        </View>
                    ) : null}
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Yaş</Text>
                        <Text style={styles.value}>{getAge()}</Text>
                    </View>
                    {pet.gender ? (
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Cinsiyet</Text>
                            <Text style={styles.value}>{pet.gender}</Text>
                        </View>
                    ) : null}
                    {pet.color ? (
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Renk</Text>
                            <Text style={styles.value}>{pet.color}</Text>
                        </View>
                    ) : null}
                    {pet.microchip ? (
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Çip No</Text>
                            <Text style={[styles.value, { fontSize: 11 }]}>{pet.microchip}</Text>
                        </View>
                    ) : null}
                </View>
            </View>

            {/* Alt */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    ID: {pet.id ? pet.id.substring(0, 12).toUpperCase() : '—'}
                </Text>
                <Text style={styles.footerText}>
                    Kayıt: {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString('tr-TR') : '—'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginHorizontal: SPACING.md,
        ...SHADOWS.large,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 10,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },
    body: {
        flexDirection: 'row',
        padding: SPACING.md,
        gap: SPACING.md,
    },
    photoSection: {
        alignItems: 'center',
    },
    photo: {
        width: 90,
        height: 90,
        borderRadius: RADIUS.md,
        borderWidth: 3,
        borderColor: COLORS.border,
    },
    photoPlaceholder: {
        width: 90,
        height: 90,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    infoSection: {
        flex: 1,
    },
    petName: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.divider,
    },
    label: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    value: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surfaceAlt,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
    },
    footerText: {
        fontSize: 10,
        color: COLORS.textLight,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
