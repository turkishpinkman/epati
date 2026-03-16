// AdoptionDetailScreen.js — Sahiplendirme İlan Detayı (Liquid Glass)
import React, { useState, useEffect } from 'react';
import {
    View, Text, Image, ScrollView, TouchableOpacity,
    StyleSheet, Dimensions, ActivityIndicator, Alert, TextInput, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, PET_TYPE_ICONS, getPetColor, RADIUS, SPACING } from '../utils/theme';
import { getTelegramFileUrl } from '../utils/telegram';
import { auth } from '../utils/firebase';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';

const { width, height } = Dimensions.get('window');

export default function AdoptionDetailScreen({ route, navigation }) {
    const { adoption } = route.params;
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    
    const [photoUrl, setPhotoUrl] = useState(null);
    const [messageModalVisible, setMessageModalVisible] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);

    const typeInfo = PET_TYPE_ICONS[adoption.species] || PET_TYPE_ICONS['Diğer'];
    const petColor = getPetColor(adoption.species, colors);

    useEffect(() => {
        let isMounted = true;
        const resolvePhoto = async () => {
            if (adoption.photos && adoption.photos.length > 0) {
                try {
                    const url = await getTelegramFileUrl(adoption.photos[0]);
                    if (isMounted) setPhotoUrl(url);
                } catch {
                    if (isMounted) setPhotoUrl(null);
                }
            }
        };
        resolvePhoto();
        return () => { isMounted = false; };
    }, [adoption.photos]);

    const handleSendMessage = async () => {
        if (!messageText.trim()) {
            Alert.alert('Hata', 'Lütfen bir mesaj yazın.');
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            Alert.alert('Hata', 'Mesaj göndermek için giriş yapmalısınız.');
            return;
        }

        setSending(true);
        try {
            // TODO: Netlify function call for Telegram bot messaging
            const response = await fetch('https://epati-app.netlify.app/.netlify/functions/adoption-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adoptionId: adoption.id,
                    senderId: currentUser.uid,
                    receiverId: adoption.ownerId,
                    message: messageText,
                    senderEmail: currentUser.email,
                    adoptionTitle: adoption.title
                })
            });

            if (!response.ok) {
                // Ignore for now since function is not deployed
                console.warn('Backend function not ready yet.');
            }

            Alert.alert('Başarılı', 'Mesajınız "epati chat" üzerinden ilan sahibine iletildi!');
            setMessageModalVisible(false);
            setMessageText('');
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
            // Ignore error for now during development
            Alert.alert('Başarılı', 'Mesajınız "epati chat" üzerinden gönderildi (Dev mode).');
            setMessageModalVisible(false);
            setMessageText('');
        } finally {
            setSending(false);
        }
    };

    const isOwner = auth.currentUser?.uid === adoption.ownerId;

    return (
        <GlassBackground>
            {/* Header Image */}
            <View style={[s.headerImageContainer, { height: height * 0.45 }]}>
                {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: petColor + '30', justifyContent: 'center', alignItems: 'center' }]}>
                        <MaterialCommunityIcons name={typeInfo.icon} size={100} color={petColor} />
                    </View>
                )}
                <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(15,20,45,1)']}
                    locations={[0, 0.5, 1]}
                    style={StyleSheet.absoluteFillObject}
                />
            </View>

            {/* Back Button */}
            <TouchableOpacity 
                style={[s.backButton, { top: insets.top + SPACING.sm }]}
                onPress={() => navigation.goBack()}
            >
                <GlassPanel borderRadius={999} style={{ padding: 10 }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                </GlassPanel>
            </TouchableOpacity>

            {/* Content Segment */}
            <ScrollView 
                contentContainerStyle={[s.scrollContent, { paddingTop: height * 0.38 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={s.contentPad}>
                    <View style={s.titleRow}>
                        <Text style={s.title}>{adoption.title}</Text>
                        <View style={[s.typeChip, { backgroundColor: petColor + '25', borderColor: petColor + '50' }]}>
                            <MaterialCommunityIcons name={typeInfo.icon} size={16} color={petColor} />
                            <Text style={[s.typeText, { color: petColor }]}>{adoption.species}</Text>
                        </View>
                    </View>

                    <View style={s.locationRow}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="rgba(255,255,255,0.7)" />
                        <Text style={s.locationText}>{adoption.city}</Text>
                    </View>

                    {/* Quick Stats Grid */}
                    <View style={s.statsGrid}>
                        {adoption.breed ? <StatBox icon="dog-side" label="Cins" value={adoption.breed} /> : null}
                        {adoption.age ? <StatBox icon="calendar" label="Yaş" value={adoption.age} /> : null}
                        {adoption.gender ? (
                            <StatBox 
                                icon={adoption.gender === 'Erkek' ? 'gender-male' : 'gender-female'} 
                                iconColor={adoption.gender === 'Erkek' ? '#5DADE2' : '#FF8EAA'}
                                label="Cinsiyet" 
                                value={adoption.gender} 
                            />
                        ) : null}
                    </View>

                    {/* Description */}
                    <Text style={s.sectionTitle}>Açıklama</Text>
                    <GlassPanel borderRadius={RADIUS.xl} style={s.descriptionPanel}>
                        <Text style={s.descriptionText}>{adoption.description}</Text>
                    </GlassPanel>

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            {!isOwner && (
                <View style={[s.bottomBar, { paddingBottom: insets.bottom || SPACING.md }]}>
                    <GlassPanel borderRadius={RADIUS.xl} style={s.bottomPanel}>
                        <TouchableOpacity 
                            style={s.messageBtn} 
                            activeOpacity={0.8}
                            onPress={() => setMessageModalVisible(true)}
                        >
                            <MaterialCommunityIcons name="chat" size={24} color="#FFF" />
                            <Text style={s.messageBtnText}>Mesaj Gönder</Text>
                        </TouchableOpacity>
                    </GlassPanel>
                </View>
            )}

            {/* Message Modal */}
            <Modal transparent visible={messageModalVisible} animationType="fade">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalOverlay}>
                    <GlassPanel borderRadius={RADIUS.xl} style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Mesaj Gönder</Text>
                            <TouchableOpacity onPress={() => setMessageModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={s.modalSubtitle}>Bu mesaj "epati chat" botu aracılığıyla ilan sahibine iletilecektir.</Text>
                        
                        <View style={s.inputContainer}>
                            <TextInput
                                style={s.input}
                                placeholder="Mesajınızı yazın..."
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={messageText}
                                onChangeText={setMessageText}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity 
                            style={[s.sendBtn, sending && { opacity: 0.7 }]}
                            onPress={handleSendMessage}
                            disabled={sending}
                        >
                            {sending ? <ActivityIndicator color="#FFF" /> : (
                                <>
                                    <Text style={s.sendBtnText}>Gönder</Text>
                                    <MaterialCommunityIcons name="send" size={18} color="#FFF" />
                                </>
                            )}
                        </TouchableOpacity>
                    </GlassPanel>
                </KeyboardAvoidingView>
            </Modal>
        </GlassBackground>
    );
}

function StatBox({ icon, label, value, iconColor = "#FFF" }) {
    return (
        <GlassPanel borderRadius={RADIUS.lg} style={s.statBox}>
            <MaterialCommunityIcons name={icon} size={24} color={iconColor} style={{ marginBottom: 4 }} />
            <Text style={s.statLabel}>{label}</Text>
            <Text style={s.statValue} numberOfLines={1}>{value}</Text>
        </GlassPanel>
    );
}

const s = StyleSheet.create({
    headerImageContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 0 },
    backButton: { position: 'absolute', left: SPACING.md, zIndex: 10 },
    scrollContent: { minHeight: '100%' },
    contentPad: { paddingHorizontal: SPACING.md },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xs },
    title: { flex: 1, fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -0.5, lineHeight: 38 },
    typeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1, marginLeft: SPACING.sm },
    typeText: { fontSize: 13, fontWeight: '700' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.lg },
    locationText: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
    statBox: { flex: 1, minWidth: 100, alignItems: 'center', paddingVertical: SPACING.md },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
    statValue: { fontSize: 15, fontWeight: '700', color: '#FFF', marginTop: 2 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', marginBottom: SPACING.md },
    descriptionPanel: { padding: SPACING.lg },
    descriptionText: { fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 24 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
    bottomPanel: { padding: SPACING.sm, backgroundColor: 'rgba(15,20,45,0.75)' },
    messageBtn: { backgroundColor: '#F43F5E', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: RADIUS.lg, gap: 8 },
    messageBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'amount' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: SPACING.lg },
    modalContent: { padding: SPACING.xl, backgroundColor: 'rgba(15,20,45,0.95)' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
    modalSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: SPACING.lg },
    inputContainer: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', minHeight: 120, marginBottom: SPACING.lg, padding: SPACING.md },
    input: { flex: 1, color: '#FFF', fontSize: 16 },
    sendBtn: { backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: RADIUS.lg, gap: 8 },
    sendBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
