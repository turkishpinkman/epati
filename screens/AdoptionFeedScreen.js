// AdoptionFeedScreen.js — Sahiplendirme İlanları Akışı (Liquid Glass)
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, StatusBar, Image, Dimensions, Animated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, SPACING, RADIUS, getPetColor, PET_TYPE_ICONS } from '../utils/theme';
import { loadAdoptions } from '../utils/storage';
import { batchResolveTelegramUrls, getTelegramFileUrl } from '../utils/telegram';
import GlassBackground from '../components/GlassBackground';
import GlassPanel from '../components/GlassPanel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// İçerideki ilan kartı componenti
function AdoptionCard({ adoption, onPress, photoUrlOverride }) {
    const { colors } = useTheme();
    const typeInfo = PET_TYPE_ICONS[adoption.species] || PET_TYPE_ICONS['Diğer'];
    const petColor = getPetColor(adoption.species, colors);
    const [photoUrl, setPhotoUrl] = useState(photoUrlOverride || null);

    useEffect(() => {
        let isMounted = true;
        const resolvePhoto = async () => {
            if (photoUrlOverride) { setPhotoUrl(photoUrlOverride); return; }
            if (adoption.photos && adoption.photos.length > 0) {
                try {
                    const url = await getTelegramFileUrl(adoption.photos[0]);
                    if (isMounted) setPhotoUrl(url);
                } catch {
                    if (isMounted) setPhotoUrl(null);
                }
            } else if (isMounted) setPhotoUrl(null);
        };
        resolvePhoto();
        return () => { isMounted = false; };
    }, [adoption.photos, photoUrlOverride]);

    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true,
            })
        ).start();
    }, [spinValue]);

    const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={sCard.cardWrapper}>
            <View style={sCard.glowBorderContainer}>
                <Animated.View style={[sCard.glowAnimated, { transform: [{ rotate: spin }] }]}>
                    <LinearGradient colors={[petColor, 'transparent', petColor]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
                </Animated.View>
                <View style={sCard.cardInner}>
                    <GlassPanel borderRadius={RADIUS.xl - 2} noPadding style={sCard.card}>
                        <View style={sCard.imageContainer}>
                            {photoUrl ? (
                                <Image source={{ uri: photoUrl }} style={sCard.image} resizeMode="cover" />
                            ) : (
                                <View style={[sCard.placeholderImage, { backgroundColor: petColor + '25' }]}>
                                    <MaterialCommunityIcons name={typeInfo.icon} size={72} color={petColor} />
                                </View>
                            )}
                        </View>
                        <View style={sCard.infoPanel}>
                            <View style={sCard.infoRow}>
                                <View style={sCard.infoLeft}>
                                    <Text style={sCard.title} numberOfLines={1}>{adoption.title}</Text>
                                    <View style={sCard.metaRow}>
                                        <MaterialCommunityIcons name="map-marker" size={14} color="rgba(255,255,255,0.75)" />
                                        <Text style={sCard.metaText} numberOfLines={1}>{adoption.city}</Text>
                                        <Text style={sCard.metaText}> • </Text>
                                        <Text style={sCard.metaText}>{adoption.species} {adoption.breed ? `(${adoption.breed})` : ''}</Text>
                                    </View>
                                </View>
                                {adoption.gender && (
                                    <MaterialCommunityIcons 
                                        name={adoption.gender === 'Erkek' ? 'gender-male' : 'gender-female'} 
                                        size={24} 
                                        color={adoption.gender === 'Erkek' ? '#5DADE2' : '#FF8EAA'} 
                                    />
                                )}
                            </View>
                        </View>
                    </GlassPanel>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const sCard = StyleSheet.create({
    cardWrapper: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md, width: '100%', alignItems: 'center' },
    glowBorderContainer: { width: '100%', maxWidth: 520, borderRadius: RADIUS.xl, overflow: 'hidden', position: 'relative', padding: 2 },
    glowAnimated: { position: 'absolute', top: '-50%', left: '-50%', right: '-50%', bottom: '-50%' },
    cardInner: { width: '100%', borderRadius: RADIUS.xl - 2, overflow: 'hidden', backgroundColor: '#020617' },
    card: { overflow: 'hidden', width: '100%' },
    imageContainer: { width: '100%', aspectRatio: 4 / 3, overflow: 'hidden' },
    image: { width: '100%', height: '100%' },
    placeholderImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    infoPanel: { backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    infoLeft: { flex: 1 },
    title: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
});

export default function AdoptionFeedScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [adoptions, setAdoptions] = useState([]);
    const [photoUrlMap, setPhotoUrlMap] = useState({});

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                const data = await loadAdoptions();
                setAdoptions(data);

                const photoIds = data.map(d => d.photos && d.photos[0]).filter(Boolean);
                if (photoIds.length > 0) {
                    try {
                        const map = {};
                        const resultMap = await batchResolveTelegramUrls(photoIds);
                        resultMap.forEach((url, fileId) => { map[fileId] = url; });
                        setPhotoUrlMap(map);
                    } catch { setPhotoUrlMap({}); }
                } else setPhotoUrlMap({});
            };
            fetchData();
        }, [])
    );

    const s = makeStyles(colors, isDark);

    const renderEmpty = () => (
        <View style={s.emptyContainer}>
            <GlassPanel borderRadius={RADIUS.xl} style={{ width: '100%' }}>
                <View style={s.emptyPanelInner}>
                    <MaterialCommunityIcons name="home-heart" size={64} color="rgba(255,255,255,0.8)" style={{ marginBottom: SPACING.md }} />
                    <Text style={s.emptyTitle}>Henüz ilan yok</Text>
                    <Text style={s.emptySubtitle}>Pati dostlarımızdan yuva arayan ilk kişi sen olabilirsin!</Text>
                </View>
            </GlassPanel>
        </View>
    );

    return (
        <GlassBackground>
            <SafeAreaView style={s.container}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                
                <GlassPanel borderRadius={RADIUS.xl} style={s.headerPanel}>
                    <View style={s.headerRow}>
                        <View>
                            <Text style={s.welcomeText}>Sıcak bir yuva</Text>
                            <Text style={s.titleText}>Yuva Arayanlar</Text>
                        </View>
                        <TouchableOpacity style={s.addButton} onPress={() => navigation.navigate('CreateAdoption')} activeOpacity={0.8}>
                            <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                            <Text style={s.addButtonText}>İlan Ver</Text>
                        </TouchableOpacity>
                    </View>
                </GlassPanel>

                <FlatList
                    data={adoptions}
                    renderItem={({ item }) => (
                        <AdoptionCard
                            adoption={item}
                            photoUrlOverride={item.photos?.[0] ? photoUrlMap[item.photos[0]] : null}
                            onPress={() => navigation.navigate('AdoptionDetail', { adoption: item })}
                        />
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={adoptions.length === 0 ? s.emptyList : s.listContent}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>
        </GlassBackground>
    );
}

const makeStyles = (colors, isDark) => StyleSheet.create({
    container: { flex: 1 },
    headerPanel: { marginHorizontal: SPACING.md, marginTop: SPACING.sm, marginBottom: SPACING.md },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    welcomeText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1 },
    titleText: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F43F5E', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, gap: 4 },
    addButtonText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    listContent: { paddingBottom: 100 },
    emptyList: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', paddingHorizontal: SPACING.lg },
    emptyPanelInner: { alignItems: 'center', paddingVertical: SPACING.md },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: SPACING.sm },
    emptySubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
});
