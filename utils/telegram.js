// telegram.js — Telegram Bot API üzerinden fotoğraf yükleme ve URL çözümleme
import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

// Netlify sunucusu (API endpoint'leri burada)
const getBaseUrl = () => {
    // Hem web'de (ister localhost, ister telefondan, ister Netlify host'unda olsun) 
    // hem de mobil uygulamada güvenilir bir şekilde doğru URL'ye istek atabilmek için 
    // her zaman tam Netlify URL'sini (Absolute URL) dönüyoruz.
    return 'https://epati-3pati6-srv.netlify.app';
};

// Bellekte URL cache — aynı file_id için tekrar istek atmayı önler
const urlCache = new Map();
const CACHE_TTL = 55 * 60 * 1000; // 55 dakika (Telegram URL'leri ~1 saat geçerli)

// Geliştirici ortamını tespit et (LogBox'u kirletmemek için)
const IS_DEV = typeof __DEV__ !== 'undefined' && __DEV__;

/**
 * Fotoğrafı Netlify proxy üzerinden Telegram'a yükler
 * @param {string} localUri - Yerel dosya URI'ı
 * @returns {Promise<{file_id: string, file_name: string}>}
 */
export const uploadToTelegram = async (localUri) => {
    const baseUrl = getBaseUrl();
    const fileName = `photo_${Date.now()}.jpg`;
    const formData = new FormData();

    try {
        let finalUri = localUri;

        // Mobil cihazlarda boyutu/çözünürlüğü küçültmek ağ TLS/Header hatalarını engeller
        if (Platform.OS !== 'web') {
            const manipResult = await ImageManipulator.manipulateAsync(
                localUri,
                [{ resize: { width: 1080 } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );
            finalUri = manipResult.uri;
        }

        if (Platform.OS === 'web') {
            const response = await fetch(finalUri);
            const blob = await response.blob();
            formData.append('file', blob, fileName);
        } else {
            // React Native'de FormData dosya gönderimi için özel obje yapısı gerekir
            formData.append('file', {
                uri: finalUri,
                type: 'image/jpeg',
                name: fileName,
            });
        }

        const res = await fetch(`${baseUrl}/api/telegram-upload`, {
            method: 'POST',
            body: formData,
            // Header kısmına manuel 'Content-Type': 'multipart/form-data' EKLEMİYORUZ,
            headers: {
                Accept: 'application/json',
            }
        });

        if (!res.ok) {
            let errorMsg = `HTTP Error ${res.status}`;
            try {
                const errorData = await res.json();
                if (errorData.error) errorMsg += ` - ${errorData.error}`;
                if (errorData.details) errorMsg += ` (${errorData.details})`;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        return await res.json(); // { file_id, file_name }
    } catch (error) {
        const message = error?.message || String(error);
        if (IS_DEV) {
            console.warn('Upload Error:', message);
        }
        throw new Error(`Upload failed: ${message}`);
    }
};

/**
 * Telegram file_id'yi indirilebilir URL'ye çevirir (cache'li)
 * @param {string} fileId - Telegram file_id
 * @returns {Promise<string>} - İndirilebilir URL
 */
export const getTelegramFileUrl = async (fileId) => {
    if (!fileId) return null;

    // Eğer zaten bir HTTP URL ise (eski Firebase URL), direkt dön
    if (fileId.startsWith('http')) return fileId;

    // Cache kontrol
    const cached = urlCache.get(fileId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.url;
    }

    const baseUrl = getBaseUrl();
    try {
        let res;
        try {
            res = await fetch(`${baseUrl}/api/telegram-file?file_id=${encodeURIComponent(fileId)}`);
        } catch (networkError) {
            // Ağ hatalarında tek seferlik küçük bir tekrar denemesi
            if (IS_DEV) {
                console.log('[Telegram] İlk istek başarısız, tekrar deneniyor…', networkError?.message || networkError);
            }
            res = await fetch(`${baseUrl}/api/telegram-file?file_id=${encodeURIComponent(fileId)}`);
        }

        if (!res.ok) {
            let errorMsg = `HTTP Error ${res.status}`;
            try {
                const errData = await res.json();
                errorMsg = errData.error || errorMsg;
                if (errData.details) errorMsg += ` - ${errData.details}`;
            } catch (e) {}
            if (IS_DEV) {
                console.warn(`Telegram file URL alınamadı (${fileId}): ${errorMsg}`);
            }
            return null;
        }

        const data = await res.json();
        if (!data.url) {
            if (IS_DEV) {
                console.warn('Telegram file URL response missing url field:', data);
            }
            return null;
        }
        
        const url = data.url;

        // Cache'e kaydet
        urlCache.set(fileId, { url, timestamp: Date.now() });

        return url;
    } catch (error) {
        const message = error?.message || String(error);
        // Burada console.error yerine sessizce fallback yapıyoruz ki LogBox kırmızıya dönmesin
        if (IS_DEV) {
            console.log('Telegram URL çözümlerken ağ hatası, null döndürüldü:', message);
        }
        return null;
    }
};

/**
 * Birden fazla file_id'yi paralel çözümler
 * @param {string[]} fileIds - Telegram file_id listesi
 * @returns {Promise<Map<string, string>>} - file_id → URL haritası
 */
export const batchResolveTelegramUrls = async (fileIds) => {
    const results = new Map();
    const uniqueIds = [...new Set(fileIds.filter(Boolean))];

    const promises = uniqueIds.map(async (fileId) => {
        const url = await getTelegramFileUrl(fileId);
        if (url) results.set(fileId, url);
    });

    await Promise.all(promises);
    return results;
};
