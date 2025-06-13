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
            // Try HTTPS first
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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

            // Fallback to demo mode if in production environment
            if (window.location.hostname.includes('github.io')) {
                // We're on GitHub Pages, use demo mode
                console.log('Running in GitHub Pages environment, using demo mode');
                return this.loginDemo(kredensial);
            }

            // Try fallback for local development
            try {
                return await this.loginFallback(kredensial);
            } catch (fallbackError) {
                console.error('Fallback login failed:', fallbackError);
                return { 
                    berhasil: false, 
                    pesan: 'Server tidak dapat diakses. Coba lagi nanti atau gunakan demo mode.' 
                };
            }
        }
    }

    /**
     * Demo login for GitHub Pages deployment
     * @param {Object} kredensial - Email and password
     * @returns {Object} Simulated successful response
     */
    static loginDemo(kredensial) {
        // Create mock user data for demo purposes
        const mockUser = {
            id: 'demo-user-123',
            name: kredensial.email.split('@')[0] || 'Demo User',
            email: kredensial.email,
            role: 'user',
            created_at: new Date().toISOString()
        };
        
        const mockToken = 'demo-token-' + Math.random().toString(36).substring(2);
        
        // Save the mock data
        this.simpanDataUser(mockToken, mockUser);
        
        return { 
            berhasil: true, 
            data: { 
                token: mockToken, 
                user: mockUser,
                message: 'Demo login berhasil'
            },
            isDemoMode: true
        };
    }

    /**
     * Fallback login jika proxy tidak bekerja
     * @param {Object} kredensial - Email dan password user
     * @returns {Promise<Object>} Response dari API
     */    static async loginFallback(kredensial) {
        try {
            const response = await fetch('http://202.10.35.227/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                mode: 'cors',
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
            return { berhasil: false, pesan: 'Backend API tidak dapat diakses. Pastikan server berjalan di localhost:3000' };
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
                body: JSON.stringify(dataUser)
            });

            const data = await response.json();

            if (response.ok) {
                return { berhasil: true, data };
            } else {
                return { berhasil: false, pesan: data.message || 'Registrasi gagal' };
            }
        } catch (error) {
            console.error('Error saat register:', error);
            
            // Fallback to demo mode if in production environment
            if (window.location.hostname.includes('github.io')) {
                // We're on GitHub Pages, use demo mode
                console.log('Running in GitHub Pages environment, using demo mode for registration');
                return this.registerDemo(dataUser);
            }
            
            return { berhasil: false, pesan: 'Terjadi kesalahan koneksi' };
        }
    }
    
    /**
     * Demo register for GitHub Pages deployment
     * @param {Object} dataUser - User data
     * @returns {Object} Simulated successful response
     */
    static registerDemo(dataUser) {
        // Create simulated response
        return { 
            berhasil: true, 
            data: {
                message: 'Pendaftaran berhasil dalam mode demo. Silakan login dengan akun yang baru saja didaftarkan.'
            },
            isDemoMode: true
        };
    }

    /**
     * Logout user dari sistem
     */
    static logout() {        localStorage.removeItem('smartsaku_token');
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