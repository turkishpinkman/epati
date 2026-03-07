// e-pati AsyncStorage Veri Yönetimi
import AsyncStorage from '@react-native-async-storage/async-storage';

const PETS_KEY = '@epati_pets';

// Tüm petleri yükle
export const loadPets = async () => {
    try {
        const data = await AsyncStorage.getItem(PETS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Petler yüklenirken hata:', error);
        // CursorWindow hatası gibi durumlarda veriyi temizle
        try {
            await AsyncStorage.removeItem(PETS_KEY);
            console.log('Bozuk veri temizlendi.');
        } catch (e) { }
        return [];
    }
};

// Tüm petleri kaydet
export const savePets = async (pets) => {
    try {
        await AsyncStorage.setItem(PETS_KEY, JSON.stringify(pets));
        return true;
    } catch (error) {
        console.error('Petler kaydedilirken hata:', error);
        return false;
    }
};

// Yeni pet ekle
export const addPet = async (pet) => {
    const pets = await loadPets();
    const newPet = {
        ...pet,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        vaccinations: [],
        healthRecords: [],
    };
    pets.push(newPet);
    await savePets(pets);
    return newPet;
};

// Pet güncelle
export const updatePet = async (updatedPet) => {
    const pets = await loadPets();
    const index = pets.findIndex(p => p.id === updatedPet.id);
    if (index !== -1) {
        pets[index] = { ...pets[index], ...updatedPet };
        await savePets(pets);
        return pets[index];
    }
    return null;
};

// Pet sil
export const deletePet = async (petId) => {
    const pets = await loadPets();
    const filtered = pets.filter(p => p.id !== petId);
    await savePets(filtered);
    return true;
};

// Aşı ekle
export const addVaccination = async (petId, vaccination) => {
    const pets = await loadPets();
    const index = pets.findIndex(p => p.id === petId);
    if (index !== -1) {
        const newVacc = {
            ...vaccination,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
        };
        if (!pets[index].vaccinations) pets[index].vaccinations = [];
        pets[index].vaccinations.push(newVacc);
        await savePets(pets);
        return newVacc;
    }
    return null;
};

// Aşı sil
export const deleteVaccination = async (petId, vaccId) => {
    const pets = await loadPets();
    const index = pets.findIndex(p => p.id === petId);
    if (index !== -1) {
        pets[index].vaccinations = pets[index].vaccinations.filter(v => v.id !== vaccId);
        await savePets(pets);
        return true;
    }
    return false;
};

// Sağlık kaydı ekle
export const addHealthRecord = async (petId, record) => {
    const pets = await loadPets();
    const index = pets.findIndex(p => p.id === petId);
    if (index !== -1) {
        const newRecord = {
            ...record,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
        };
        if (!pets[index].healthRecords) pets[index].healthRecords = [];
        pets[index].healthRecords.push(newRecord);
        await savePets(pets);
        return newRecord;
    }
    return null;
};

// Sağlık kaydı sil
export const deleteHealthRecord = async (petId, recordId) => {
    const pets = await loadPets();
    const index = pets.findIndex(p => p.id === petId);
    if (index !== -1) {
        pets[index].healthRecords = pets[index].healthRecords.filter(r => r.id !== recordId);
        await savePets(pets);
        return true;
    }
    return false;
};

// Kilo kaydı ekle
export const addWeightEntry = async (petId, entry) => {
    const pets = await loadPets();
    const index = pets.findIndex(p => p.id === petId);
    if (index !== -1) {
        const newEntry = {
            ...entry,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
        };
        if (!pets[index].weightHistory) pets[index].weightHistory = [];
        pets[index].weightHistory.push(newEntry);
        // Ana kiloyu da güncelle
        pets[index].weight = entry.weight;
        await savePets(pets);
        return newEntry;
    }
    return null;
};

// Kilo kaydı sil
export const deleteWeightEntry = async (petId, entryId) => {
    const pets = await loadPets();
    const index = pets.findIndex(p => p.id === petId);
    if (index !== -1) {
        pets[index].weightHistory = (pets[index].weightHistory || []).filter(w => w.id !== entryId);
        await savePets(pets);
        return true;
    }
    return false;
};

// Beslenme kaydı ekle
export const addNutritionEntry = async (petId, entry) => {
    const pets = await loadPets();
    const index = pets.findIndex(p => p.id === petId);
    if (index !== -1) {
        const newEntry = {
            ...entry,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
        };
        if (!pets[index].nutritionLog) pets[index].nutritionLog = [];
        pets[index].nutritionLog.push(newEntry);
        await savePets(pets);
        return newEntry;
    }
    return null;
};

// Beslenme kaydı sil
export const deleteNutritionEntry = async (petId, entryId) => {
    const pets = await loadPets();
    const index = pets.findIndex(p => p.id === petId);
    if (index !== -1) {
        pets[index].nutritionLog = (pets[index].nutritionLog || []).filter(n => n.id !== entryId);
        await savePets(pets);
        return true;
    }
    return false;
};

// Galeri fotoğrafı ekle
export const addGalleryPhoto = async (petId, uri) => {
    const pets = await loadPets();
    const index = pets.findIndex(p => p.id === petId);
    if (index !== -1) {
        const newPhoto = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            uri,
            createdAt: new Date().toISOString(),
        };
        if (!pets[index].gallery) pets[index].gallery = [];
        pets[index].gallery.push(newPhoto);
        await savePets(pets);
        return newPhoto;
    }
    return null;
};

// Galeri fotoğrafı sil
export const deleteGalleryPhoto = async (petId, photoId) => {
    const pets = await loadPets();
    const index = pets.findIndex(p => p.id === petId);
    if (index !== -1) {
        pets[index].gallery = (pets[index].gallery || []).filter(p => p.id !== photoId);
        await savePets(pets);
        return true;
    }
    return false;
};

