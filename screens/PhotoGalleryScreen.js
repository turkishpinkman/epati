// PhotoGalleryScreen.js — Fotoğraf Galerisi (Liquid Glass)
import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, Image,
    StyleSheet, Modal, Alert, Dimensions, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, SPACING, RADIUS } from '../utils/theme';
import { loadGallery, addGalleryPhoto, deleteGalleryPhoto, loadPet, updatePet } from '../utils/storage';
import { getTelegramFileUrl } from '../utils/telegram';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - SPACING.md * 3) / 3;

export default function PhotoGalleryScreen({ route }) {
    const { petId, petName } = route.params;
    const { colors, shadows } = useTheme();
    const [photos, setPhotos] = useState([]);
    const [pet, setPet] = useState(null);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchData = async () => {
        const [photoData, petData] = await Promise.all([loadGallery(petId), loadPet(petId)]);
        if (petData) setPet(petData);

        const items = photoData || [];
        const resolvedPhotos = await Promise.all(
            items.map(async (item) => {
                try {
                    const fileId = item.telegramFileId || item.uri;
                    const url = await getTelegramFileUrl(fileId);
                    return { ...item, resolvedUrl: url };
                } catch {
                    return { ...item, resolvedUrl: null };
                }
            })
        );
        setPhotos(resolvedPhotos);
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
            setUploading(true);
            try {
                await addGalleryPhoto(petId, result.assets[0].uri);
                await fetchData();
            } catch (error) {
                Alert.alert('Hata', 'Fotoğraf yüklenirken bir sorun oluştu.');
                console.error('Fotoğraf yükleme hatası:', error);
            } finally {
                setUploading(false);
            }
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

    const setAsProfile = async (photo) => {
        const fileId = photo.telegramFileId || photo.uri;
        await updatePet({ ...pet, photo: fileId });
        Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi!');
        fetchData();
    };

    return (
        <GlassBackground>
            <SafeAreaView style={s.container} edges={['bottom']}>
                <View style={{ height: 60 }} />
                <View style={s.headerRow}>
                    <Text style={s.headerText}>{photos.length} fotoğraf</Text>
                    <TouchableOpacity
                        style={s.addBtn}
                        onPress={pickImage}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <MaterialCommunityIcons name="camera-plus" size={18} color="#FFF" />
                        )}
                        <Text style={s.addBtnText}>{uploading ? 'Yükleniyor...' : 'Ekle'}</Text>
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
                            {item.resolvedUrl ? (
                                <Image source={{ uri: item.resolvedUrl }} style={s.tileImage} />
                            ) : (
                                <View style={[s.tileImage, s.tilePlaceholder]}>
                                    <MaterialCommunityIcons name="image-off" size={24} color="rgba(255,255,255,0.3)" />
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={s.grid}
                    ListEmptyComponent={
                        <View style={s.emptyContainer}>
                            <MaterialCommunityIcons name="image-multiple" size={56} color="rgba(255,255,255,0.3)" />
                            <Text style={s.emptyTitle}>Galeri Boş</Text>
                            <Text style={s.emptySubtitle}>Patili dostunuzun anılarını ekleyin!</Text>
                            <TouchableOpacity style={s.emptyButton} onPress={pickImage}>
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
                                <TouchableOpacity style={s.viewerBtn} onPress={() => selectedPhoto && setAsProfile(selectedPhoto)}>
                                    <MaterialCommunityIcons name="account-circle" size={22} color="#FFF" />
                                    <Text style={s.viewerBtnText}>Profil Yap</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[s.viewerBtn, { backgroundColor: 'rgba(231,76,60,0.5)' }]} onPress={() => selectedPhoto && handleDelete(selectedPhoto.id)}>
                                    <MaterialCommunityIcons name="delete" size={22} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {selectedPhoto && selectedPhoto.resolvedUrl && (
                            <Image source={{ uri: selectedPhoto.resolvedUrl }} style={s.viewerImage} resizeMode="contain" />
                        )}
                    </View>
                </Modal>
            </SafeAreaView>
        </GlassBackground>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
    headerText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: '#FF6B6B' },
    addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    grid: { paddingHorizontal: SPACING.sm, paddingBottom: 40 },
    tile: { width: TILE_SIZE, height: TILE_SIZE, margin: SPACING.xs, borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
    tileImage: { width: '100%', height: '100%' },
    tilePlaceholder: { backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: SPACING.xl },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: SPACING.md, color: '#FFF' },
    emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: SPACING.xs, color: 'rgba(255,255,255,0.5)' },
    emptyButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: SPACING.lg, paddingVertical: 14, borderRadius: RADIUS.xl, marginTop: SPACING.lg, backgroundColor: '#FF6B6B' },
    emptyButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    viewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
    viewerHeader: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, zIndex: 10 },
    viewerActions: { flexDirection: 'row', gap: SPACING.sm },
    viewerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full },
    viewerBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    viewerImage: { width: '100%', height: '70%' },
});
