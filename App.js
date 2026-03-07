// e-pati — Evcil Hayvan Kimlik & Profil Uygulaması
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './utils/theme';

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
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background },
      animation: 'slide_from_right',
    }}>
      <Stack.Screen name="HomeList" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PetDetail" component={PetDetailScreen} options={{ title: 'Profil' }} />
      <Stack.Screen name="AddEditPet" component={AddEditPetScreen}
        options={({ route }) => ({ title: route.params?.petId ? 'Düzenle' : 'Yeni Pet Ekle', presentation: 'modal' })} />
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

function MainTabs() {
  const { colors, isDark } = useTheme();
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.divider,
        borderTopWidth: 0.5,
        height: 60,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textLight,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tab.Screen name="HomeTab" component={HomeTab}
        options={{
          tabBarLabel: 'Petlerim',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="paw" size={size} color={color} />,
        }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen}
        options={{
          tabBarLabel: 'Ayarlar',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cog" size={size} color={color} />,
          headerShown: true,
          headerTitle: 'Ayarlar',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
        }} />
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
  const { isDark } = useTheme();
  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <MainTabs />
    </NavigationContainer>
  );
}