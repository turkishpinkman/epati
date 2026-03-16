// e-pati — Evcil Hayvan Kimlik & Profil Uygulaması (Liquid Glass)
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './utils/theme';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './utils/firebase';
import {
    View, ActivityIndicator, Platform, StyleSheet,
    TouchableOpacity, Text, Animated, Modal, Pressable, Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { _resetUserId } from './utils/storage';

// Global son aktif pet bilgisi
let _lastActivePet = null;
export function setLastActivePet(petId, petName) {
    _lastActivePet = { petId, petName };
}
export function getLastActivePet() {
    return _lastActivePet;
}

import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import PetDetailScreen from './screens/PetDetailScreen';
import AddEditPetScreen from './screens/AddEditPetScreen';
import VaccinationsScreen from './screens/VaccinationsScreen';
import HealthRecordsScreen from './screens/HealthRecordsScreen';
import WeightScreen from './screens/WeightScreen';
import NutritionScreen from './screens/NutritionScreen';
import PhotoGalleryScreen from './screens/PhotoGalleryScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTab() {
    const { colors } = useTheme();
    return (
        <Stack.Navigator screenOptions={{
            headerStyle: { backgroundColor: 'transparent' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            headerShadowVisible: false,
            headerTransparent: true,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'slide_from_right',
        }}>
            <Stack.Screen name="HomeList" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PetDetail" component={PetDetailScreen} options={{ title: 'Profil' }} />
            <Stack.Screen name="AddEditPet" component={AddEditPetScreen}
                options={({ route }) => ({ title: route.params?.petId ? 'Düzenle' : 'Yeni Pet Ekle', presentation: 'modal', headerTransparent: true, headerStyle: { backgroundColor: 'transparent' } , headerTintColor: '#FFFFFF' })} />
            <Stack.Screen name="Vaccinations" component={VaccinationsScreen}
                options={({ route }) => ({ title: `${route.params?.petName || ''} — Aşılar` })} />
            <Stack.Screen name="HealthRecords" component={HealthRecordsScreen}
                options={({ route }) => ({ title: `${route.params?.petName || ''} — Sağlık` })} />
            <Stack.Screen name="Weight" component={WeightScreen}
                options={({ route }) => ({ title: `${route.params?.petName || ''} — Kilo` })} />
            <Stack.Screen name="Nutrition" component={NutritionScreen}
                options={({ route }) => ({ title: `${route.params?.petName || ''} — Beslenme` })} />
            <Stack.Screen name="PhotoGallery" component={PhotoGalleryScreen}
                options={({ route }) => ({ title: `${route.params?.petName || ''} — Galeri` })} />
        </Stack.Navigator>
    );
}

// Placeholder screen — "+" tab'ı için (hiç render edilmeyecek)
function DummyScreen() {
    return <View />;
}

// ─────────────── Floating Action Menu ───────────────
function ActionMenu({ visible, onClose, onAction }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(40);
        }
    }, [visible]);

    if (!visible) return null;

    const actions = [
        { icon: 'plus-circle', label: 'Pet Ekle', key: 'addPet', color: '#6366F1' },
        { icon: 'food-drumstick', label: 'Beslenme Kaydı', key: 'addNutrition', color: '#FB923C' },
        { icon: 'scale-bathroom', label: 'Kilo Kaydı', key: 'addWeight', color: '#22C55E' },
        { icon: 'clipboard-pulse', label: 'Sağlık Kaydı', key: 'addHealth', color: '#38BDF8' },
        { icon: 'needle', label: 'Aşı Kaydı', key: 'addVaccination', color: '#E879F9' },
    ];

    return (
        <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
            <Pressable style={menuStyles.overlay} onPress={onClose}>
                <Animated.View style={[menuStyles.menuContainer, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }]}>
                    <View style={menuStyles.menuPanel}>
                        {/* Cam efekti arka plan */}
                        {Platform.OS === 'web' ? (
                            <View style={[StyleSheet.absoluteFill, menuStyles.menuGlassWeb]} />
                        ) : null}
                        {actions.map((action, i) => (
                            <TouchableOpacity
                                key={action.key}
                                style={[menuStyles.menuItem, i === actions.length - 1 && { borderBottomWidth: 0 }]}
                                activeOpacity={0.7}
                                onPress={() => {
                                    onClose();
                                    onAction(action.key);
                                }}
                            >
                                <View style={[menuStyles.menuIconCircle, { backgroundColor: action.color + '20' }]}>
                                    <MaterialCommunityIcons name={action.icon} size={22} color={action.color} />
                                </View>
                                <Text style={menuStyles.menuLabel}>{action.label}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.35)" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

const menuStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        paddingBottom: 120,
        paddingHorizontal: 24,
    },
    menuContainer: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    menuPanel: {
        borderRadius: 24,
        overflow: 'hidden',
        ...(Platform.OS === 'web' ? {
            backgroundColor: 'rgba(20, 25, 50, 0.65)',
            backdropFilter: 'blur(30px) saturate(150%)',
            WebkitBackdropFilter: 'blur(30px) saturate(150%)',
            boxShadow: 'inset 0 0 30px rgba(255,255,255,0.05), 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
        } : {
            backgroundColor: 'rgba(20, 25, 50, 0.85)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
        }),
    },
    menuGlassWeb: {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    menuIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

// ─────────────── Custom Tab Bar ───────────────
function FloatingTabBar({ state, descriptors, navigation }) {
    const [menuVisible, setMenuVisible] = useState(false);

    // "+" butonuna basıldığında menüyü aç
    const handlePlusPress = () => {
        setMenuVisible(true);
    };

    // Menü aksiyonlarını yönet
    const handleMenuAction = (key) => {
        const homeNav = navigation;
        if (key === 'addPet') {
            homeNav.navigate('HomeTab', { screen: 'AddEditPet' });
            return;
        }

        // Kayıt ekleme: aktif pet gerekli
        const pet = getLastActivePet();
        if (!pet) {
            Alert.alert(
                'Pet Seçimi Gerekli',
                'Kayıt eklemek için önce bir peti açın.',
                [{ text: 'Tamam' }]
            );
            return;
        }

        const screenMap = {
            addNutrition: 'Nutrition',
            addWeight: 'Weight',
            addHealth: 'HealthRecords',
            addVaccination: 'Vaccinations',
        };

        const screenName = screenMap[key];
        if (screenName) {
            homeNav.navigate('HomeTab', {
                screen: screenName,
                params: {
                    petId: pet.petId,
                    petName: pet.petName,
                    openModal: true,
                },
            });
        }
    };

    return (
        <>
            <ActionMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onAction={handleMenuAction}
            />
            <View style={tabStyles.outerContainer}>
                <View style={tabStyles.floatingBar}>
                    {/* Cam arka plan */}
                    {Platform.OS === 'web' ? (
                        <View style={[StyleSheet.absoluteFill, tabStyles.glassBackgroundWeb]} />
                    ) : (
                        <BlurView
                            intensity={60}
                            tint="dark"
                            style={[StyleSheet.absoluteFill, { borderRadius: 32 }]}
                        >
                            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 20, 45, 0.55)', borderRadius: 32 }]} />
                        </BlurView>
                    )}

                    {/* Specular highlight */}
                    {Platform.OS === 'web' && (
                        <View style={[StyleSheet.absoluteFill, {
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%)',
                            borderRadius: 32,
                            pointerEvents: 'none',
                        }]} />
                    )}

                    {/* Tab butonları */}
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        // Ortadaki "+" butonu
                        if (route.name === 'AddAction') {
                            return (
                                <TouchableOpacity
                                    key={route.key}
                                    style={tabStyles.plusButtonContainer}
                                    onPress={handlePlusPress}
                                    activeOpacity={0.8}
                                >
                                    <View style={tabStyles.plusButton}>
                                        <MaterialCommunityIcons name="plus" size={30} color="#FFF" />
                                    </View>
                                </TouchableOpacity>
                            );
                        }

                        const iconName = route.name === 'HomeTab' ? 'paw' : 'cog';
                        const label = route.name === 'HomeTab' ? 'Petlerim' : 'Ayarlar';

                        return (
                            <TouchableOpacity
                                key={route.key}
                                style={tabStyles.tabButton}
                                onPress={() => {
                                    const event = navigation.emit({
                                        type: 'tabPress',
                                        target: route.key,
                                        canPreventDefault: true,
                                    });
                                    if (!isFocused && !event.defaultPrevented) {
                                        navigation.navigate(route.name);
                                    }
                                }}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name={iconName}
                                    size={24}
                                    color={isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
                                />
                                <Text style={[
                                    tabStyles.tabLabel,
                                    { color: isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.45)' }
                                ]}>
                                    {label}
                                </Text>
                                {isFocused && <View style={tabStyles.activeIndicator} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </>
    );
}

const tabStyles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    floatingBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: 68,
        borderRadius: 32,
        overflow: 'hidden',
        ...(Platform.OS === 'web' ? {} : {
            shadowColor: 'rgba(80, 100, 200, 0.4)',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 25,
            elevation: 12,
        }),
    },
    glassBackgroundWeb: {
        borderRadius: 32,
        backgroundColor: 'rgba(15, 20, 45, 0.55)',
        backdropFilter: 'blur(30px) saturate(160%)',
        WebkitBackdropFilter: 'blur(30px) saturate(160%)',
        boxShadow: 'inset 0 0 30px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.15), 0 10px 40px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        position: 'relative',
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 3,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 4,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
    },
    plusButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -12,
    },
    plusButton: {
        width: 58,
        height: 58,
        borderRadius: 29,
        justifyContent: 'center',
        alignItems: 'center',
        ...(Platform.OS === 'web' ? {
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5), 0 0 0 3px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255,255,255,0.25)',
        } : {
            backgroundColor: '#6366F1',
            shadowColor: '#6366F1',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
            elevation: 10,
        }),
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.15)',
    },
});

// ─────────────── Main Tabs ───────────────
function MainTabs() {
    const { colors, isDark } = useTheme();
    return (
        <Tab.Navigator
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="HomeTab" component={HomeTab}
                options={{ tabBarLabel: 'Petlerim' }} />
            <Tab.Screen name="AddAction" component={DummyScreen}
                options={{
                    tabBarLabel: '',
                }} />
            <Tab.Screen name="SettingsTab" component={SettingsScreen}
                options={{ tabBarLabel: 'Ayarlar', headerShown: false }} />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

function AppContent() {
    const { isDark, colors } = useTheme();
    const [user, setUser] = useState(undefined); // undefined = yükleniyor

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // storage.js'deki cached userId'yi güncelle
                _resetUserId(firebaseUser.uid);
            } else {
                _resetUserId(null);
            }
            setUser(firebaseUser ?? null);
        });
        return unsub;
    }, []);

    // Yükleniyor (auth durumu henüz bilinmiyor)
    if (user === undefined) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <MaterialCommunityIcons name="paw" size={48} color="#FFF" />
                <ActivityIndicator color="#FFF" style={{ marginTop: 16 }} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar style="light" />
            {user ? <MainTabs /> : <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="Auth" component={AuthScreen} /></Stack.Navigator>}
        </NavigationContainer>
    );
}