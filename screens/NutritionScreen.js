// NutritionScreen.js — Beslenme Günlüğü
import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput,
    StyleSheet, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { loadPets, addNutritionEntry, deleteNutritionEntry } from '../utils/storage';

const MEAL_TYPES = [
    { key: 'sabah', label: 'Sabah', icon: 'weather-sunset-up', color: '#F39C12' },
    { key: 'ogle', label: 'Öğle', icon: 'weather-sunny', color: '#E67E22' },
    { key: 'aksam', label: 'Akşam', icon: 'weather-sunset-down', color: '#8E44AD' },
    { key: 'atistirma', label: 'Atıştırma', icon: 'cookie', color: '#27AE60' },
];

export default function NutritionScreen({ route }) {
    const { petId, petName } = route.params;
    const { colors, shadows } = useTheme();
    const [entries, setEntries] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ mealType: 'sabah', food: '', amount: '', date: '', notes: '' });

    const fetchData = async () => {
        const pets = await loadPets();
        const pet = pets.find(p => p.id === petId);
        if (pet) {
            const sorted = [...(pet.nutritionLog || [])].sort((a, b) =>
                new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
            );
            setEntries(sorted);
        }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, [petId]));

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

    // Bugünkü öğünler sayısı
    const today = new Date().toLocaleDateString('tr-TR');
    const todayMeals = entries.filter(e => e.date === today || (!e.date && new Date(e.createdAt).toLocaleDateString('tr-TR') === today));

    const s = makeStyles(colors, shadows);

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            {/* Bugünkü Özet */}
            <View style={s.todayRow}>
                {MEAL_TYPES.map(meal => {
                    const count = todayMeals.filter(e => e.mealType === meal.key).length;
                    return (
                        <View key={meal.key} style={[s.todayCard, { backgroundColor: meal.color + '12' }]}>
                            <MaterialCommunityIcons name={meal.icon} size={20} color={meal.color} />
                            <Text style={[s.todayCount, { color: meal.color }]}>{count}</Text>
                            <Text style={[s.todayLabel, { color: colors.textSecondary }]}>{meal.label}</Text>
                        </View>
                    );
                })}
            </View>

            <FlatList
                data={entries}
                renderItem={({ item }) => {
                    const meal = getMealInfo(item.mealType);
                    return (
                        <View style={[s.card, { backgroundColor: colors.surface }, shadows.small]}>
                            <View style={[s.cardIcon, { backgroundColor: meal.color + '15' }]}>
                                <MaterialCommunityIcons name={meal.icon} size={22} color={meal.color} />
                            </View>
                            <View style={s.cardContent}>
                                <View style={s.cardHeader}>
                                    <Text style={[s.cardTitle, { color: colors.text }]}>{item.food}</Text>
                                    <TouchableOpacity onPress={() => handleDelete(item.id, item.food)}>
                                        <MaterialCommunityIcons name="close-circle" size={18} color={colors.textLight} />
                                    </TouchableOpacity>
                                </View>
                                <View style={s.cardMeta}>
                                    <View style={[s.mealBadge, { backgroundColor: meal.color + '18' }]}>
                                        <Text style={[s.mealBadgeText, { color: meal.color }]}>{meal.label}</Text>
                                    </View>
                                    {item.amount ? <Text style={[s.amountText, { color: colors.textSecondary }]}>{item.amount}</Text> : null}
                                    {item.date ? <Text style={[s.dateText, { color: colors.textLight }]}>{item.date}</Text> : null}
                                </View>
                                {item.notes ? <Text style={[s.notesText, { color: colors.textLight }]}>{item.notes}</Text> : null}
                            </View>
                        </View>
                    );
                }}
                keyExtractor={item => item.id}
                contentContainerStyle={s.listContent}
                ListEmptyComponent={
                    <View style={s.emptyContainer}>
                        <MaterialCommunityIcons name="food-drumstick" size={48} color={colors.textLight} />
                        <Text style={[s.emptyText, { color: colors.textLight }]}>Henüz beslenme kaydı yok</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity style={[s.fab, { backgroundColor: colors.accentOrange }, shadows.large]} onPress={() => setModalVisible(true)}>
                <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={[s.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={s.modalHeader}>
                            <Text style={[s.modalTitle, { color: colors.text }]}>Yeni Beslenme Kaydı</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[s.modalLabel, { color: colors.text }]}>Öğün</Text>
                        <View style={s.mealGrid}>
                            {MEAL_TYPES.map(meal => (
                                <TouchableOpacity key={meal.key}
                                    style={[s.mealChip, form.mealType === meal.key && { backgroundColor: meal.color, borderColor: meal.color }, { borderColor: colors.border, backgroundColor: colors.background }]}
                                    onPress={() => setForm(f => ({ ...f, mealType: meal.key }))}>
                                    <MaterialCommunityIcons name={meal.icon} size={16} color={form.mealType === meal.key ? '#FFF' : meal.color} />
                                    <Text style={[s.mealChipText, { color: form.mealType === meal.key ? '#FFF' : colors.text }]}>{meal.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={[s.modalForm, { backgroundColor: colors.background }]}>
                            <View style={[s.modalInputRow, { borderBottomColor: colors.divider }]}>
                                <MaterialCommunityIcons name="food" size={20} color={colors.primary} />
                                <TextInput style={[s.modalInput, { color: colors.text }]} placeholder="Yiyecek adı *" placeholderTextColor={colors.textLight} value={form.food} onChangeText={v => setForm(f => ({ ...f, food: v }))} />
                            </View>
                            <View style={[s.modalInputRow, { borderBottomColor: colors.divider }]}>
                                <MaterialCommunityIcons name="scale" size={20} color={colors.secondary} />
                                <TextInput style={[s.modalInput, { color: colors.text }]} placeholder="Miktar (ör: 200g)" placeholderTextColor={colors.textLight} value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} />
                            </View>
                            <View style={[s.modalInputRow, { borderBottomColor: colors.divider }]}>
                                <MaterialCommunityIcons name="calendar" size={20} color={colors.info} />
                                <TextInput style={[s.modalInput, { color: colors.text }]} placeholder="Tarih (GG.AA.YYYY)" placeholderTextColor={colors.textLight} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} />
                            </View>
                            <View style={[s.modalInputRow, { borderBottomColor: colors.divider }]}>
                                <MaterialCommunityIcons name="note-text" size={20} color={colors.textSecondary} />
                                <TextInput style={[s.modalInput, { color: colors.text }]} placeholder="Notlar" placeholderTextColor={colors.textLight} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} />
                            </View>
                        </View>

                        <TouchableOpacity style={[s.modalSaveButton, { backgroundColor: colors.accentOrange }, shadows.medium]} onPress={handleAdd}>
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
    todayRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, gap: SPACING.xs },
    todayCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: 2 },
    todayCount: { fontSize: 16, fontWeight: '800' },
    todayLabel: { fontSize: 10, fontWeight: '600' },
    listContent: { padding: SPACING.md, paddingBottom: 100 },
    card: { flexDirection: 'row', borderRadius: RADIUS.lg, marginBottom: SPACING.sm, padding: SPACING.md },
    cardIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    mealBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
    mealBadgeText: { fontSize: 11, fontWeight: '600' },
    amountText: { fontSize: 12 },
    dateText: { fontSize: 11 },
    notesText: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 15, marginTop: SPACING.md },
    fab: { position: 'absolute', right: SPACING.lg, bottom: SPACING.xl, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
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
