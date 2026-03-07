// PhotoGalleryScreen.js — Fotoğraf Galerisi
import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, Image,
    StyleSheet, Modal, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { loadPets, addGalleryPhoto, deleteGalleryPhoto, updatePet } from '../utils/storage';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - SPACING.md * 3) / 3;

export default function PhotoGalleryScreen({ route }) {
    const { petId, petName } = route.params;
    const { colors, shadows } = useTheme();
    const [photos, setPhotos] = useState([]);
    const [pet, setPet] = useState(null);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const fetchData = async () => {
        const pets = await loadPets();
        const found = pets.find(p => p.id === petId);
        if (found) {
            setPet(found);
            setPhotos(found.gallery || []);
        }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, [petId]));

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Galeri izni gerekli.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.6,
        });
        if (!result.canceled && result.assets[0]) {
            await addGalleryPhoto(petId, result.assets[0].uri);
            fetchData();
        }
    };

    const handleDelete = (photoId) => {
        Alert.alert('Sil', 'Bu fotoğraf silinsin mi?', [
            { text: 'Vazgeç', style: 'cancel' },
            {
                text: 'Sil', style: 'destructive', onPress: async () => {
                    await deleteGalleryPhoto(petId, photoId);
                    setViewerVisible(false);
                    fetchData();
                }
            },
        ]);
    };

    const setAsProfile = async (uri) => {
        await updatePet({ ...pet, photo: uri });
        Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi!');
        fetchData();
    };

    const s = makeStyles(colors, shadows);

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <View style={s.headerRow}>
                <Text style={[s.headerText, { color: colors.textSecondary }]}>{photos.length} fotoğraf</Text>
                <TouchableOpacity style={[s.addBtn, { backgroundColor: colors.primary }]} onPress={pickImage}>
                    <MaterialCommunityIcons name="camera-plus" size={18} color="#FFF" />
                    <Text style={s.addBtnText}>Ekle</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={photos}
                numColumns={3}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={s.tile}
                        onPress={() => { setSelectedPhoto(item); setViewerVisible(true); }}
                        activeOpacity={0.8}
                    >
                        <Image source={{ uri: item.uri }} style={s.tileImage} />
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={s.grid}
                ListEmptyComponent={
                    <View style={s.emptyContainer}>
                        <MaterialCommunityIcons name="image-multiple" size={56} color={colors.textLight} />
                        <Text style={[s.emptyTitle, { color: colors.text }]}>Galeri Boş</Text>
                        <Text style={[s.emptySubtitle, { color: colors.textSecondary }]}>Patili dostunuzun anılarını ekleyin!</Text>
                        <TouchableOpacity style={[s.emptyButton, { backgroundColor: colors.primary }]} onPress={pickImage}>
                            <MaterialCommunityIcons name="camera-plus" size={20} color="#FFF" />
                            <Text style={s.emptyButtonText}>Fotoğraf Ekle</Text>
                        </TouchableOpacity>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />

            {/* Viewer Modal */}
            <Modal visible={viewerVisible} animationType="fade" transparent statusBarTranslucent>
                <View style={s.viewerOverlay}>
                    <View style={s.viewerHeader}>
                        <TouchableOpacity onPress={() => setViewerVisible(false)}>
                            <MaterialCommunityIcons name="close" size={28} color="#FFF" />
                        </TouchableOpacity>
                        <View style={s.viewerActions}>
                            <TouchableOpacity style={s.viewerBtn} onPress={() => selectedPhoto && setAsProfile(selectedPhoto.uri)}>
                                <MaterialCommunityIcons name="account-circle" size={22} color="#FFF" />
                                <Text style={s.viewerBtnText}>Profil Yap</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.viewerBtn, { backgroundColor: 'rgba(231,76,60,0.5)' }]} onPress={() => selectedPhoto && handleDelete(selectedPhoto.id)}>
                                <MaterialCommunityIcons name="delete" size={22} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {selectedPhoto && (
                        <Image source={{ uri: selectedPhoto.uri }} style={s.viewerImage} resizeMode="contain" />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const makeStyles = (colors, shadows) => StyleSheet.create({
    container: { flex: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
    headerText: { fontSize: 14, fontWeight: '600' },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full },
    addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    grid: { paddingHorizontal: SPACING.sm, paddingBottom: 40 },
    tile: { width: TILE_SIZE, height: TILE_SIZE, margin: SPACING.xs, borderRadius: RADIUS.md, overflow: 'hidden' },
    tileImage: { width: '100%', height: '100%' },
    emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: SPACING.xl },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: SPACING.md },
    emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: SPACING.xs },
    emptyButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: SPACING.lg, paddingVertical: 14, borderRadius: RADIUS.xl, marginTop: SPACING.lg },
    emptyButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    viewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
    viewerHeader: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, zIndex: 10 },
    viewerActions: { flexDirection: 'row', gap: SPACING.sm },
    viewerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full },
    viewerBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    viewerImage: { width: '100%', height: '70%' },
});
