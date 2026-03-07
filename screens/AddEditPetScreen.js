// AddEditPetScreen.js — Pet Ekleme/Düzenleme Formu
import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, Image, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, PET_TYPES, GENDERS, PET_TYPE_ICONS, getPetColor, SPACING, RADIUS } from '../utils/theme';
import { addPet, updatePet, loadPets } from '../utils/storage';

export default function AddEditPetScreen({ navigation, route }) {
    const editId = route.params?.petId;
    const isEdit = !!editId;
    const { colors, shadows } = useTheme();

    const [form, setForm] = useState({
        name: '', type: 'Kedi', breed: '', birthDate: '', gender: '',
        color: '', weight: '', microchip: '', vetName: '', vetPhone: '',
        allergies: '', notes: '', photo: null,
    });

    useEffect(() => {
        if (isEdit) {
            const fetchPet = async () => {
                const pets = await loadPets();
                const pet = pets.find(p => p.id === editId);
                if (pet) {
                    setForm({
                        name: pet.name || '', type: pet.type || 'Kedi', breed: pet.breed || '',
                        birthDate: pet.birthDate || '', gender: pet.gender || '', color: pet.color || '',
                        weight: pet.weight || '', microchip: pet.microchip || '', vetName: pet.vetName || '',
                        vetPhone: pet.vetPhone || '', allergies: pet.allergies || '', notes: pet.notes || '',
                        photo: pet.photo || null,
                    });
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
        }
    };

    const handleSave = async () => {
        if (!form.name.trim()) { Alert.alert('Hata', 'Lütfen pet adını girin.'); return; }
        try {
            if (isEdit) {
                const pets = await loadPets();
                const existingPet = pets.find(p => p.id === editId);
                await updatePet({ ...existingPet, ...form });
            } else {
                await addPet(form);
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert('Hata', 'Kayıt sırasında bir hata oluştu.');
        }
    };

    const petColor = getPetColor(form.type, colors);
    const s = makeStyles(colors, shadows);

    return (
        <KeyboardAvoidingView style={[s.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                {/* Fotoğraf */}
                <TouchableOpacity style={s.photoSection} onPress={pickImage}>
                    {form.photo ? (
                        <Image source={{ uri: form.photo }} style={[s.photo, { borderColor: petColor + '30' }]} />
                    ) : (
                        <View style={[s.photoPlaceholder, { backgroundColor: petColor + '15', borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="camera-plus" size={40} color={petColor} />
                            <Text style={[s.photoText, { color: petColor }]}>Fotoğraf Ekle</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Tür Seçimi */}
                <Text style={[s.sectionTitle, { color: colors.text }]}>Tür</Text>
                <View style={s.typeGrid}>
                    {PET_TYPES.map(type => {
                        const info = PET_TYPE_ICONS[type];
                        const typeColor = getPetColor(type, colors);
                        const selected = form.type === type;
                        return (
                            <TouchableOpacity key={type}
                                style={[s.typeChip, { borderColor: colors.border, backgroundColor: colors.surface }, selected && { backgroundColor: typeColor, borderColor: typeColor }]}
                                onPress={() => setForm(f => ({ ...f, type }))}>
                                <MaterialCommunityIcons name={info.icon} size={20} color={selected ? '#FFF' : typeColor} />
                                <Text style={[s.typeChipText, { color: colors.text }, selected && { color: '#FFF' }]}>{type}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Temel Bilgiler */}
                <Text style={[s.sectionTitle, { color: colors.text }]}>Temel Bilgiler</Text>
                <View style={[s.inputGroup, { backgroundColor: colors.surface }, shadows.small]}>
                    <InputRow icon="tag-heart" color={colors.primary} placeholder="Pet adı *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} colors={colors} />
                    <InputRow icon="dog-side" color={colors.secondary} placeholder="Cinsi (ör: Golden Retriever)" value={form.breed} onChange={v => setForm(f => ({ ...f, breed: v }))} colors={colors} />
                    <InputRow icon="calendar-heart" color={colors.accentOrange} placeholder="Doğum tarihi (GG.AA.YYYY)" value={form.birthDate} onChange={v => setForm(f => ({ ...f, birthDate: v }))} colors={colors} last />
                </View>

                {/* Cinsiyet */}
                <Text style={[s.sectionTitle, { color: colors.text }]}>Cinsiyet</Text>
                <View style={s.genderRow}>
                    {GENDERS.map(g => (
                        <TouchableOpacity key={g}
                            style={[s.genderChip, { borderColor: colors.border, backgroundColor: colors.surface },
                            form.gender === g && { backgroundColor: g === 'Erkek' ? colors.info : colors.primary, borderColor: g === 'Erkek' ? colors.info : colors.primary }]}
                            onPress={() => setForm(f => ({ ...f, gender: g }))}>
                            <MaterialCommunityIcons name={g === 'Erkek' ? 'gender-male' : 'gender-female'} size={20} color={form.gender === g ? '#FFF' : (g === 'Erkek' ? colors.info : colors.primary)} />
                            <Text style={[s.genderText, { color: colors.text }, form.gender === g && { color: '#FFF' }]}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Fiziksel */}
                <Text style={[s.sectionTitle, { color: colors.text }]}>Fiziksel Özellikler</Text>
                <View style={[s.inputGroup, { backgroundColor: colors.surface }, shadows.small]}>
                    <InputRow icon="palette" color={colors.accent} placeholder="Renk / Desen" value={form.color} onChange={v => setForm(f => ({ ...f, color: v }))} colors={colors} />
                    <InputRow icon="weight-kilogram" color={colors.secondary} placeholder="Kilo (kg)" value={form.weight} onChange={v => setForm(f => ({ ...f, weight: v }))} keyboard="decimal-pad" colors={colors} />
                    <InputRow icon="chip" color={colors.info} placeholder="Mikroçip numarası" value={form.microchip} onChange={v => setForm(f => ({ ...f, microchip: v }))} colors={colors} last />
                </View>

                {/* Veteriner */}
                <Text style={[s.sectionTitle, { color: colors.text }]}>Veteriner Bilgileri</Text>
                <View style={[s.inputGroup, { backgroundColor: colors.surface }, shadows.small]}>
                    <InputRow icon="doctor" color={colors.success} placeholder="Veteriner adı" value={form.vetName} onChange={v => setForm(f => ({ ...f, vetName: v }))} colors={colors} />
                    <InputRow icon="phone" color={colors.success} placeholder="Veteriner telefon" value={form.vetPhone} onChange={v => setForm(f => ({ ...f, vetPhone: v }))} keyboard="phone-pad" colors={colors} last />
                </View>

                {/* Ek */}
                <Text style={[s.sectionTitle, { color: colors.text }]}>Ek Bilgiler</Text>
                <View style={[s.inputGroup, { backgroundColor: colors.surface }, shadows.small]}>
                    <InputRow icon="alert-circle" color={colors.danger} placeholder="Alerjiler" value={form.allergies} onChange={v => setForm(f => ({ ...f, allergies: v }))} colors={colors} />
                    <InputRow icon="note-text" color={colors.textSecondary} placeholder="Notlar" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} multiline colors={colors} last />
                </View>

                {/* Kaydet */}
                <TouchableOpacity style={[s.saveButton, { backgroundColor: colors.primary }, shadows.medium]} onPress={handleSave} activeOpacity={0.85}>
                    <MaterialCommunityIcons name="check-circle" size={22} color="#FFF" />
                    <Text style={s.saveButtonText}>{isEdit ? 'Güncelle' : 'Kaydet'}</Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function InputRow({ icon, color, placeholder, value, onChange, keyboard, multiline, colors, last }) {
    return (
        <View style={[{
            flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 2,
            borderBottomWidth: last ? 0 : 0.5, borderBottomColor: colors.divider, gap: 12,
            minHeight: multiline ? 80 : 52, alignItems: multiline ? 'flex-start' : 'center',
            paddingTop: multiline ? 14 : 2,
        }]}>
            <MaterialCommunityIcons name={icon} size={20} color={color} style={multiline ? { marginTop: 2 } : undefined} />
            <TextInput
                style={{ flex: 1, fontSize: 15, color: colors.text, paddingVertical: 8, textAlignVertical: multiline ? 'top' : 'center' }}
                placeholder={placeholder} placeholderTextColor={colors.textLight}
                value={value} onChangeText={onChange} keyboardType={keyboard || 'default'}
                multiline={multiline} numberOfLines={multiline ? 3 : 1}
            />
        </View>
    );
}

const makeStyles = (colors, shadows) => StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: SPACING.md },
    photoSection: { alignItems: 'center', marginBottom: SPACING.lg },
    photo: { width: 130, height: 130, borderRadius: RADIUS.xl, borderWidth: 4 },
    photoPlaceholder: { width: 130, height: 130, borderRadius: RADIUS.xl, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed' },
    photoText: { fontSize: 12, fontWeight: '600', marginTop: 4 },
    sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.md, marginLeft: 4 },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.full, borderWidth: 1.5 },
    typeChipText: { fontSize: 13, fontWeight: '600' },
    genderRow: { flexDirection: 'row', gap: SPACING.sm },
    genderChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: RADIUS.lg, borderWidth: 1.5 },
    genderText: { fontSize: 14, fontWeight: '600' },
    inputGroup: { borderRadius: RADIUS.lg, overflow: 'hidden' },
    saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: RADIUS.xl, marginTop: SPACING.xl },
    saveButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
