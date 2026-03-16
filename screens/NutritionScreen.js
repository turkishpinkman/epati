// NutritionScreen.js — Beslenme Günlüğü (Liquid Glass)
import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput,
    StyleSheet, Modal, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { loadNutritionLog, addNutritionEntry, deleteNutritionEntry } from '../utils/storage';
import DatePickerInput from '../components/DatePickerInput';
import { parseDateString, formatDateString } from '../utils/dateHelpers';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';

const MEAL_TYPES = [
    { key: 'sabah', label: 'Sabah', icon: 'weather-sunset-up', color: '#F39C12' },
    { key: 'ogle', label: 'Öğle', icon: 'weather-sunny', color: '#E67E22' },
    { key: 'aksam', label: 'Akşam', icon: 'weather-sunset-down', color: '#8E44AD' },
    { key: 'atistirma', label: 'Atıştırma', icon: 'cookie', color: '#27AE60' },
];

export default function NutritionScreen({ route, navigation }) {
    const { petId, petName } = route.params;
    const { colors, shadows } = useTheme();
    const [entries, setEntries] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ mealType: 'sabah', food: '', amount: '', date: '', notes: '' });

    const fetchData = async () => {
        const data = await loadNutritionLog(petId);
        const sorted = [...data].sort((a, b) => {
            const dateA = a.date ? parseDateString(a.date) : new Date(a.createdAt);
            const dateB = b.date ? parseDateString(b.date) : new Date(b.createdAt);
            return (dateB || new Date(0)) - (dateA || new Date(0));
        });
        setEntries(sorted);
    };

    useFocusEffect(useCallback(() => { fetchData(); }, [petId]));

    useEffect(() => {
        if (route.params?.openModal) {
            setModalVisible(true);
            if (navigation.setParams) navigation.setParams({ openModal: false });
        }
    }, [route.params?.openModal]);

    const handleAdd = async () => {
        if (!form.food.trim()) { Alert.alert('Hata', 'Yiyecek adı girin.'); return; }
        await addNutritionEntry(petId, form);
        setForm({ mealType: 'sabah', food: '', amount: '', date: '', notes: '' });
        setModalVisible(false);
        fetchData();
    };

    const handleDelete = (id, name) => {
        Alert.alert('Sil', `"${name}" silinsin mi?`, [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: async () => { await deleteNutritionEntry(petId, id); fetchData(); } },
        ]);
    };

    const getMealInfo = (key) => MEAL_TYPES.find(m => m.key === key) || MEAL_TYPES[0];

    const todayStr = formatDateString(new Date());
    const todayMeals = entries.filter(e => {
        if (e.date) return e.date === todayStr;
        return formatDateString(new Date(e.createdAt)) === todayStr;
    });

    return (
        <GlassBackground>
            <SafeAreaView style={s.container} edges={['bottom']}>
                <View style={{ height: 60 }} />
                {/* Bugünkü Özet */}
                <View style={s.todayRow}>
                    {MEAL_TYPES.map(meal => {
                        const count = todayMeals.filter(e => e.mealType === meal.key).length;
                        return (
                            <GlassPanel key={meal.key} borderRadius={RADIUS.md} style={s.todayCardOuter} noPadding>
                                <View style={s.todayCardInner}>
                                    <MaterialCommunityIcons name={meal.icon} size={20} color={meal.color} />
                                    <Text style={[s.todayCount, { color: meal.color }]}>{count}</Text>
                                    <Text style={s.todayLabel}>{meal.label}</Text>
                                </View>
                            </GlassPanel>
                        );
                    })}
                </View>

                <FlatList
                    data={entries}
                    renderItem={({ item }) => {
                        const meal = getMealInfo(item.mealType);
                        return (
                            <GlassPanel borderRadius={RADIUS.lg} style={s.cardOuter} noPadding>
                                <View style={s.cardInner}>
                                    <View style={[s.cardIcon, { backgroundColor: meal.color + '25' }]}>
                                        <MaterialCommunityIcons name={meal.icon} size={22} color={meal.color} />
                                    </View>
                                    <View style={s.cardContent}>
                                        <View style={s.cardHeader}>
                                            <Text style={s.cardTitle}>{item.food}</Text>
                                            <TouchableOpacity onPress={() => handleDelete(item.id, item.food)}>
                                                <MaterialCommunityIcons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={s.cardMeta}>
                                            <View style={[s.mealBadge, { backgroundColor: meal.color + '25' }]}>
                                                <Text style={[s.mealBadgeText, { color: meal.color }]}>{meal.label}</Text>
                                            </View>
                                            {item.amount ? <Text style={s.amountText}>{item.amount}</Text> : null}
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
                            <MaterialCommunityIcons name="food-drumstick" size={48} color="rgba(255,255,255,0.3)" />
                            <Text style={s.emptyText}>Henüz beslenme kaydı yok</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />


                <Modal visible={modalVisible} animationType="slide" transparent>
                    <View style={s.modalOverlay}>
                        <View style={[s.modalContent, { backgroundColor: 'rgba(30,30,50,0.95)' }]}>
                            <View style={s.modalHeader}>
                                <Text style={[s.modalTitle, { color: '#FFFFFF' }]}>Yeni Beslenme Kaydı</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView>
                                <Text style={[s.modalLabel, { color: 'rgba(255,255,255,0.7)' }]}>Öğün</Text>
                                <View style={s.mealGrid}>
                                    {MEAL_TYPES.map(meal => (
                                        <TouchableOpacity key={meal.key}
                                            style={[s.mealChip, { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)' }, form.mealType === meal.key && { backgroundColor: meal.color, borderColor: meal.color }]}
                                            onPress={() => setForm(f => ({ ...f, mealType: meal.key }))}>
                                            <MaterialCommunityIcons name={meal.icon} size={16} color={form.mealType === meal.key ? '#FFF' : meal.color} />
                                            <Text style={[s.mealChipText, { color: form.mealType === meal.key ? '#FFF' : 'rgba(255,255,255,0.8)' }]}>{meal.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={[s.modalForm, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                                    <View style={[s.modalInputRow, { borderBottomColor: 'rgba(255,255,255,0.12)' }]}>
                                        <MaterialCommunityIcons name="food" size={20} color={colors.primary} />
                                        <TextInput style={[s.modalInput, { color: '#FFFFFF' }]} placeholder="Yiyecek adı *" placeholderTextColor="rgba(255,255,255,0.4)" value={form.food} onChangeText={v => setForm(f => ({ ...f, food: v }))} />
                                    </View>
                                    <View style={[s.modalInputRow, { borderBottomColor: 'rgba(255,255,255,0.12)' }]}>
                                        <MaterialCommunityIcons name="scale" size={20} color={colors.secondary} />
                                        <TextInput style={[s.modalInput, { color: '#FFFFFF' }]} placeholder="Miktar (ör: 200g)" placeholderTextColor="rgba(255,255,255,0.4)" value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} />
                                    </View>
                                    <View style={{ padding: SPACING.md }}>
                                        <DatePickerInput
                                            placeholder="Tarih"
                                            value={parseDateString(form.date)}
                                            onChange={d => setForm(f => ({ ...f, date: formatDateString(d) }))}
                                        />
                                    </View>
                                    <View style={[s.modalInputRow, { borderBottomColor: 'rgba(255,255,255,0.12)' }]}>
                                        <MaterialCommunityIcons name="note-text" size={20} color="rgba(255,255,255,0.5)" />
                                        <TextInput style={[s.modalInput, { color: '#FFFFFF' }]} placeholder="Notlar" placeholderTextColor="rgba(255,255,255,0.4)" value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} />
                                    </View>
                                </View>
                            </ScrollView>
                            <TouchableOpacity style={[s.modalSaveButton, { backgroundColor: '#E67E22' }]} onPress={handleAdd}>
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
    todayRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, gap: SPACING.xs },
    todayCardOuter: { flex: 1 },
    todayCardInner: { alignItems: 'center', paddingVertical: SPACING.sm, gap: 2 },
    todayCount: { fontSize: 16, fontWeight: '800' },
    todayLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },
    listContent: { padding: SPACING.md, paddingBottom: 100 },
    cardOuter: { marginBottom: SPACING.sm, overflow: 'hidden', width: '100%' },
    cardInner: { flexDirection: 'row', padding: SPACING.md },
    cardIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8, color: '#FFF' },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    mealBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
    mealBadgeText: { fontSize: 11, fontWeight: '600' },
    amountText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
    dateText: { fontSize: 11, color: 'rgba(255,255,255,0.45)' },
    notesText: { fontSize: 12, marginTop: 4, fontStyle: 'italic', color: 'rgba(255,255,255,0.45)' },
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 15, marginTop: SPACING.md, color: 'rgba(255,255,255,0.4)' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: SPACING.sm },
    mealGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
    mealChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1.5 },
    mealChipText: { fontSize: 11, fontWeight: '600' },
    modalForm: { borderRadius: RADIUS.lg, overflow: 'hidden' },
    modalInputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 2, borderBottomWidth: 0.5, gap: 12, minHeight: 50 },
    modalInput: { flex: 1, fontSize: 15, paddingVertical: 8 },
    modalSaveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: RADIUS.xl, marginTop: SPACING.lg },
    modalSaveText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
