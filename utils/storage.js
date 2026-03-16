import {
    collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
    getDocs, getDoc, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { uploadToTelegram } from './telegram';
import { onAuthStateChanged } from 'firebase/auth';

// Kullanıcı ID cache — App.js tarafından güncellenir
let _userId = null;

// App.js bu fonksiyonu auth state değiştiğinde çağırır
export const _resetUserId = (uid) => {
    _userId = uid;
};

// Auth'u bekle — user zaten giriş yapmış olmalı (AuthScreen sağlar)
const waitForUser = () => {
    return new Promise((resolve, reject) => {
        if (_userId) { resolve(_userId); return; }
        const unsub = onAuthStateChanged(auth, (user) => {
            unsub();
            if (user) {
                _userId = user.uid;
                resolve(_userId);
            } else {
                reject(new Error('Kullanıcı giriş yapmamış'));
            }
        });
    });
};

const petsCollection = async () => {
    const uid = await waitForUser();
    return collection(db, 'users', uid, 'pets');
};

// Görseli Telegram'a yükle ve file_id'yi dön
const uploadImage = async (uri) => {
    if (!uri) return uri;
    // Zaten bir Telegram file_id veya HTTP URL ise tekrar yükleme
    if (!uri.startsWith('file') && !uri.startsWith('content') && !uri.startsWith('data') && !uri.startsWith('/') && !uri.startsWith('blob')) {
        return uri;
    }
    try {
        const result = await uploadToTelegram(uri);
        return result.file_id;
    } catch (error) {
        console.error('Görsel yükleme hatası:', error);
        return null; // Fotoğraf yüklenemezse null dön, pet kaydı yine de yapılsın
    }
};

// Tüm petleri yükle
export const loadPets = async () => {
    try {
        const col = await petsCollection();
        const q = query(col, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Petler yüklenirken hata:', error);
        return [];
    }
};

// Pet detayını yükle (alt koleksiyonlarla birlikte)
export const loadPet = async (petId) => {
    try {
        const uid = await waitForUser();
        const petRef = doc(db, 'users', uid, 'pets', petId);
        const petSnap = await getDoc(petRef);
        if (!petSnap.exists()) return null;

        const petData = { id: petSnap.id, ...petSnap.data() };

        // Alt koleksiyonları paralel yükle
        const [vaccs, health, weight, nutrition, gallery] = await Promise.all([
            getDocs(collection(db, 'users', uid, 'pets', petId, 'vaccinations')),
            getDocs(collection(db, 'users', uid, 'pets', petId, 'healthRecords')),
            getDocs(collection(db, 'users', uid, 'pets', petId, 'weightHistory')),
            getDocs(collection(db, 'users', uid, 'pets', petId, 'nutritionLog')),
            getDocs(collection(db, 'users', uid, 'pets', petId, 'gallery')),
        ]);

        petData.vaccinations = vaccs.docs.map(d => ({ id: d.id, ...d.data() }));
        petData.healthRecords = health.docs.map(d => ({ id: d.id, ...d.data() }));
        petData.weightHistory = weight.docs.map(d => ({ id: d.id, ...d.data() }));
        petData.nutritionLog = nutrition.docs.map(d => ({ id: d.id, ...d.data() }));
        petData.gallery = gallery.docs.map(d => ({ id: d.id, ...d.data() }));

        return petData;
    } catch (error) {
        console.error('Pet yüklenirken hata:', error);
        return null;
    }
};

// Yeni pet ekle
export const addPet = async (pet) => {
    try {
        const uid = await waitForUser();
        let photoUrl = null;
        if (pet.photo) {
            photoUrl = await uploadImage(pet.photo);
        }

        const col = collection(db, 'users', uid, 'pets');
        const docRef = await addDoc(col, {
            ...pet,
            photo: photoUrl || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return { id: docRef.id, ...pet, photo: photoUrl };
    } catch (error) {
        console.error('Pet eklenirken hata:', error);
        throw error;
    }
};

// Pet güncelle
export const updatePet = async (updatedPet) => {
    try {
        const uid = await waitForUser();
        const { id, vaccinations, healthRecords, weightHistory, nutritionLog, gallery, ...data } = updatedPet;

        if (data.photo) {
            data.photo = await uploadImage(data.photo);
        }

        const petRef = doc(db, 'users', uid, 'pets', id);
        await updateDoc(petRef, { ...data, updatedAt: serverTimestamp() });
        return { ...updatedPet, photo: data.photo };
    } catch (error) {
        console.error('Pet güncellenirken hata:', error);
        throw error;
    }
};

// Pet sil (alt koleksiyonlarla birlikte)
export const deletePet = async (petId) => {
    try {
        const uid = await waitForUser();
        const petRef = doc(db, 'users', uid, 'pets', petId);
        const subCols = ['vaccinations', 'healthRecords', 'weightHistory', 'nutritionLog', 'gallery'];
        for (const sub of subCols) {
            const subSnap = await getDocs(collection(db, 'users', uid, 'pets', petId, sub));
            for (const d of subSnap.docs) await deleteDoc(d.ref);
        }
        await deleteDoc(petRef);
        return true;
    } catch (error) {
        console.error('Pet silinirken hata:', error);
        return false;
    }
};

// Generic alt koleksiyon yükleyici
const loadSubCollection = async (petId, subName) => {
    try {
        const uid = await waitForUser();
        const col = collection(db, 'users', uid, 'pets', petId, subName);
        const snapshot = await getDocs(col);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error(`${subName} yüklenirken hata:`, e);
        return [];
    }
};

// Generic alt koleksiyon ekleme
const addToSubCollection = async (petId, subName, data) => {
    try {
        const uid = await waitForUser();
        const col = collection(db, 'users', uid, 'pets', petId, subName);
        const docRef = await addDoc(col, { ...data, createdAt: serverTimestamp() });
        return { id: docRef.id, ...data };
    } catch (e) {
        console.error(`${subName} eklenirken hata:`, e);
        throw e;
    }
};

// Generic alt koleksiyon silme
const deleteFromSubCollection = async (petId, subName, itemId) => {
    try {
        const uid = await waitForUser();
        const ref = doc(db, 'users', uid, 'pets', petId, subName, itemId);
        await deleteDoc(ref);
        return true;
    } catch (e) {
        console.error(`${subName} silinirken hata:`, e);
        return false;
    }
};

// Aşılar
export const loadVaccinations = (petId) => loadSubCollection(petId, 'vaccinations');
export const addVaccination = (petId, data) => addToSubCollection(petId, 'vaccinations', data);
export const deleteVaccination = (petId, id) => deleteFromSubCollection(petId, 'vaccinations', id);

// Sağlık kayıtları
export const loadHealthRecords = (petId) => loadSubCollection(petId, 'healthRecords');
export const addHealthRecord = (petId, data) => addToSubCollection(petId, 'healthRecords', data);
export const deleteHealthRecord = (petId, id) => deleteFromSubCollection(petId, 'healthRecords', id);

// Kilo geçmişi
export const loadWeightHistory = (petId) => loadSubCollection(petId, 'weightHistory');
export const addWeightEntry = async (petId, entry) => {
    const result = await addToSubCollection(petId, 'weightHistory', entry);
    if (result) {
        try { await updatePet({ id: petId, weight: entry.weight }); } catch { }
    }
    return result;
};
export const deleteWeightEntry = (petId, id) => deleteFromSubCollection(petId, 'weightHistory', id);

// Beslenme kayıtları
export const loadNutritionLog = (petId) => loadSubCollection(petId, 'nutritionLog');
export const addNutritionEntry = (petId, data) => addToSubCollection(petId, 'nutritionLog', data);
export const deleteNutritionEntry = (petId, id) => deleteFromSubCollection(petId, 'nutritionLog', id);

// Galeri
export const loadGallery = (petId) => loadSubCollection(petId, 'gallery');
export const addGalleryPhoto = async (petId, uri) => {
    const fileId = await uploadImage(uri);
    return addToSubCollection(petId, 'gallery', { telegramFileId: fileId, name: `photo_${Date.now()}.jpg`, uploadedAt: new Date().toISOString() });
};
export const deleteGalleryPhoto = (petId, id) => deleteFromSubCollection(petId, 'gallery', id);
