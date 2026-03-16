// SettingsScreen.js — Ayarlar (Liquid Glass)
import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';

export default function SettingsScreen() {
    const { colors, shadows } = useTheme();

    const handleLogout = async () => {
        const doLogout = async () => {
            try {
                await signOut(auth);
            } catch (e) {
                if (Platform.OS === 'web') {
                    window.alert('Çıkış yapılamadı.');
                } else {
                    Alert.alert('Hata', 'Çıkış yapılamadı.');
                }
            }
        };

        if (Platform.OS === 'web') {
            const confirmed = window.confirm('Hesabınızdan çıkmak istediğinizden emin misiniz?');
            if (confirmed) {
                await doLogout();
            }
        } else {
            Alert.alert(
                'Çıkış Yap',
                'Hesabınızdan çıkmak istediğinizden emin misiniz?',
                [
                    { text: 'Vazgeç', style: 'cancel' },
                    { text: 'Çıkış Yap', style: 'destructive', onPress: doLogout },
                ]
            );
        }
    };

    const userEmail = auth.currentUser?.email || 'Giriş yapılmış kullanıcı';

    return (
        <GlassBackground>
            <SafeAreaView style={s.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                    {/* Başlık */}
                    <Text style={s.pageTitle}>Ayarlar</Text>

                    {/* Hesap bilgisi */}
                    <Text style={s.sectionTitle}>HESAP</Text>
                    <GlassPanel borderRadius={RADIUS.lg} noPadding>
                        <View style={s.row}>
                            <View style={s.rowLeft}>
                                <View style={[s.iconBg, { backgroundColor: 'rgba(99,102,241,0.2)' }]}>
                                    <MaterialCommunityIcons name="account-circle" size={20} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={s.rowTitle}>{userEmail}</Text>
                                    <Text style={s.rowSubtitle}>Aktif oturum</Text>
                                </View>
                            </View>
                        </View>
                    </GlassPanel>


                    {/* Hakkında */}
                    <Text style={s.sectionTitle}>HAKKINDA</Text>
                    <GlassPanel borderRadius={RADIUS.lg} noPadding>
                        <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.12)' }]}>
                            <View style={s.rowLeft}>
                                <View style={[s.iconBg, { backgroundColor: 'rgba(124,58,237,0.2)' }]}>
                                    <MaterialCommunityIcons name="paw" size={20} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={s.rowTitle}>e-pati</Text>
                                    <Text style={s.rowSubtitle}>Evcil Hayvan Kimlik & Profil</Text>
                                </View>
                            </View>
                        </View>
                        <View style={s.row}>
                            <View style={s.rowLeft}>
                                <View style={[s.iconBg, { backgroundColor: 'rgba(52,152,219,0.15)' }]}>
                                    <MaterialCommunityIcons name="information" size={20} color={colors.info} />
                                </View>
                                <View>
                                    <Text style={s.rowTitle}>Sürüm</Text>
                                    <Text style={s.rowSubtitle}>2.0.0 (Liquid Glass)</Text>
                                </View>
                            </View>
                        </View>
                    </GlassPanel>

                    {/* Çıkış Yap */}
                    <Text style={s.sectionTitle}>HESAP İŞLEMLERİ</Text>
                    <TouchableOpacity onPress={handleLogout} activeOpacity={0.8}>
                        <GlassPanel borderRadius={RADIUS.lg} noPadding tint="dark">
                            <View style={s.dangerRow}>
                                <MaterialCommunityIcons name="logout" size={22} color={colors.danger} />
                                <View style={{ flex: 1 }}>
                                    <Text style={s.dangerTitle}>Çıkış Yap</Text>
                                    <Text style={s.dangerSubtitle}>Hesabınızdan güvenli çıkış yapın</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.danger} />
                            </View>
                        </GlassPanel>
                    </TouchableOpacity>

                    {/* Footer */}
                    <View style={s.footerContainer}>
                        <Text style={s.footerEmoji}>🐾</Text>
                        <Text style={s.footerText}>Patili dostlarınız için yapıldı</Text>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </GlassBackground>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: SPACING.md, paddingBottom: 100 },
    pageTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', marginBottom: SPACING.sm, marginTop: SPACING.sm },
    sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: SPACING.lg, marginBottom: SPACING.sm, marginLeft: 4, color: 'rgba(255,255,255,0.55)' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: 14 },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBg: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    rowTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
    rowSubtitle: { fontSize: 12, marginTop: 1, color: 'rgba(255,255,255,0.55)' },
    dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: SPACING.md, paddingVertical: 14 },
    dangerTitle: { fontSize: 15, fontWeight: '600', color: '#E74C3C' },
    dangerSubtitle: { fontSize: 12, marginTop: 1, color: 'rgba(255,255,255,0.45)' },
    footerContainer: { alignItems: 'center', paddingTop: SPACING.xxl, paddingBottom: SPACING.xl },
    footerEmoji: { fontSize: 32 },
    footerText: { fontSize: 13, marginTop: SPACING.sm, color: 'rgba(255,255,255,0.4)' },
});
