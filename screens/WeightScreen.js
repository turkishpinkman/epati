// WeightScreen.js — Kilo Takibi ve Grafiği
import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput,
    StyleSheet, Modal, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { loadPets, addWeightEntry, deleteWeightEntry } from '../utils/storage';

const CHART_W = Dimensions.get('window').width - 64;
const CHART_H = 180;
const CHART_PAD = { top: 20, right: 20, bottom: 30, left: 40 };

export default function WeightScreen({ route }) {
    const { petId, petName } = route.params;
    const { colors, shadows } = useTheme();
    const [entries, setEntries] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ weight: '', date: '' });

    const fetchData = async () => {
        const pets = await loadPets();
        const pet = pets.find(p => p.id === petId);
        if (pet) {
            const sorted = [...(pet.weightHistory || [])].sort((a, b) =>
                new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
            );
            setEntries(sorted);
        }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, [petId]));

    const handleAdd = async () => {
        if (!form.weight.trim()) { Alert.alert('Hata', 'Kilo girin.'); return; }
        await addWeightEntry(petId, { weight: form.weight, date: form.date || new Date().toLocaleDateString('tr-TR') });
        setForm({ weight: '', date: '' });
        setModalVisible(false);
        fetchData();
    };

    const handleDelete = (id, w) => {
        Alert.alert('Sil', `${w} kg kaydı silinsin mi?`, [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: async () => { await deleteWeightEntry(petId, id); fetchData(); } },
        ]);
    };

    // Grafik hesaplama
    const renderChart = () => {
        if (entries.length < 2) return null;
        const weights = entries.map(e => parseFloat(e.weight)).filter(w => !isNaN(w));
        if (weights.length < 2) return null;

        const minW = Math.min(...weights) * 0.9;
        const maxW = Math.max(...weights) * 1.1;
        const rangeW = maxW - minW || 1;

        const plotW = CHART_W - CHART_PAD.left - CHART_PAD.right;
        const plotH = CHART_H - CHART_PAD.top - CHART_PAD.bottom;

        const points = weights.map((w, i) => ({
            x: CHART_PAD.left + (i / (weights.length - 1)) * plotW,
            y: CHART_PAD.top + plotH - ((w - minW) / rangeW) * plotH,
        }));

        const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

        // Grid çizgileri
        const gridLines = 4;
        const gridLinesArr = [];
        for (let i = 0; i <= gridLines; i++) {
            const y = CHART_PAD.top + (i / gridLines) * plotH;
            const val = maxW - (i / gridLines) * rangeW;
            gridLinesArr.push({ y, val: val.toFixed(1) });
        }

        return (
            <View style={[s.chartContainer, { backgroundColor: colors.surface }, shadows.medium]}>
                <Text style={[s.chartTitle, { color: colors.text }]}>Kilo Değişimi</Text>
                <Svg width={CHART_W} height={CHART_H}>
                    {gridLinesArr.map((g, i) => (
                        <React.Fragment key={i}>
                            <Line x1={CHART_PAD.left} y1={g.y} x2={CHART_W - CHART_PAD.right} y2={g.y} stroke={colors.divider} strokeWidth={1} />
                            <SvgText x={CHART_PAD.left - 6} y={g.y + 4} fill={colors.textLight} fontSize={10} textAnchor="end">{g.val}</SvgText>
                        </React.Fragment>
                    ))}
                    <Polyline points={polylinePoints} fill="none" stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (
                        <Circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.primary} stroke={colors.surface} strokeWidth={2} />
                    ))}
                </Svg>
                <Text style={[s.chartUnit, { color: colors.textLight }]}>kg</Text>
            </View>
        );
    };

    const s = makeStyles(colors, shadows);

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            {/* Özet */}
            <View style={s.summaryRow}>
                <View style={[s.summaryCard, { backgroundColor: colors.primary + '15' }]}>
                    <MaterialCommunityIcons name="scale-bathroom" size={22} color={colors.primary} />
                    <Text style={[s.summaryValue, { color: colors.primary }]}>
                        {entries.length > 0 ? `${entries[entries.length - 1].weight}` : '—'}
                    </Text>
                    <Text style={[s.summaryLabel, { color: colors.textSecondary }]}>Son Kilo (kg)</Text>
                </View>
                <View style={[s.summaryCard, { backgroundColor: colors.secondary + '15' }]}>
                    <MaterialCommunityIcons name="chart-line" size={22} color={colors.secondary} />
                    <Text style={[s.summaryValue, { color: colors.secondary }]}>{entries.length}</Text>
                    <Text style={[s.summaryLabel, { color: colors.textSecondary }]}>Kayıt</Text>
                </View>
            </View>

            {renderChart()}

            <FlatList
                data={[...entries].reverse()}
                renderItem={({ item }) => (
                    <View style={[s.card, { backgroundColor: colors.surface }, shadows.small]}>
                        <View style={[s.cardIconBg, { backgroundColor: colors.primary + '15' }]}>
                            <MaterialCommunityIcons name="weight-kilogram" size={22} color={colors.primary} />
                        </View>
                        <View style={s.cardContent}>
                            <Text style={[s.cardWeight, { color: colors.text }]}>{item.weight} kg</Text>
                            <Text style={[s.cardDate, { color: colors.textSecondary }]}>{item.date || 'Tarih yok'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item.id, item.weight)}>
                            <MaterialCommunityIcons name="close-circle" size={20} color={colors.textLight} />
                        </TouchableOpacity>
                    </View>
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={s.listContent}
                ListEmptyComponent={
                    <View style={s.emptyContainer}>
                        <MaterialCommunityIcons name="scale-bathroom" size={48} color={colors.textLight} />
                        <Text style={[s.emptyText, { color: colors.textLight }]}>Henüz kilo kaydı yok</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity style={[s.fab, { backgroundColor: colors.primary }, shadows.large]} onPress={() => setModalVisible(true)}>
                <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={[s.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={s.modalHeader}>
                            <Text style={[s.modalTitle, { color: colors.text }]}>Kilo Kaydı</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={[s.modalForm, { backgroundColor: colors.background }]}>
                            <View style={[s.modalInputRow, { borderBottomColor: colors.divider }]}>
                                <MaterialCommunityIcons name="weight-kilogram" size={20} color={colors.primary} />
                                <TextInput style={[s.modalInput, { color: colors.text }]} placeholder="Kilo (kg) *" placeholderTextColor={colors.textLight} value={form.weight} keyboardType="decimal-pad" onChangeText={v => setForm(f => ({ ...f, weight: v }))} />
                            </View>
                            <View style={[s.modalInputRow, { borderBottomColor: colors.divider }]}>
                                <MaterialCommunityIcons name="calendar" size={20} color={colors.info} />
                                <TextInput style={[s.modalInput, { color: colors.text }]} placeholder="Tarih (GG.AA.YYYY)" placeholderTextColor={colors.textLight} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} />
                            </View>
                        </View>
                        <TouchableOpacity style={[s.modalSaveButton, { backgroundColor: colors.primary }, shadows.medium]} onPress={handleAdd}>
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
    chartContainer: { marginHorizontal: SPACING.md, marginTop: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
    chartTitle: { fontSize: 14, fontWeight: '700', marginBottom: SPACING.sm, alignSelf: 'flex-start' },
    chartUnit: { fontSize: 11, fontWeight: '600', alignSelf: 'flex-end', marginTop: 4 },
    listContent: { padding: SPACING.md, paddingBottom: 100 },
    card: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, marginBottom: SPACING.sm, padding: SPACING.md },
    cardIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    cardContent: { flex: 1 },
    cardWeight: { fontSize: 16, fontWeight: '700' },
    cardDate: { fontSize: 13, marginTop: 2 },
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 15, marginTop: SPACING.md },
    fab: { position: 'absolute', right: SPACING.lg, bottom: SPACING.xl, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    modalForm: { borderRadius: RADIUS.lg, overflow: 'hidden' },
    modalInputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 2, borderBottomWidth: 0.5, gap: 12, minHeight: 50 },
    modalInput: { flex: 1, fontSize: 15, paddingVertical: 8 },
    modalSaveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: RADIUS.xl, marginTop: SPACING.lg },
    modalSaveText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
