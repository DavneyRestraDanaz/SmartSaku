// Service untuk mengelola autentikasi user
import { API_ENDPOINTS } from '../config/api.js';

class AuthService {
    /**
     * Login user ke sistem
     * @param {Object} kredensial - Email dan password user
     * @returns {Promise<Object>} Response dari API
     */    static async login(kredensial) {
        try {
            // Try the direct API endpoint first
            console.log('Attempting direct API login');
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

            // If direct connection fails, try the backend directly with no-cors mode
            try {
                return await this.tryAlternativeLogin(kredensial);
            } catch (altError) {
                console.error('Alternative login failed:', altError);
                return { berhasil: false, pesan: 'Server tidak dapat diakses. Pastikan Anda memiliki koneksi internet.' };
            }
        }
    }    /**
     * Alternative login approach for CORS issues
     * @param {Object} kredensial - Email and password
     * @returns {Promise<Object>} Authentication result
     */
    static async tryAlternativeLogin(kredensial) {
        // First attempt - direct HTTPS connection
        try {
            console.log('Attempting direct HTTPS connection');
            const directResponse = await fetch('https://202.10.35.227/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(kredensial)
            });

            const directData = await directResponse.json();
            
            if (directResponse.ok) {
                this.simpanDataUser(directData.token, directData.user);
                return { berhasil: true, data: directData };
            }
        } catch (error) {
            console.log('Direct HTTPS connection failed:', error);
        }

        // Second attempt - use fetch with no-cors mode
        try {
            console.log('Attempting no-cors mode');
            const noCorsResponse = await fetch('http://202.10.35.227/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'no-cors',
                body: JSON.stringify(kredensial)
            });
            
            // no-cors doesn't allow reading the response body
            // Instead, we'll try a separate GET request to check login status
            if (noCorsResponse.type === 'opaque') {
                // If we got this far, try a status check
                try {
                    const statusCheck = await fetch('http://202.10.35.227/api/user/me', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    
                    if (statusCheck.ok) {
                        const userData = await statusCheck.json();
                        const fakeToken = 'token-' + Math.random().toString(36).substring(2);
                        this.simpanDataUser(fakeToken, userData);
                        return { berhasil: true, data: { token: fakeToken, user: userData } };
                    }
                } catch (statusError) {
                    console.log('Status check failed:', statusError);
                }
            }
        } catch (error) {
            console.log('No-cors mode failed:', error);
        }

        // Third attempt - use XMLHttpRequest instead of fetch
        return new Promise((resolve, reject) => {
            console.log('Attempting XMLHttpRequest');
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://202.10.35.227/api/user/login', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.withCredentials = true;
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        AuthService.simpanDataUser(data.token, data.user);
                        resolve({ berhasil: true, data });
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        resolve({ berhasil: false, pesan: errorData.message || 'Login gagal' });
                    } catch (e) {
                        resolve({ berhasil: false, pesan: 'Login gagal dengan status ' + xhr.status });
                    }
                }
            };
            
            xhr.onerror = function() {
                resolve({ berhasil: false, pesan: 'Tidak dapat terhubung ke server' });
            };
            
            xhr.send(JSON.stringify(kredensial));        });
    }

    /**
     * Register user baru
     * @param {Object} dataUser - Data user baru (name, email, password)
     * @returns {Promise<Object>} Response dari API
     */
    static async register(dataUser) {
        try {
            // Try direct registration first
            console.log('Attempting direct API registration');
            const response = await fetch(API_ENDPOINTS.REGISTER, {                method: 'POST',
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
            console.error('Error saat registrasi:', error);
            
            // Try alternative registration approach
            try {
                return await this.tryAlternativeRegister(dataUser);
            } catch (altError) {
                console.error('Alternative registration failed:', altError);
                return { berhasil: false, pesan: 'Server tidak dapat diakses. Pastikan Anda memiliki koneksi internet.' };
            }
        }
    }
    
    /**
     * Alternative register approach for CORS issues
     * @param {Object} dataUser - User data
     * @returns {Promise<Object>} Registration result
     */
    static async tryAlternativeRegister(dataUser) {
        // First attempt - direct HTTPS connection
        try {
            console.log('Attempting direct HTTPS registration');
            const directResponse = await fetch('https://202.10.35.227/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataUser)
            });

            const directData = await directResponse.json();
            
            if (directResponse.ok) {
                return { berhasil: true, data: directData };
            }        } catch (error) {
            console.log('Direct HTTPS registration failed:', error);
        }

        // Third attempt - use XMLHttpRequest instead of fetch
        return new Promise((resolve, reject) => {
            console.log('Attempting XMLHttpRequest for registration');
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://202.10.35.227/api/user/register', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.withCredentials = true;
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve({ berhasil: true, data });
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        resolve({ berhasil: false, pesan: errorData.message || 'Registrasi gagal' });
                    } catch (e) {
                        resolve({ berhasil: false, pesan: 'Registrasi gagal dengan status ' + xhr.status });
                    }
                }
            };
            
            xhr.onerror = function() {
                resolve({ berhasil: false, pesan: 'Tidak dapat terhubung ke server' });
            };
            
            xhr.send(JSON.stringify(dataUser));
        });
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