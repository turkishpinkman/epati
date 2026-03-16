// WeightScreen.js — Kilo Takibi ve Grafiği (Liquid Glass)
import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput,
    StyleSheet, Modal, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { loadWeightHistory, addWeightEntry, deleteWeightEntry } from '../utils/storage';
import DatePickerInput from '../components/DatePickerInput';
import { parseDateString, formatDateString } from '../utils/dateHelpers';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';

const CHART_W = Dimensions.get('window').width - 64;
const CHART_H = 180;
const CHART_PAD = { top: 20, right: 20, bottom: 30, left: 40 };

export default function WeightScreen({ route, navigation }) {
    const { petId, petName } = route.params;
    const { colors, shadows } = useTheme();
    const [entries, setEntries] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ weight: '', date: '' });

    const fetchData = async () => {
        const data = await loadWeightHistory(petId);
        const sorted = [...data].sort((a, b) => {
            const dateA = a.date ? parseDateString(a.date) : new Date(a.createdAt);
            const dateB = b.date ? parseDateString(b.date) : new Date(b.createdAt);
            return (dateA || new Date(0)) - (dateB || new Date(0));
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
        if (!form.weight.trim()) { Alert.alert('Hata', 'Kilo girin.'); return; }
        await addWeightEntry(petId, { weight: form.weight, date: form.date || formatDateString(new Date()) });
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

        const gridLines = 4;
        const gridLinesArr = [];
        for (let i = 0; i <= gridLines; i++) {
            const y = CHART_PAD.top + (i / gridLines) * plotH;
            const val = maxW - (i / gridLines) * rangeW;
            gridLinesArr.push({ y, val: val.toFixed(1) });
        }

        return (
            <GlassPanel borderRadius={RADIUS.lg} style={s.chartOuter} noPadding>
                <View style={s.chartInner}>
                    <Text style={s.chartTitle}>Kilo Değişimi</Text>
                    <Svg width={CHART_W} height={CHART_H}>
                        {gridLinesArr.map((g, i) => (
                            <React.Fragment key={i}>
                                <Line x1={CHART_PAD.left} y1={g.y} x2={CHART_W - CHART_PAD.right} y2={g.y} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                                <SvgText x={CHART_PAD.left - 6} y={g.y + 4} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="end">{g.val}</SvgText>
                            </React.Fragment>
                        ))}
                        <Polyline points={polylinePoints} fill="none" stroke="#FF6B6B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        {points.map((p, i) => (
                            <Circle key={i} cx={p.x} cy={p.y} r={4} fill="#FF6B6B" stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
                        ))}
                    </Svg>
                    <Text style={s.chartUnit}>kg</Text>
                </View>
            </GlassPanel>
        );
    };

    return (
        <GlassBackground>
            <SafeAreaView style={s.container} edges={['bottom']}>
                <View style={{ height: 60 }} />
                {/* Özet */}
                <View style={s.summaryRow}>
                    <GlassPanel borderRadius={RADIUS.lg} style={s.summaryCardOuter} noPadding>
                        <View style={s.summaryCardInner}>
                            <MaterialCommunityIcons name="scale-bathroom" size={22} color="#FF6B6B" />
                            <Text style={s.summaryValue}>
                                {entries.length > 0 ? `${entries[entries.length - 1].weight}` : '—'}
                            </Text>
                            <Text style={s.summaryLabel}>Son Kilo (kg)</Text>
                        </View>
                    </GlassPanel>
                    <GlassPanel borderRadius={RADIUS.lg} style={s.summaryCardOuter} noPadding>
                        <View style={s.summaryCardInner}>
                            <MaterialCommunityIcons name="chart-line" size={22} color="#A29BFE" />
                            <Text style={[s.summaryValue, { color: '#A29BFE' }]}>{entries.length}</Text>
                            <Text style={s.summaryLabel}>Kayıt</Text>
                        </View>
                    </GlassPanel>
                </View>

                {renderChart()}

                <FlatList
                    data={[...entries].reverse()}
                    renderItem={({ item }) => (
                        <GlassPanel borderRadius={RADIUS.lg} style={s.cardOuter} noPadding>
                            <View style={s.cardInner}>
                                <View style={s.cardIconBg}>
                                    <MaterialCommunityIcons name="weight-kilogram" size={22} color="#FF6B6B" />
                                </View>
                                <View style={s.cardContent}>
                                    <Text style={s.cardWeight}>{item.weight} kg</Text>
                                    <Text style={s.cardDate}>{item.date || 'Tarih yok'}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(item.id, item.weight)}>
                                    <MaterialCommunityIcons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
                                </TouchableOpacity>
                            </View>
                        </GlassPanel>
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={s.listContent}
                    ListEmptyComponent={
                        <View style={s.emptyContainer}>
                            <MaterialCommunityIcons name="scale-bathroom" size={48} color="rgba(255,255,255,0.3)" />
                            <Text style={s.emptyText}>Henüz kilo kaydı yok</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />


                <Modal visible={modalVisible} animationType="slide" transparent>
                    <View style={s.modalOverlay}>
                        <View style={[s.modalContent, { backgroundColor: 'rgba(30,30,50,0.95)' }]}>
                            <View style={s.modalHeader}>
                                <Text style={[s.modalTitle, { color: '#FFFFFF' }]}>Kilo Kaydı</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                            <View style={[s.modalForm, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                                <View style={[s.modalInputRow, { borderBottomColor: 'rgba(255,255,255,0.12)' }]}>
                                    <MaterialCommunityIcons name="weight-kilogram" size={20} color={colors.primary} />
                                    <TextInput style={[s.modalInput, { color: '#FFFFFF' }]} placeholder="Kilo (kg) *" placeholderTextColor="rgba(255,255,255,0.4)" value={form.weight} keyboardType="decimal-pad" onChangeText={v => setForm(f => ({ ...f, weight: v }))} />
                                </View>
                                <View style={{ padding: SPACING.md }}>
                                    <DatePickerInput
                                        placeholder="Tarih"
                                        value={parseDateString(form.date)}
                                        onChange={d => setForm(f => ({ ...f, date: formatDateString(d) }))}
                                    />
                                </View>
                            </View>
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
    chartOuter: { marginHorizontal: SPACING.md, marginTop: SPACING.md },
    chartInner: { padding: SPACING.md, alignItems: 'center' },
    chartTitle: { fontSize: 14, fontWeight: '700', marginBottom: SPACING.sm, alignSelf: 'flex-start', color: '#FFF' },
    chartUnit: { fontSize: 11, fontWeight: '600', alignSelf: 'flex-end', marginTop: 4, color: 'rgba(255,255,255,0.5)' },
    listContent: { padding: SPACING.md, paddingBottom: 100 },
    cardOuter: { marginBottom: SPACING.sm, overflow: 'hidden', width: '100%' },
    cardInner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
    cardIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,107,107,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    cardContent: { flex: 1 },
    cardWeight: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    cardDate: { fontSize: 13, marginTop: 2, color: 'rgba(255,255,255,0.55)' },
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 15, marginTop: SPACING.md, color: 'rgba(255,255,255,0.4)' },
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
