// VaccinationsScreen.js — Aşı Takvimi
import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput,
    StyleSheet, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { loadPets, addVaccination, deleteVaccination } from '../utils/storage';

export default function VaccinationsScreen({ route }) {
    const { petId, petName } = route.params;
    const { colors, shadows } = useTheme();
    const [vaccinations, setVaccinations] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ name: '', date: '', veterinarian: '', nextDate: '', notes: '' });

    const fetchData = async () => {
        const pets = await loadPets();
        const pet = pets.find(p => p.id === petId);
        if (pet) {
            const sorted = [...(pet.vaccinations || [])].sort((a, b) =>
                new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
            );
            setVaccinations(sorted);
        }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, [petId]));

    const handleAdd = async () => {
        if (!form.name.trim()) { Alert.alert('Hata', 'Aşı adını girin.'); return; }
        await addVaccination(petId, form);
        setForm({ name: '', date: '', veterinarian: '', nextDate: '', notes: '' });
        setModalVisible(false);
        fetchData();
    };

    const handleDelete = (vaccId, vaccName) => {
        Alert.alert('Sil', `"${vaccName}" silinsin mi?`, [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: async () => { await deleteVaccination(petId, vaccId); fetchData(); } },
        ]);
    };

    const isUpcoming = (dateStr) => dateStr && new Date(dateStr) > new Date();

    const s = makeStyles(colors, shadows);

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <View style={s.summaryRow}>
                <View style={[s.summaryCard, { backgroundColor: colors.success + '15' }]}>
                    <MaterialCommunityIcons name="check-circle" size={22} color={colors.success} />
                    <Text style={[s.summaryValue, { color: colors.success }]}>{vaccinations.length}</Text>
                    <Text style={[s.summaryLabel, { color: colors.textSecondary }]}>Yapılan</Text>
                </View>
                <View style={[s.summaryCard, { backgroundColor: colors.warning + '15' }]}>
                    <MaterialCommunityIcons name="clock-alert" size={22} color={colors.warning} />
                    <Text style={[s.summaryValue, { color: colors.warning }]}>{vaccinations.filter(v => isUpcoming(v.nextDate)).length}</Text>
                    <Text style={[s.summaryLabel, { color: colors.textSecondary }]}>Yaklaşan</Text>
                </View>
            </View>

            <FlatList
                data={vaccinations}
                renderItem={({ item }) => (
                    <View style={[s.card, { backgroundColor: colors.surface }, shadows.small]}>
                        <View style={[s.cardIndicator, { backgroundColor: isUpcoming(item.nextDate) ? colors.warning : colors.success }]} />
                        <View style={s.cardContent}>
                            <View style={s.cardHeader}>
                                <Text style={[s.cardTitle, { color: colors.text }]}>{item.name}</Text>
                                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
                                    <MaterialCommunityIcons name="close-circle" size={20} color={colors.textLight} />
                                </TouchableOpacity>
                            </View>
                            {item.date ? (
                                <View style={s.cardRow}>
                                    <MaterialCommunityIcons name="calendar-check" size={16} color={colors.success} />
                                    <Text style={[s.cardRowText, { color: colors.textSecondary }]}>Yapıldı: {item.date}</Text>
                                </View>
                            ) : null}
                            {item.nextDate ? (
                                <View style={s.cardRow}>
                                    <MaterialCommunityIcons name="calendar-clock" size={16} color={isUpcoming(item.nextDate) ? colors.warning : colors.textLight} />
                                    <Text style={[s.cardRowText, { color: colors.textSecondary }, isUpcoming(item.nextDate) && { color: colors.warning, fontWeight: '600' }]}>
                                        Sonraki: {item.nextDate}
                                    </Text>
                                </View>
                            ) : null}
                            {item.veterinarian ? (
                                <View style={s.cardRow}>
                                    <MaterialCommunityIcons name="doctor" size={16} color={colors.info} />
                                    <Text style={[s.cardRowText, { color: colors.textSecondary }]}>{item.veterinarian}</Text>
                                </View>
                            ) : null}
                            {item.notes ? <Text style={[s.cardNotes, { color: colors.textLight }]}>{item.notes}</Text> : null}
                        </View>
                    </View>
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={s.listContent}
                ListEmptyComponent={
                    <View style={s.emptyContainer}>
                        <MaterialCommunityIcons name="needle" size={48} color={colors.textLight} />
                        <Text style={[s.emptyText, { color: colors.textLight }]}>Henüz aşı kaydı yok</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity style={[s.fab, { backgroundColor: colors.secondary }, shadows.large]} onPress={() => setModalVisible(true)}>
                <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={[s.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={s.modalHeader}>
                            <Text style={[s.modalTitle, { color: colors.text }]}>Yeni Aşı Kaydı</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={[s.modalForm, { backgroundColor: colors.background }]}>
                            {[
                                { icon: 'needle', color: colors.secondary, placeholder: 'Aşı adı *', key: 'name' },
                                { icon: 'calendar-check', color: colors.success, placeholder: 'Yapılma tarihi (GG.AA.YYYY)', key: 'date' },
                                { icon: 'calendar-clock', color: colors.warning, placeholder: 'Sonraki tarih (GG.AA.YYYY)', key: 'nextDate' },
                                { icon: 'doctor', color: colors.info, placeholder: 'Veteriner', key: 'veterinarian' },
                                { icon: 'note-text', color: colors.textSecondary, placeholder: 'Notlar', key: 'notes' },
                            ].map((field, i) => (
                                <View key={i} style={[s.modalInputRow, { borderBottomColor: colors.divider }]}>
                                    <MaterialCommunityIcons name={field.icon} size={20} color={field.color} />
                                    <TextInput style={[s.modalInput, { color: colors.text }]} placeholder={field.placeholder} placeholderTextColor={colors.textLight} value={form[field.key]} onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))} />
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity style={[s.modalSaveButton, { backgroundColor: colors.secondary }, shadows.medium]} onPress={handleAdd}>
                            <MaterialCommunityIcons name="check-circle" size={22} color="#FFF" />
                            <Text style={s.modalSaveText}>Kaydet</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const makeStyles = (colors, shadows) => StyleSheet.create({
    container: { flex: 1 },
    summaryRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, gap: SPACING.sm },
    summaryCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.lg, gap: 4 },
    summaryValue: { fontSize: 22, fontWeight: '800' },
    summaryLabel: { fontSize: 12, fontWeight: '600' },
    listContent: { padding: SPACING.md, paddingBottom: 100 },
    card: { flexDirection: 'row', borderRadius: RADIUS.lg, marginBottom: SPACING.sm, overflow: 'hidden' },
    cardIndicator: { width: 4 },
    cardContent: { flex: 1, padding: SPACING.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '700' },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    cardRowText: { fontSize: 13 },
    cardNotes: { fontSize: 12, marginTop: 6, fontStyle: 'italic' },
    emptyContainer: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 15, marginTop: SPACING.md },
    fab: { position: 'absolute', right: SPACING.lg, bottom: SPACING.xl, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    modalForm: { borderRadius: RADIUS.lg, overflow: 'hidden' },
    modalInputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 2, borderBottomWidth: 0.5, gap: 12, minHeight: 50 },
    modalInput: { flex: 1, fontSize: 15, paddingVertical: 8 },
    modalSaveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: RADIUS.xl, marginTop: SPACING.lg },
    modalSaveText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
