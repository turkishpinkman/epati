// SettingsScreen.js — Ayarlar
import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, SPACING, RADIUS } from '../utils/theme';

export default function SettingsScreen() {
    const { colors, shadows, isDark, toggleTheme } = useTheme();

    const clearAllData = () => {
        Alert.alert(
            'Tüm Verileri Sil',
            'Bu işlem geri alınamaz. Tüm pet verileri silinecek.',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Hepsini Sil', style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('@epati_pets');
                        Alert.alert('Başarılı', 'Tüm veriler silindi.');
                    }
                },
            ]
        );
    };

    const s = makeStyles(colors, shadows);

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* Görünüm */}
                <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>GÖRÜNÜM</Text>
                <View style={[s.card, { backgroundColor: colors.surface }, shadows.small]}>
                    <View style={s.row}>
                        <View style={s.rowLeft}>
                            <View style={[s.iconBg, { backgroundColor: isDark ? '#7C3AED20' : '#F39C1220' }]}>
                                <MaterialCommunityIcons
                                    name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
                                    size={20}
                                    color={isDark ? '#7C3AED' : '#F39C12'}
                                />
                            </View>
                            <View>
                                <Text style={[s.rowTitle, { color: colors.text }]}>Koyu Mod</Text>
                                <Text style={[s.rowSubtitle, { color: colors.textSecondary }]}>
                                    {isDark ? 'Aktif' : 'Kapalı'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primary + '60' }}
                            thumbColor={isDark ? colors.primary : '#FFF'}
                        />
                    </View>
                </View>

                {/* Hakkında */}
                <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>HAKKINDA</Text>
                <View style={[s.card, { backgroundColor: colors.surface }, shadows.small]}>
                    <View style={[s.row, { borderBottomColor: colors.divider }]}>
                        <View style={s.rowLeft}>
                            <View style={[s.iconBg, { backgroundColor: colors.primary + '15' }]}>
                                <MaterialCommunityIcons name="paw" size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[s.rowTitle, { color: colors.text }]}>e-pati</Text>
                                <Text style={[s.rowSubtitle, { color: colors.textSecondary }]}>Evcil Hayvan Kimlik & Profil</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[s.row, { borderBottomWidth: 0 }]}>
                        <View style={s.rowLeft}>
                            <View style={[s.iconBg, { backgroundColor: colors.info + '15' }]}>
                                <MaterialCommunityIcons name="information" size={20} color={colors.info} />
                            </View>
                            <View>
                                <Text style={[s.rowTitle, { color: colors.text }]}>Sürüm</Text>
                                <Text style={[s.rowSubtitle, { color: colors.textSecondary }]}>1.0.0</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Veri Yönetimi */}
                <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>VERİ YÖNETİMİ</Text>
                <TouchableOpacity style={[s.dangerCard, { backgroundColor: colors.danger + '08', borderColor: colors.danger + '25' }]} onPress={clearAllData}>
                    <MaterialCommunityIcons name="delete-forever" size={22} color={colors.danger} />
                    <View style={{ flex: 1 }}>
                        <Text style={[s.dangerTitle, { color: colors.danger }]}>Tüm Verileri Sil</Text>
                        <Text style={[s.dangerSubtitle, { color: colors.textSecondary }]}>Bu işlem geri alınamaz</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.danger} />
                </TouchableOpacity>

                {/* Dekoratif Footer */}
                <View style={s.footerContainer}>
                    <Text style={s.footerEmoji}>🐾</Text>
                    <Text style={[s.footerText, { color: colors.textLight }]}>Patili dostlarınız için yapıldı</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const makeStyles = (colors, shadows) => StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: SPACING.md },
    sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: SPACING.lg, marginBottom: SPACING.sm, marginLeft: 4 },
    card: { borderRadius: RADIUS.lg, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.divider },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBg: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    rowTitle: { fontSize: 15, fontWeight: '600' },
    rowSubtitle: { fontSize: 12, marginTop: 1 },
    dangerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1 },
    dangerTitle: { fontSize: 15, fontWeight: '600' },
    dangerSubtitle: { fontSize: 12, marginTop: 1 },
    footerContainer: { alignItems: 'center', paddingTop: SPACING.xxl, paddingBottom: SPACING.xl },
    footerEmoji: { fontSize: 32 },
    footerText: { fontSize: 13, marginTop: SPACING.sm },
});
