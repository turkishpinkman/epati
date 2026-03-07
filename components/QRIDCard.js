// QRIDCard.js — QR Kodlu Dijital Pet Kimlik Kartı
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Rect } from 'react-native-svg';
import { useTheme, PET_TYPE_ICONS, getPetColor, SPACING, RADIUS } from '../utils/theme';

// Basit QR benzeri pattern (gerçek QR yerine dekoratif grid)
function QRPattern({ data, size, color }) {
    const grid = 15;
    const cellSize = size / grid;
    // Deterministik hash-based pattern
    const cells = [];
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data.charCodeAt(i);
        hash |= 0;
    }
    for (let row = 0; row < grid; row++) {
        for (let col = 0; col < grid; col++) {
            // Position markers (köşeler)
            const isCorner = (row < 3 && col < 3) || (row < 3 && col >= grid - 3) || (row >= grid - 3 && col < 3);
            const isCornerInner = (row < 2 && col < 2) || (row < 2 && col >= grid - 2) || (row >= grid - 2 && col < 2);
            const seed = hash + row * grid + col;
            const isOn = isCorner || ((seed * 2654435761 >>> 0) % 3 === 0);
            if (isOn) {
                cells.push(
                    <Rect key={`${row}-${col}`} x={col * cellSize} y={row * cellSize}
                        width={cellSize - 0.5} height={cellSize - 0.5}
                        fill={isCornerInner ? color : color + (isCorner ? 'DD' : '88')}
                        rx={1}
                    />
                );
            }
        }
    }
    return (
        <Svg width={size} height={size}>
            {cells}
        </Svg>
    );
}

export default function QRIDCard({ pet }) {
    const { colors, shadows } = useTheme();
    const typeInfo = PET_TYPE_ICONS[pet.type] || PET_TYPE_ICONS['Diğer'];
    const petColor = getPetColor(pet.type, colors);
    const qrData = `epati:${pet.id || ''}:${pet.name || ''}:${pet.type || ''}`;

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
        <View style={[styles.card, { backgroundColor: colors.surface }, shadows.large]}>
            {/* Üst Başlık */}
            <View style={[styles.header, { backgroundColor: petColor }]}>
                <MaterialCommunityIcons name="paw" size={18} color="#FFF" />
                <Text style={styles.headerTitle}>e-pati KİMLİK</Text>
                <MaterialCommunityIcons name="shield-check" size={18} color="#FFF" />
            </View>

            {/* İçerik */}
            <View style={styles.body}>
                {/* Sol: Fotoğraf ve QR */}
                <View style={styles.leftCol}>
                    {pet.photo ? (
                        <Image source={{ uri: pet.photo }} style={[styles.photo, { borderColor: petColor + '40' }]} />
                    ) : (
                        <View style={[styles.photoPlaceholder, { backgroundColor: petColor + '15', borderColor: petColor + '30' }]}>
                            <MaterialCommunityIcons name={typeInfo.icon} size={32} color={petColor} />
                        </View>
                    )}
                    <View style={[styles.qrContainer, { backgroundColor: colors.surfaceAlt }]}>
                        <QRPattern data={qrData} size={70} color={petColor} />
                    </View>
                </View>

                {/* Sağ: Bilgiler */}
                <View style={styles.rightCol}>
                    <Text style={[styles.petName, { color: colors.text }]}>{pet.name}</Text>

                    <InfoRow icon={typeInfo.icon} label="Tür" value={pet.type} color={petColor} textColor={colors.text} secondaryColor={colors.textSecondary} />
                    {pet.breed ? <InfoRow icon="tag" label="Cins" value={pet.breed} color={colors.secondary} textColor={colors.text} secondaryColor={colors.textSecondary} /> : null}
                    <InfoRow icon="calendar" label="Yaş" value={getAge()} color={colors.accentOrange} textColor={colors.text} secondaryColor={colors.textSecondary} />
                    {pet.gender ? <InfoRow icon={pet.gender === 'Erkek' ? 'gender-male' : 'gender-female'} label="Cinsiyet" value={pet.gender} color={pet.gender === 'Erkek' ? colors.info : colors.primary} textColor={colors.text} secondaryColor={colors.textSecondary} /> : null}
                    {pet.microchip ? <InfoRow icon="chip" label="Çip" value={pet.microchip} color={colors.info} textColor={colors.text} secondaryColor={colors.textSecondary} small /> : null}
                </View>
            </View>

            {/* Acil Durum Bandı */}
            {(pet.vetName || pet.vetPhone) ? (
                <View style={[styles.emergencyBand, { backgroundColor: colors.danger + '10', borderTopColor: colors.divider }]}>
                    <MaterialCommunityIcons name="ambulance" size={16} color={colors.danger} />
                    <Text style={[styles.emergencyText, { color: colors.danger }]}>
                        {pet.vetName ? `Vet: ${pet.vetName}` : ''}{pet.vetPhone ? ` • ${pet.vetPhone}` : ''}
                    </Text>
                </View>
            ) : null}

            {/* Alt ID */}
            <View style={[styles.footer, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.footerText, { color: colors.textLight }]}>
                    ID: {pet.id ? pet.id.substring(0, 14).toUpperCase() : '—'}
                </Text>
                <Text style={[styles.footerText, { color: colors.textLight }]}>
                    {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString('tr-TR') : '—'}
                </Text>
            </View>
        </View>
    );
}

function InfoRow({ icon, label, value, color, textColor, secondaryColor, small }) {
    return (
        <View style={styles.infoRow}>
            <MaterialCommunityIcons name={icon} size={small ? 12 : 14} color={color} />
            <Text style={[styles.infoLabel, { color: secondaryColor }, small && { fontSize: 10 }]}>{label}</Text>
            <Text style={[styles.infoValue, { color: textColor }, small && { fontSize: 10 }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: RADIUS.lg, overflow: 'hidden', marginHorizontal: SPACING.md },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 8 },
    headerTitle: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
    body: { flexDirection: 'row', padding: SPACING.md, gap: SPACING.md },
    leftCol: { alignItems: 'center', gap: SPACING.sm },
    photo: { width: 72, height: 72, borderRadius: RADIUS.md, borderWidth: 3 },
    photoPlaceholder: { width: 72, height: 72, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed' },
    qrContainer: { padding: 6, borderRadius: RADIUS.sm },
    rightCol: { flex: 1 },
    petName: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 },
    infoLabel: { fontSize: 11, fontWeight: '500', width: 50 },
    infoValue: { fontSize: 12, fontWeight: '700', flex: 1 },
    emergencyBand: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: 8, borderTopWidth: 0.5 },
    emergencyText: { fontSize: 11, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: 6 },
    footerText: { fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
});
