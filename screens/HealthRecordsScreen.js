// HealthRecordsScreen.js — Sağlık Kayıtları (Liquid Glass)
import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput,
    StyleSheet, Modal, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { loadHealthRecords, addHealthRecord, deleteHealthRecord } from '../utils/storage';
import DatePickerInput from '../components/DatePickerInput';
import { parseDateString, formatDateString } from '../utils/dateHelpers';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';

const CATEGORIES = [
    { key: 'veteriner', label: 'Veteriner Ziyareti', icon: 'hospital-building', color: '#3498DB' },
    { key: 'ilac', label: 'İlaç', icon: 'pill', color: '#27AE60' },
    { key: 'ameliyat', label: 'Ameliyat', icon: 'medical-bag', color: '#E74C3C' },
    { key: 'genel', label: 'Genel Not', icon: 'note-text', color: '#7F8C8D' },
];

export default function HealthRecordsScreen({ route, navigation }) {
    const { petId, petName } = route.params;
    const { colors, shadows } = useTheme();
    const [records, setRecords] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ title: '', date: '', category: 'veteriner', notes: '' });

    const fetchData = async () => {
        const data = await loadHealthRecords(petId);
        const sorted = [...data].sort((a, b) => {
            const dateA = a.date ? parseDateString(a.date) : new Date(a.createdAt);
            const dateB = b.date ? parseDateString(b.date) : new Date(b.createdAt);
            return (dateB || new Date(0)) - (dateA || new Date(0));
        });
        setRecords(sorted);
    };

    useFocusEffect(useCallback(() => { fetchData(); }, [petId]));

    useEffect(() => {
        if (route.params?.openModal) {
            setModalVisible(true);
            if (navigation.setParams) navigation.setParams({ openModal: false });
        }
    }, [route.params?.openModal]);

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

    return (
        <GlassBackground>
            <SafeAreaView style={s.container} edges={['bottom']}>
                <View style={{ height: 60 }} />
                {/* Kategori Özet */}
                <View style={s.categoryRow}>
                    {CATEGORIES.map(cat => (
                        <GlassPanel key={cat.key} borderRadius={RADIUS.md} style={s.categoryCardOuter} noPadding>
                            <View style={s.categoryCardInner}>
                                <MaterialCommunityIcons name={cat.icon} size={20} color={cat.color} />
                                <Text style={[s.categoryCount, { color: cat.color }]}>
                                    {records.filter(r => r.category === cat.key).length}
                                </Text>
                            </View>
                        </GlassPanel>
                    ))}
                </View>

                <FlatList
                    data={records}
                    renderItem={({ item }) => {
                        const cat = getCategoryInfo(item.category);
                        return (
                            <GlassPanel borderRadius={RADIUS.lg} style={s.cardOuter} noPadding>
                                <View style={s.cardInner}>
                                    <View style={[s.cardIcon, { backgroundColor: cat.color + '25' }]}>
                                        <MaterialCommunityIcons name={cat.icon} size={24} color={cat.color} />
                                    </View>
                                    <View style={s.cardContent}>
                                        <View style={s.cardHeader}>
                                            <Text style={s.cardTitle}>{item.title}</Text>
                                            <TouchableOpacity onPress={() => handleDelete(item.id, item.title)}>
                                                <MaterialCommunityIcons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={s.cardMeta}>
                                            <View style={[s.categoryBadge, { backgroundColor: cat.color + '25' }]}>
                                                <Text style={[s.categoryText, { color: cat.color }]}>{cat.label}</Text>
                                            </View>
                                            {item.date ? <Text style={s.dateText}>{item.date}</Text> : null}
                                        </View>
                                        {item.notes ? <Text style={s.notesText}>{item.notes}</Text> : null}
                                    </View>
                                </View>
                            </GlassPanel>
                        );
                    }}
                    keyExtractor={item => item.id}
                    contentContainerStyle={s.listContent}
                    ListEmptyComponent={
                        <View style={s.emptyContainer}>
                            <MaterialCommunityIcons name="clipboard-pulse" size={48} color="rgba(255,255,255,0.3)" />
                            <Text style={s.emptyText}>Henüz sağlık kaydı yok</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />


                <Modal visible={modalVisible} animationType="slide" transparent>
                    <View style={s.modalOverlay}>
                        <View style={[s.modalContent, { backgroundColor: 'rgba(30,30,50,0.95)' }]}>
                            <View style={s.modalHeader}>
                                <Text style={[s.modalTitle, { color: '#FFFFFF' }]}>Yeni Sağlık Kaydı</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView>
                                <Text style={[s.modalLabel, { color: 'rgba(255,255,255,0.7)' }]}>Kategori</Text>
                                <View style={s.catGrid}>
                                    {CATEGORIES.map(cat => (
                                        <TouchableOpacity key={cat.key}
                                            style={[s.catChip, { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)' },
                                            form.category === cat.key && { backgroundColor: cat.color, borderColor: cat.color }]}
                                            onPress={() => setForm(f => ({ ...f, category: cat.key }))}>
                                            <MaterialCommunityIcons name={cat.icon} size={18} color={form.category === cat.key ? '#FFF' : cat.color} />
                                            <Text style={[s.catChipText, { color: 'rgba(255,255,255,0.8)' }, form.category === cat.key && { color: '#FFF' }]}>{cat.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={[s.modalForm, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                                    <View style={[s.modalInputRow, { borderBottomColor: 'rgba(255,255,255,0.12)' }]}>
                                        <MaterialCommunityIcons name="format-title" size={20} color={colors.primary} />
                                        <TextInput style={[s.modalInput, { color: '#FFFFFF' }]} placeholder="Başlık *" placeholderTextColor="rgba(255,255,255,0.4)" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
                                    </View>
                                    <View style={{ padding: SPACING.md }}>
                                        <DatePickerInput
                                            placeholder="Tarih"
                                            value={parseDateString(form.date)}
                                            onChange={d => setForm(f => ({ ...f, date: formatDateString(d) }))}
                                        />
                                    </View>
                                    <View style={[s.modalInputRow, { borderBottomColor: 'rgba(255,255,255,0.12)', minHeight: 80, alignItems: 'flex-start', paddingTop: 14 }]}>
                                        <MaterialCommunityIcons name="note-text" size={20} color="rgba(255,255,255,0.5)" style={{ marginTop: 2 }} />
                                        <TextInput style={[s.modalInput, { color: '#FFFFFF', textAlignVertical: 'top' }]} placeholder="Notlar" placeholderTextColor="rgba(255,255,255,0.4)" value={form.notes} multiline numberOfLines={3} onChangeText={v => setForm(f => ({ ...f, notes: v }))} />
                                    </View>
                                </View>
                            </ScrollView>
                            <TouchableOpacity style={[s.modalSaveButton, { backgroundColor: '#3498DB' }]} onPress={handleAdd}>
                                <MaterialCommunityIcons name="check-circle" size={22} color="#FFF" />
                                <Text style={s.modalSaveText}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </GlassBackground>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    categoryRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, gap: SPACING.sm },
    categoryCardOuter: { flex: 1 },
    categoryCardInner: { alignItems: 'center', paddingVertical: SPACING.sm, gap: 2 },
    categoryCount: { fontSize: 16, fontWeight: '800' },
    listContent: { padding: SPACING.md, paddingBottom: 100 },
    cardOuter: { marginBottom: SPACING.sm, overflow: 'hidden', width: '100%' },
    cardInner: { flexDirection: 'row', padding: SPACING.md },
    cardIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8, color: '#FFF' },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
    categoryText: { fontSize: 11, fontWeight: '600' },
    dateText: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
    notesText: { fontSize: 13, marginTop: 6, lineHeight: 20, color: 'rgba(255,255,255,0.5)' },
    emptyContainer: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 15, marginTop: SPACING.md, color: 'rgba(255,255,255,0.4)' },
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
