// AddEditPetScreen.js — Pet Ekleme/Düzenleme Formu (Liquid Glass)
import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, PET_TYPES, GENDERS, PET_TYPE_ICONS, getPetColor, SPACING, RADIUS } from '../utils/theme';
import { addPet, updatePet, loadPet } from '../utils/storage';
import { getTelegramFileUrl } from '../utils/telegram';
import DatePickerInput from '../components/DatePickerInput';
import { parseDateString, formatDateString } from '../utils/dateHelpers';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';

export default function AddEditPetScreen({ navigation, route }) {
    const editId = route.params?.petId;
    const isEdit = !!editId;
    const { colors, shadows } = useTheme();

    const [form, setForm] = useState({
        name: '', type: 'Kedi', breed: '', birthDate: '', gender: '',
        color: '', weight: '', microchip: '', vetName: '', vetPhone: '',
        allergies: '', notes: '', photo: null,
    });
    const [saving, setSaving] = useState(false);
    const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState(null);

    useEffect(() => {
        if (isEdit) {
            const fetchPet = async () => {
                const pet = await loadPet(editId);
                if (pet) {
                    setForm({
                        name: pet.name || '', type: pet.type || 'Kedi', breed: pet.breed || '',
                        birthDate: pet.birthDate || '', gender: pet.gender || '', color: pet.color || '',
                        weight: pet.weight || '', microchip: pet.microchip || '', vetName: pet.vetName || '',
                        vetPhone: pet.vetPhone || '', allergies: pet.allergies || '', notes: pet.notes || '',
                        photo: pet.photo || null,
                    });
                    // Telegram file_id'yi URL'ye çevir (preview için)
                    if (pet.photo) {
                        try {
                            const url = await getTelegramFileUrl(pet.photo);
                            setResolvedPhotoUrl(url);
                        } catch { setResolvedPhotoUrl(null); }
                    }
                }
            };
            fetchPet();
        }
    }, [editId]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri izni gerekli.'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });
        if (!result.canceled && result.assets[0]) {
            setForm(f => ({ ...f, photo: result.assets[0].uri }));
            setResolvedPhotoUrl(result.assets[0].uri); // Yeni seçilen fotoğraf yerel URI
        }
    };

    const handleSave = async () => {
        if (!form.name.trim()) { Alert.alert('Hata', 'Lütfen pet adını girin.'); return; }
        setSaving(true);
        try {
            if (isEdit) {
                await updatePet({ id: editId, ...form });
            } else {
                await addPet(form);
            }
            navigation.goBack();
        } catch (error) {
            console.error('Kayıt hatası:', error);
            Alert.alert('Hata', 'Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
        } finally {
            setSaving(false);
        }
    };

    const petColor = getPetColor(form.type, colors);

    return (
        <GlassBackground>
            <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                    {/* Fotoğraf */}
                    <TouchableOpacity style={s.photoSection} onPress={pickImage}>
                        {resolvedPhotoUrl ? (
                            <Image source={{ uri: resolvedPhotoUrl }} style={[s.photo, { borderColor: 'rgba(255,255,255,0.3)' }]} />
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
                            const selected = form.type === type;
                            return (
                                <TouchableOpacity key={type}
                                    style={[s.typeChip, { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)' }, selected && { backgroundColor: typeColor, borderColor: typeColor }]}
                                    onPress={() => setForm(f => ({ ...f, type }))}>
                                    <MaterialCommunityIcons name={info.icon} size={20} color={selected ? '#FFF' : typeColor} />
                                    <Text style={[s.typeChipText, { color: 'rgba(255,255,255,0.8)' }, selected && { color: '#FFF' }]}>{type}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Temel Bilgiler */}
                    <Text style={s.sectionTitle}>Temel Bilgiler</Text>
                    <GlassPanel borderRadius={RADIUS.lg} noPadding>
                        <InputRow icon="tag-heart" color={colors.primary} placeholder="Pet adı *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
                        <InputRow icon="dog-side" color={colors.secondary} placeholder="Cinsi (ör: Golden Retriever)" value={form.breed} onChange={v => setForm(f => ({ ...f, breed: v }))} last />
                    </GlassPanel>

                    <View style={{ marginTop: SPACING.md }}>
                        <DatePickerInput 
                            placeholder="Doğum tarihi (GG.AA.YYYY)" 
                            value={parseDateString(form.birthDate)} 
                            onChange={d => setForm(f => ({ ...f, birthDate: formatDateString(d) }))} 
                        />
                    </View>

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

                    {/* Fiziksel */}
                    <Text style={s.sectionTitle}>Fiziksel Özellikler</Text>
                    <GlassPanel borderRadius={RADIUS.lg} noPadding>
                        <InputRow icon="palette" color={colors.accent} placeholder="Renk / Desen" value={form.color} onChange={v => setForm(f => ({ ...f, color: v }))} />
                        <InputRow icon="weight-kilogram" color={colors.secondary} placeholder="Kilo (kg)" value={form.weight} onChange={v => setForm(f => ({ ...f, weight: v }))} keyboard="decimal-pad" />
                        <InputRow icon="chip" color={colors.info} placeholder="Mikroçip numarası" value={form.microchip} onChange={v => setForm(f => ({ ...f, microchip: v }))} last />
                    </GlassPanel>

                    {/* Veteriner */}
                    <Text style={s.sectionTitle}>Veteriner Bilgileri</Text>
                    <GlassPanel borderRadius={RADIUS.lg} noPadding>
                        <InputRow icon="doctor" color={colors.success} placeholder="Veteriner adı" value={form.vetName} onChange={v => setForm(f => ({ ...f, vetName: v }))} />
                        <InputRow icon="phone" color={colors.success} placeholder="Veteriner telefon" value={form.vetPhone} onChange={v => setForm(f => ({ ...f, vetPhone: v }))} keyboard="phone-pad" last />
                    </GlassPanel>

                    {/* Ek */}
                    <Text style={s.sectionTitle}>Ek Bilgiler</Text>
                    <GlassPanel borderRadius={RADIUS.lg} noPadding>
                        <InputRow icon="alert-circle" color={colors.danger} placeholder="Alerjiler" value={form.allergies} onChange={v => setForm(f => ({ ...f, allergies: v }))} />
                        <InputRow icon="note-text" color="rgba(255,255,255,0.5)" placeholder="Notlar" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} multiline last />
                    </GlassPanel>

                    {/* Kaydet */}
                    <TouchableOpacity style={s.saveButton} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                        {saving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="check-circle" size={22} color="#FFF" />
                                <Text style={s.saveButtonText}>{isEdit ? 'Güncelle' : 'Kaydet'}</Text>
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
    photo: { width: 130, height: 130, borderRadius: RADIUS.xl, borderWidth: 3 },
    photoPlaceholder: { width: 130, height: 130, borderRadius: RADIUS.xl, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed' },
    photoText: { fontSize: 12, fontWeight: '600', marginTop: 4 },
    sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.md, marginLeft: 4, color: '#FFFFFF' },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.full, borderWidth: 1.5 },
    typeChipText: { fontSize: 13, fontWeight: '600' },
    genderRow: { flexDirection: 'row', gap: SPACING.sm },
    genderChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: RADIUS.lg, borderWidth: 1.5 },
    genderText: { fontSize: 14, fontWeight: '600' },
    saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: RADIUS.xl, marginTop: SPACING.xl, backgroundColor: '#FF6B6B' },
    saveButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
