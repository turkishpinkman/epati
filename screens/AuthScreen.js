// screens/AuthScreen.js — Kayıt & Giriş Ekranı (Liquid Glass)
import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthScreen() {
    const { colors } = useTheme();
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!email.trim()) { Alert.alert('Hata', 'E-posta adresinizi girin.'); return false; }
        if (!email.includes('@')) { Alert.alert('Hata', 'Geçerli bir e-posta girin.'); return false; }
        if (password.length < 6) { Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.'); return false; }
        if (mode === 'signup' && password !== confirmPass) {
            Alert.alert('Hata', 'Şifreler eşleşmiyor.'); return false;
        }
        return true;
    };

    const handleAuth = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            if (mode === 'signup') {
                await createUserWithEmailAndPassword(auth, email.trim(), password);
            } else {
                await signInWithEmailAndPassword(auth, email.trim(), password);
            }
        } catch (error) {
            const messages = {
                'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
                'auth/invalid-email': 'Geçersiz e-posta adresi.',
                'auth/wrong-password': 'Hatalı şifre. Tekrar deneyin.',
                'auth/user-not-found': 'Bu e-posta ile kayıtlı hesap bulunamadı.',
                'auth/too-many-requests': 'Çok fazla hatalı deneme. Lütfen bekleyin.',
                'auth/weak-password': 'Şifre çok zayıf. En az 6 karakter kullanın.',
                'auth/invalid-credential': 'E-posta veya şifre hatalı.',
            };
            Alert.alert('Giriş Başarısız', messages[error.code] || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) { Alert.alert('Şifre Sıfırlama', 'Önce e-posta adresinizi girin.'); return; }
        try {
            await sendPasswordResetEmail(auth, email.trim());
            Alert.alert('E-posta Gönderildi', `${email} adresine şifre sıfırlama bağlantısı gönderildi.`);
        } catch {
            Alert.alert('Hata', 'Şifre sıfırlama e-postası gönderilemedi.');
        }
    };



    return (
        <GlassBackground>
            <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {/* Logo */}
                    <View style={s.logoContainer}>
                        <View style={s.logoCircle}>
                            <MaterialCommunityIcons name="paw" size={60} color="rgba(255,255,255,0.95)" />
                        </View>
                        <Text style={s.appName}>e-pati</Text>
                        <Text style={s.tagline}>Evcil hayvanınızın dijital kimliği</Text>
                    </View>

                    {/* Tab */}
                    <GlassPanel borderRadius={RADIUS.lg} noPadding style={s.tabRowOuter}>
                        <View style={s.tabRowInner}>
                            <TouchableOpacity
                                style={[s.tab, mode === 'login' && s.tabActive]}
                                onPress={() => { setMode('login'); setConfirmPass(''); }}
                            >
                                <Text style={[s.tabText, mode === 'login' && s.tabTextActive]}>Giriş Yap</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[s.tab, mode === 'signup' && s.tabActive]}
                                onPress={() => setMode('signup')}
                            >
                                <Text style={[s.tabText, mode === 'signup' && s.tabTextActive]}>Hesap Oluştur</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassPanel>

                    {/* Form */}
                    <GlassPanel borderRadius={RADIUS.lg} noPadding style={s.formPanel}>
                        {/* Email */}
                        <View style={s.inputRow}>
                            <MaterialCommunityIcons name="email-outline" size={22} color="rgba(255,255,255,0.7)" />
                            <TextInput
                                style={s.input}
                                placeholder="E-posta adresiniz"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Şifre */}
                        <View style={[s.inputRow, mode !== 'signup' && { borderBottomWidth: 0 }]}>
                            <MaterialCommunityIcons name="lock-outline" size={22} color="rgba(255,255,255,0.7)" />
                            <TextInput
                                style={s.input}
                                placeholder="Şifreniz (en az 6 karakter)"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPass}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                                <MaterialCommunityIcons name={showPass ? 'eye-off' : 'eye'} size={20} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                        </View>

                        {/* Şifre Tekrar */}
                        {mode === 'signup' && (
                            <View style={[s.inputRow, { borderBottomWidth: 0 }]}>
                                <MaterialCommunityIcons name="lock-check-outline" size={22} color={colors.secondary} />
                                <TextInput
                                    style={s.input}
                                    placeholder="Şifrenizi tekrar girin"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={confirmPass}
                                    onChangeText={setConfirmPass}
                                    secureTextEntry={!showPass}
                                    autoCapitalize="none"
                                />
                            </View>
                        )}
                    </GlassPanel>

                    {/* Şifremi Unuttum */}
                    {mode === 'login' && (
                        <TouchableOpacity onPress={handleForgotPassword} style={s.forgotBtn}>
                            <Text style={s.forgotText}>Şifremi unuttum</Text>
                        </TouchableOpacity>
                    )}

                    {/* Ana Buton */}
                    <TouchableOpacity
                        style={[s.mainBtnWrapper, loading && { opacity: 0.7 }]}
                        onPress={handleAuth}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#5856D6', '#007AFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={s.mainBtnGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name={mode === 'login' ? 'login' : 'account-plus'} size={22} color="#FFF" />
                                    <Text style={s.mainBtnText}>{mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>


                    <Text style={s.disclaimer}>
                        Verileriniz güvenli şekilde Firebase'de saklanır.{'\n'}
                        Her hesap yalnızca kendi evcil hayvanlarını görür.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </GlassBackground>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xxl,
        paddingBottom: SPACING.xl,
    },
    logoContainer: { alignItems: 'center', marginBottom: SPACING.xl },
    logoCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    appName: { fontSize: 40, fontWeight: '900', letterSpacing: -1, color: '#FFFFFF' },
    tagline: { fontSize: 14, marginTop: 4, color: 'rgba(255,255,255,0.65)' },

    tabRowOuter: {
        marginBottom: SPACING.md,
        width: '100%',
        maxWidth: 420,
    },
    tabRowInner: {
        flexDirection: 'row',
        padding: 4,
    },
    tab: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.md, alignItems: 'center' },
    tabActive: { backgroundColor: 'rgba(88,86,214,0.85)' },
    tabText: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
    tabTextActive: { color: '#FFFFFF' },

    formPanel: {
        marginBottom: SPACING.sm,
        width: '100%',
        maxWidth: 420,
    },
    inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.12)', gap: 12, minHeight: 56 },
    input: { flex: 1, fontSize: 16, paddingVertical: 8, color: '#FFFFFF' },
    forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.md, paddingVertical: 4 },
    forgotText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

    mainBtnWrapper: {
        width: '100%',
        maxWidth: 420,
        marginBottom: SPACING.lg,
        borderRadius: RADIUS.xl,
        shadowColor: '#5856D6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    mainBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: RADIUS.xl,
    },
    mainBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800' },


    disclaimer: { textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: SPACING.lg, color: 'rgba(255,255,255,0.4)' },
});
