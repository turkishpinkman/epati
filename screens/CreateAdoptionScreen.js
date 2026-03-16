// CreateAdoptionScreen.js — Sıfırdan Sahiplendirme İlanı Oluşturma Formu (Liquid Glass)
import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, PET_TYPES, GENDERS, PET_TYPE_ICONS, getPetColor, SPACING, RADIUS } from '../utils/theme';
import { addAdoption } from '../utils/storage';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';

export default function CreateAdoptionScreen({ navigation }) {
    const { colors } = useTheme();

    const [form, setForm] = useState({
        title: '', description: '', species: 'Kedi', breed: '', age: '', gender: '', city: '', photo: null,
    });
    const [saving, setSaving] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri izni gerekli.'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.5,
        });
        if (!result.canceled && result.assets[0]) {
            setForm(f => ({ ...f, photo: result.assets[0].uri }));
        }
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.description.trim() || !form.city.trim()) { 
            Alert.alert('Hata', 'Lütfen ilan başlığı, açıklama ve şehir alanlarını doldurun.'); return; 
        }
        setSaving(true);
        try {
            await addAdoption({
                title: form.title,
                description: form.description,
                species: form.species,
                breed: form.breed,
                age: form.age,
                gender: form.gender,
                city: form.city,
                photos: form.photo ? [form.photo] : [],
                status: 'active'
            });
            Alert.alert('Başarılı', 'Yuva arayan dostumuzun ilanı yayınlandı.');
            navigation.goBack();
        } catch (error) {
            console.error('Kayıt hatası:', error);
            Alert.alert('Hata', 'İlan yayınlanırken bir sorun oluştu. Lütfen tekrar deneyin.');
        } finally {
            setSaving(false);
        }
    };

    const petColor = getPetColor(form.species, colors);

    return (
        <GlassBackground>
            <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                    {/* Fotoğraf */}
                    <TouchableOpacity style={s.photoSection} onPress={pickImage}>
                        {form.photo ? (
                            <Image source={{ uri: form.photo }} style={[s.photo, { borderColor: 'rgba(255,255,255,0.3)' }]} />
                        ) : (
                            <View style={[s.photoPlaceholder, { backgroundColor: petColor + '25', borderColor: 'rgba(255,255,255,0.25)' }]}>
                                <MaterialCommunityIcons name="camera-plus" size={40} color={petColor} />
                                <Text style={[s.photoText, { color: petColor }]}>Fotoğraf Ekle</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Tür Seçimi */}
                    <Text style={s.sectionTitle}>Tür</Text>
                    <View style={s.typeGrid}>
                        {PET_TYPES.map(type => {
                            const info = PET_TYPE_ICONS[type];
                            const typeColor = getPetColor(type, colors);
                            const selected = form.species === type;
                            return (
                                <TouchableOpacity key={type}
                                    style={[s.typeChip, { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)' }, selected && { backgroundColor: typeColor, borderColor: typeColor }]}
                                    onPress={() => setForm(f => ({ ...f, species: type }))}>
                                    <MaterialCommunityIcons name={info.icon} size={20} color={selected ? '#FFF' : typeColor} />
                                    <Text style={[s.typeChipText, { color: 'rgba(255,255,255,0.8)' }, selected && { color: '#FFF' }]}>{type}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* İlan Bilgileri */}
                    <Text style={s.sectionTitle}>İlan Bilgileri</Text>
                    <GlassPanel borderRadius={RADIUS.lg} noPadding>
                        <InputRow icon="format-title" color={colors.primary} placeholder="İlan Başlığı *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
                        <InputRow icon="map-marker" color={colors.accent} placeholder="Şehir *" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} />
                        <InputRow icon="text" color="rgba(255,255,255,0.5)" placeholder="Açıklama (Karakter, sağlık durumu vb.) *" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} multiline last />
                    </GlassPanel>

                    {/* Detaylar */}
                    <Text style={s.sectionTitle}>Pet Detayları (Opsiyonel)</Text>
                    <GlassPanel borderRadius={RADIUS.lg} noPadding>
                        <InputRow icon="dog-side" color={colors.secondary} placeholder="Cinsi (ör: Tekir)" value={form.breed} onChange={v => setForm(f => ({ ...f, breed: v }))} />
                        <InputRow icon="calendar" color={colors.info} placeholder="Yaş (ör: 2 yaşında veya 3 aylık)" value={form.age} onChange={v => setForm(f => ({ ...f, age: v }))} last />
                    </GlassPanel>

                    {/* Cinsiyet */}
                    <Text style={s.sectionTitle}>Cinsiyet</Text>
                    <View style={s.genderRow}>
                        {GENDERS.map(g => (
                            <TouchableOpacity key={g}
                                style={[s.genderChip, { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)' },
                                form.gender === g && { backgroundColor: g === 'Erkek' ? colors.info : colors.primary, borderColor: g === 'Erkek' ? colors.info : colors.primary }]}
                                onPress={() => setForm(f => ({ ...f, gender: g }))}>
                                <MaterialCommunityIcons name={g === 'Erkek' ? 'gender-male' : 'gender-female'} size={20} color={form.gender === g ? '#FFF' : (g === 'Erkek' ? '#5DADE2' : '#FF8EAA')} />
                                <Text style={[s.genderText, { color: 'rgba(255,255,255,0.8)' }, form.gender === g && { color: '#FFF' }]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Kaydet */}
                    <TouchableOpacity style={s.saveButton} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                        {saving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="send" size={22} color="#FFF" />
                                <Text style={s.saveButtonText}>İlanı Yayınla</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </GlassBackground>
    );
}

function InputRow({ icon, color, placeholder, value, onChange, keyboard, multiline, last }) {
    return (
        <View style={[{
            flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 2,
            borderBottomWidth: last ? 0 : 0.5, borderBottomColor: 'rgba(255,255,255,0.12)', gap: 12,
            minHeight: multiline ? 80 : 52, alignItems: multiline ? 'flex-start' : 'center',
            paddingTop: multiline ? 14 : 2,
        }]}>
            <MaterialCommunityIcons name={icon} size={20} color={color} style={multiline ? { marginTop: 2 } : undefined} />
            <TextInput
                style={{ flex: 1, fontSize: 15, color: '#FFFFFF', paddingVertical: 8, textAlignVertical: multiline ? 'top' : 'center' }}
                placeholder={placeholder} placeholderTextColor="rgba(255,255,255,0.4)"
                value={value} onChangeText={onChange} keyboardType={keyboard || 'default'}
                multiline={multiline} numberOfLines={multiline ? 3 : 1}
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: SPACING.md, paddingTop: 80 },
    photoSection: { alignItems: 'center', marginBottom: SPACING.lg },
    photo: { width: '100%', aspectRatio: 4/3, borderRadius: RADIUS.lg, borderWidth: 3 },
    photoPlaceholder: { width: '100%', aspectRatio: 4/3, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed' },
    photoText: { fontSize: 14, fontWeight: '600', marginTop: 8 },
    sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.md, marginLeft: 4, color: '#FFFFFF' },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.full, borderWidth: 1.5 },
    typeChipText: { fontSize: 13, fontWeight: '600' },
    genderRow: { flexDirection: 'row', gap: SPACING.sm },
    genderChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: RADIUS.lg, borderWidth: 1.5 },
    genderText: { fontSize: 14, fontWeight: '600' },
    saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: RADIUS.xl, marginTop: SPACING.xl, backgroundColor: '#F43F5E' },
    saveButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
