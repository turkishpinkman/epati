// HealthRecordsScreen.js — Sağlık Kayıtları
import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput,
    StyleSheet, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { loadPets, addHealthRecord, deleteHealthRecord } from '../utils/storage';

const CATEGORIES = [
    { key: 'veteriner', label: 'Veteriner Ziyareti', icon: 'hospital-building', color: '#3498DB' },
    { key: 'ilac', label: 'İlaç', icon: 'pill', color: '#27AE60' },
    { key: 'ameliyat', label: 'Ameliyat', icon: 'medical-bag', color: '#E74C3C' },
    { key: 'genel', label: 'Genel Not', icon: 'note-text', color: '#7F8C8D' },
];

export default function HealthRecordsScreen({ route }) {
    const { petId, petName } = route.params;
    const { colors, shadows } = useTheme();
    const [records, setRecords] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ title: '', date: '', category: 'veteriner', notes: '' });

    const fetchData = async () => {
        const pets = await loadPets();
        const pet = pets.find(p => p.id === petId);
        if (pet) {
            const sorted = [...(pet.healthRecords || [])].sort((a, b) =>
                new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
            );
            setRecords(sorted);
        }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, [petId]));

    const handleAdd = async () => {
        if (!form.title.trim()) { Alert.alert('Hata', 'Başlık girin.'); return; }
        await addHealthRecord(petId, form);
        setForm({ title: '', date: '', category: 'veteriner', notes: '' });
        setModalVisible(false);
        fetchData();
    };

    const handleDelete = (recordId, title) => {
        Alert.alert('Sil', `"${title}" silinsin mi?`, [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: async () => { await deleteHealthRecord(petId, recordId); fetchData(); } },
        ]);
    };

    const getCategoryInfo = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[3];
    const s = makeStyles(colors, shadows);

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <View style={s.categoryRow}>
                {CATEGORIES.map(cat => (
                    <View key={cat.key} style={[s.categoryCard, { backgroundColor: cat.color + '10' }]}>
                        <MaterialCommunityIcons name={cat.icon} size={20} color={cat.color} />
                        <Text style={[s.categoryCount, { color: cat.color }]}>
                            {records.filter(r => r.category === cat.key).length}
                        </Text>
                    </View>
                ))}
            </View>

            <FlatList
                data={records}
                renderItem={({ item }) => {
                    const cat = getCategoryInfo(item.category);
                    return (
                        <View style={[s.card, { backgroundColor: colors.surface }, shadows.small]}>
                            <View style={[s.cardIcon, { backgroundColor: cat.color + '15' }]}>
                                <MaterialCommunityIcons name={cat.icon} size={24} color={cat.color} />
                            </View>
                            <View style={s.cardContent}>
                                <View style={s.cardHeader}>
                                    <Text style={[s.cardTitle, { color: colors.text }]}>{item.title}</Text>
                                    <TouchableOpacity onPress={() => handleDelete(item.id, item.title)}>
                                        <MaterialCommunityIcons name="close-circle" size={20} color={colors.textLight} />
                                    </TouchableOpacity>
                                </View>
                                <View style={s.cardMeta}>
                                    <View style={[s.categoryBadge, { backgroundColor: cat.color + '15' }]}>
                                        <Text style={[s.categoryText, { color: cat.color }]}>{cat.label}</Text>
                                    </View>
                                    {item.date ? <Text style={[s.dateText, { color: colors.textSecondary }]}>{item.date}</Text> : null}
                                </View>
                                {item.notes ? <Text style={[s.notesText, { color: colors.textSecondary }]}>{item.notes}</Text> : null}
                            </View>
                        </View>
                    );
                }}
                keyExtractor={item => item.id}
                contentContainerStyle={s.listContent}
                ListEmptyComponent={
                    <View style={s.emptyContainer}>
                        <MaterialCommunityIcons name="clipboard-pulse" size={48} color={colors.textLight} />
                        <Text style={[s.emptyText, { color: colors.textLight }]}>Henüz sağlık kaydı yok</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity style={[s.fab, { backgroundColor: colors.info }, shadows.large]} onPress={() => setModalVisible(true)}>
                <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={[s.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={s.modalHeader}>
                            <Text style={[s.modalTitle, { color: colors.text }]}>Yeni Sağlık Kaydı</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[s.modalLabel, { color: colors.text }]}>Kategori</Text>
                        <View style={s.catGrid}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity key={cat.key}
                                    style={[s.catChip, { borderColor: colors.border, backgroundColor: colors.background },
                                    form.category === cat.key && { backgroundColor: cat.color, borderColor: cat.color }]}
                                    onPress={() => setForm(f => ({ ...f, category: cat.key }))}>
                                    <MaterialCommunityIcons name={cat.icon} size={18} color={form.category === cat.key ? '#FFF' : cat.color} />
                                    <Text style={[s.catChipText, { color: colors.text }, form.category === cat.key && { color: '#FFF' }]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={[s.modalForm, { backgroundColor: colors.background }]}>
                            <View style={[s.modalInputRow, { borderBottomColor: colors.divider }]}>
                                <MaterialCommunityIcons name="format-title" size={20} color={colors.primary} />
                                <TextInput style={[s.modalInput, { color: colors.text }]} placeholder="Başlık *" placeholderTextColor={colors.textLight} value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
                            </View>
                            <View style={[s.modalInputRow, { borderBottomColor: colors.divider }]}>
                                <MaterialCommunityIcons name="calendar" size={20} color={colors.info} />
                                <TextInput style={[s.modalInput, { color: colors.text }]} placeholder="Tarih (GG.AA.YYYY)" placeholderTextColor={colors.textLight} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} />
                            </View>
                            <View style={[s.modalInputRow, { borderBottomColor: colors.divider, minHeight: 80, alignItems: 'flex-start', paddingTop: 14 }]}>
                                <MaterialCommunityIcons name="note-text" size={20} color={colors.textSecondary} style={{ marginTop: 2 }} />
                                <TextInput style={[s.modalInput, { color: colors.text, textAlignVertical: 'top' }]} placeholder="Notlar" placeholderTextColor={colors.textLight} value={form.notes} multiline numberOfLines={3} onChangeText={v => setForm(f => ({ ...f, notes: v }))} />
                            </View>
                        </View>

                        <TouchableOpacity style={[s.modalSaveButton, { backgroundColor: colors.info }, shadows.medium]} onPress={handleAdd}>
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
    categoryRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, gap: SPACING.sm },
    categoryCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: 2 },
    categoryCount: { fontSize: 16, fontWeight: '800' },
    listContent: { padding: SPACING.md, paddingBottom: 100 },
    card: { flexDirection: 'row', borderRadius: RADIUS.lg, marginBottom: SPACING.sm, padding: SPACING.md },
    cardIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
    categoryText: { fontSize: 11, fontWeight: '600' },
    dateText: { fontSize: 12 },
    notesText: { fontSize: 13, marginTop: 6, lineHeight: 20 },
    emptyContainer: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 15, marginTop: SPACING.md },
    fab: { position: 'absolute', right: SPACING.lg, bottom: SPACING.xl, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: SPACING.sm },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
    catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1.5 },
    catChipText: { fontSize: 12, fontWeight: '600' },
    modalForm: { borderRadius: RADIUS.lg, overflow: 'hidden' },
    modalInputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 2, borderBottomWidth: 0.5, gap: 12, minHeight: 50 },
    modalInput: { flex: 1, fontSize: 15, paddingVertical: 8 },
    modalSaveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: RADIUS.xl, marginTop: SPACING.lg },
    modalSaveText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
