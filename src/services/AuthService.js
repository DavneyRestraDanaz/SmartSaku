// Service untuk mengelola autentikasi user
import { API_ENDPOINTS } from '../config/api.js';

class AuthService {
    /**
     * Login user ke sistem
     * @param {Object} kredensial - Email dan password user
     * @returns {Promise<Object>} Response dari API
     */
    static async login(kredensial) {
        try {
            // Add cache and cors mode to help prevent network issues
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-cache',
                mode: 'cors',
                body: JSON.stringify(kredensial)
            });

            const data = await response.json();

            if (response.ok) {
                // Simpan token dan data user di localStorage
                this.simpanDataUser(data.token, data.user);
                return { berhasil: true, data };
            } else {
                return { berhasil: false, pesan: data.message || 'Login gagal' };
            }
        } catch (error) {
            console.error('Error saat login:', error);

            // Jika error CORS atau network, coba dengan direct URL
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                return await this.loginFallback(kredensial);
            }

            return { berhasil: false, pesan: 'Terjadi kesalahan koneksi' };
        }
    }    /**
     * Fallback login jika proxy tidak bekerja
     * @param {Object} kredensial - Email dan password user
     * @returns {Promise<Object>} Response dari API
     */
    static async loginFallback(kredensial) {
        try {
            // Use HTTPS instead of HTTP and try with different settings
            const response = await fetch('https://202.10.35.227/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'omit',
                body: JSON.stringify(kredensial)
            });

            const data = await response.json();

            if (response.ok) {
                this.simpanDataUser(data.token, data.user);
                return { berhasil: true, data };
            } else {
                return { berhasil: false, pesan: data.message || 'Login gagal' };
            }
        } catch (error) {
            console.error('Fallback login error:', error);
            
            // Try one more approach with a CORS proxy
            try {
                return await this.loginWithProxy(kredensial);
            } catch (proxyError) {
                console.error('Proxy login error:', proxyError);
                return { berhasil: false, pesan: 'Server tidak dapat diakses. Periksa koneksi internet Anda.' };
            }
        }
    }    
    /**
     * Attempt login using a CORS proxy
     * @param {Object} kredensial - User credentials
     * @returns {Promise<Object>} API response
     */
    static async loginWithProxy(kredensial) {
        try {
            // Try using a CORS proxy
            const corsProxy = 'https://corsproxy.io/?';
            const apiUrl = encodeURIComponent('http://202.10.35.227/api/user/login');
            
            const response = await fetch(corsProxy + apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(kredensial)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.simpanDataUser(data.token, data.user);
                return { berhasil: true, data };
            } else {
                return { berhasil: false, pesan: data.message || 'Login gagal' };
            }
        } catch (error) {
            console.error('Proxy login error:', error);
            return { berhasil: false, pesan: 'Server tidak dapat diakses melalui proxy.' };
        }
    }

    /**
     * Register user baru
     * @param {Object} dataUser - Data user baru (name, email, password)
     * @returns {Promise<Object>} Response dari API
     */
    static async register(dataUser) {
        try {
            const response = await fetch(API_ENDPOINTS.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-cache',
                mode: 'cors',
                body: JSON.stringify(dataUser)
            });

            const data = await response.json();

            if (response.ok) {
                return { berhasil: true, data };
            } else {
                return { berhasil: false, pesan: data.message || 'Registrasi gagal' };
            }
        } catch (error) {
            console.error('Error saat registrasi:', error);

            // Try register fallback if there's a network issue
            try {
                return await this.registerWithProxy(dataUser);
            } catch (proxyError) {
                console.error('Proxy registration error:', proxyError);
                return { berhasil: false, pesan: 'Server tidak dapat diakses. Periksa koneksi internet Anda.' };
            }
        }
    }
    
    /**
     * Register using a CORS proxy
     * @param {Object} dataUser - User data
     * @returns {Promise<Object>} API response
     */
    static async registerWithProxy(dataUser) {
        try {
            // Try using a CORS proxy
            const corsProxy = 'https://corsproxy.io/?';
            const apiUrl = encodeURIComponent('http://202.10.35.227/api/user/register');
            
            const response = await fetch(corsProxy + apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataUser)
            });

            const data = await response.json();

            if (response.ok) {
                return { berhasil: true, data };
            } else {
                return { berhasil: false, pesan: data.message || 'Registrasi gagal' };
            }
        } catch (error) {
            console.error('Proxy registration error:', error);
            return { berhasil: false, pesan: 'Server tidak dapat diakses melalui proxy.' };
        }
    }

    /**
     * Logout user dari sistem
     */
    static logout() {
        localStorage.removeItem('smartsaku_token');
        localStorage.removeItem('smartsaku_user');
        window.location.href = '/SmartSaku/';
    }

    /**
     * Simpan data user ke localStorage
     * @param {string} token - JWT token
     * @param {Object} user - Data user
     */
    static simpanDataUser(token, user) {
        localStorage.setItem('smartsaku_token', token);
        localStorage.setItem('smartsaku_user', JSON.stringify(user));
    }

    /**
     * Ambil token dari localStorage
     * @returns {string|null} JWT token
     */
    static getToken() {
        return localStorage.getItem('smartsaku_token');
    }

    /**
     * Ambil data user dari localStorage
     * @returns {Object|null} Data user
     */
    static getUser() {
        const userData = localStorage.getItem('smartsaku_user');
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Cek apakah user sudah login
     * @returns {boolean} Status login
     */
    static sudahLogin() {
        return this.getToken() !== null;
    }
}

export default AuthService;