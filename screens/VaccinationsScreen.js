// VaccinationsScreen.js — Aşı Takvimi (Liquid Glass)
import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput,
    StyleSheet, Modal, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { loadVaccinations, addVaccination, deleteVaccination } from '../utils/storage';
import DatePickerInput from '../components/DatePickerInput';
import { parseDateString, formatDateString } from '../utils/dateHelpers';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';

export default function VaccinationsScreen({ route, navigation }) {
    const { petId, petName } = route.params;
    const { colors, shadows } = useTheme();
    const [vaccinations, setVaccinations] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ name: '', date: '', veterinarian: '', nextDate: '', notes: '' });

    const fetchData = async () => {
        const data = await loadVaccinations(petId);
        const sorted = [...data].sort((a, b) => {
            const dateA = a.date ? parseDateString(a.date) : new Date(a.createdAt);
            const dateB = b.date ? parseDateString(b.date) : new Date(b.createdAt);
            return (dateB || new Date(0)) - (dateA || new Date(0));
        });
        setVaccinations(sorted);
    };

    useFocusEffect(useCallback(() => { fetchData(); }, [petId]));

    // Tab bar + menüsünden gelince modalı otomatik aç
    useEffect(() => {
        if (route.params?.openModal) {
            setModalVisible(true);
            // Paramı temizle ki geri dönüp tekrar açmasIn
            if (navigation.setParams) navigation.setParams({ openModal: false });
        }
    }, [route.params?.openModal]);

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

    const isUpcoming = (dateStr) => {
        if (!dateStr) return false;
        const parsed = parseDateString(dateStr);
        return parsed && parsed > new Date();
    };

    return (
        <GlassBackground>
            <SafeAreaView style={s.container} edges={['bottom']}>
                <View style={{ height: 60 }} />
                {/* Özet */}
                <View style={s.summaryRow}>
                    <GlassPanel borderRadius={RADIUS.lg} style={s.summaryCardOuter} noPadding>
                        <View style={s.summaryCardInner}>
                            <MaterialCommunityIcons name="check-circle" size={22} color="#2ECC71" />
                            <Text style={s.summaryValue}>{vaccinations.length}</Text>
                            <Text style={s.summaryLabel}>Yapılan</Text>
                        </View>
                    </GlassPanel>
                    <GlassPanel borderRadius={RADIUS.lg} style={s.summaryCardOuter} noPadding>
                        <View style={s.summaryCardInner}>
                            <MaterialCommunityIcons name="clock-alert" size={22} color="#F39C12" />
                            <Text style={[s.summaryValue, { color: '#F39C12' }]}>{vaccinations.filter(v => isUpcoming(v.nextDate)).length}</Text>
                            <Text style={s.summaryLabel}>Yaklaşan</Text>
                        </View>
                    </GlassPanel>
                </View>

                <FlatList
                    data={vaccinations}
                    renderItem={({ item }) => (
                        <GlassPanel borderRadius={RADIUS.lg} noPadding style={s.cardOuter}>
                            <View style={s.cardInner}>
                                <View style={[s.cardIndicator, { backgroundColor: isUpcoming(item.nextDate) ? '#F39C12' : '#2ECC71' }]} />
                                <View style={s.cardContent}>
                                    <View style={s.cardHeader}>
                                        <Text style={s.cardTitle}>{item.name}</Text>
                                        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
                                            <MaterialCommunityIcons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
                                        </TouchableOpacity>
                                    </View>
                                    {item.date ? (
                                        <View style={s.cardRow}>
                                            <MaterialCommunityIcons name="calendar-check" size={16} color="#2ECC71" />
                                            <Text style={s.cardRowText}>Yapıldı: {item.date}</Text>
                                        </View>
                                    ) : null}
                                    {item.nextDate ? (
                                        <View style={s.cardRow}>
                                            <MaterialCommunityIcons name="calendar-clock" size={16} color={isUpcoming(item.nextDate) ? '#F39C12' : 'rgba(255,255,255,0.4)'} />
                                            <Text style={[s.cardRowText, isUpcoming(item.nextDate) && { color: '#F39C12', fontWeight: '600' }]}>
                                                Sonraki: {item.nextDate}
                                            </Text>
                                        </View>
                                    ) : null}
                                    {item.veterinarian ? (
                                        <View style={s.cardRow}>
                                            <MaterialCommunityIcons name="doctor" size={16} color="#3498DB" />
                                            <Text style={s.cardRowText}>{item.veterinarian}</Text>
                                        </View>
                                    ) : null}
                                    {item.notes ? <Text style={s.cardNotes}>{item.notes}</Text> : null}
                                </View>
                            </View>
                        </GlassPanel>
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={s.listContent}
                    ListEmptyComponent={
                        <View style={s.emptyContainer}>
                            <MaterialCommunityIcons name="needle" size={48} color="rgba(255,255,255,0.3)" />
                            <Text style={s.emptyText}>Henüz aşı kaydı yok</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />


                <Modal visible={modalVisible} animationType="slide" transparent>
                    <View style={s.modalOverlay}>
                        <View style={[s.modalContent, { backgroundColor: 'rgba(30,30,50,0.95)' }]}>
                            <View style={s.modalHeader}>
                                <Text style={[s.modalTitle, { color: '#FFFFFF' }]}>Yeni Aşı Kaydı</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView>
                                <View style={[s.modalForm, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                                    <View style={[s.modalInputRow, { borderBottomColor: 'rgba(255,255,255,0.12)' }]}>
                                        <MaterialCommunityIcons name="needle" size={20} color={colors.secondary} />
                                        <TextInput style={[s.modalInput, { color: '#FFFFFF' }]} placeholder="Aşı adı *" placeholderTextColor="rgba(255,255,255,0.4)" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
                                    </View>
                                    <View style={{ padding: SPACING.md }}>
                                        <DatePickerInput
                                            placeholder="Yapılma tarihi"
                                            value={parseDateString(form.date)}
                                            onChange={d => setForm(f => ({ ...f, date: formatDateString(d) }))}
                                        />
                                        <View style={{ height: SPACING.sm }} />
                                        <DatePickerInput
                                            placeholder="Sonraki tarih"
                                            value={parseDateString(form.nextDate)}
                                            onChange={d => setForm(f => ({ ...f, nextDate: formatDateString(d) }))}
                                        />
                                    </View>
                                    <View style={[s.modalInputRow, { borderBottomColor: 'rgba(255,255,255,0.12)' }]}>
                                        <MaterialCommunityIcons name="doctor" size={20} color={colors.info} />
                                        <TextInput style={[s.modalInput, { color: '#FFFFFF' }]} placeholder="Veteriner" placeholderTextColor="rgba(255,255,255,0.4)" value={form.veterinarian} onChangeText={v => setForm(f => ({ ...f, veterinarian: v }))} />
                                    </View>
                                    <View style={[s.modalInputRow, { borderBottomColor: 'rgba(255,255,255,0.12)' }]}>
                                        <MaterialCommunityIcons name="note-text" size={20} color="rgba(255,255,255,0.5)" />
                                        <TextInput style={[s.modalInput, { color: '#FFFFFF' }]} placeholder="Notlar" placeholderTextColor="rgba(255,255,255,0.4)" value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} />
                                    </View>
                                </View>
                            </ScrollView>
                            <TouchableOpacity style={[s.modalSaveButton, { backgroundColor: '#FF6B6B' }]} onPress={handleAdd}>
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
    summaryRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, gap: SPACING.sm },
    summaryCardOuter: { flex: 1 },
    summaryCardInner: { alignItems: 'center', paddingVertical: SPACING.sm, gap: 4 },
    summaryValue: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
    summaryLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },
    listContent: { padding: SPACING.md, paddingBottom: 100 },
    cardOuter: { marginBottom: SPACING.sm, overflow: 'hidden', width: '100%' },
    cardInner: { flexDirection: 'row' },
    cardIndicator: { width: 4 },
    cardContent: { flex: 1, padding: SPACING.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    cardRowText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
    cardNotes: { fontSize: 12, marginTop: 6, fontStyle: 'italic', color: 'rgba(255,255,255,0.45)' },
    emptyContainer: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 15, marginTop: SPACING.md, color: 'rgba(255,255,255,0.4)' },
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
