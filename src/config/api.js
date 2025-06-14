// Konfigurasi API untuk SmartSaku
const API_BASE_URL = 'https://smartsaku.ddns.net/api';
const CHAT_API_URL = 'https://smartsaku.ddns.net';

// Endpoint API
const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE_URL}/user/login`,
    REGISTER: `${API_BASE_URL}/user/register`,
    PROFILE: `${API_BASE_URL}/user/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/user/change-password`,

    // Transaction endpoints - Updated format
    PEMASUKAN: (userId) => `${API_BASE_URL}/users/${userId}/incomes`,
    PENGELUARAN: (userId) => `${API_BASE_URL}/users/${userId}/expenses`,
    PEMASUKAN_BY_ID: (userId, transaksiId) => `${API_BASE_URL}/users/${userId}/incomes/${transaksiId}`,
    PENGELUARAN_BY_ID: (userId, transaksiId) => `${API_BASE_URL}/users/${userId}/expenses/${transaksiId}`,

    // AI features
    RECOMMENDATION: `${API_BASE_URL}/recommendation`,
    PREDICTION: `${API_BASE_URL}/prediction`,

    // Chat
    CHAT: `${CHAT_API_URL}/chat` // Menggunakan endpoint chat produksi
};

export { API_BASE_URL, CHAT_API_URL, API_ENDPOINTS };