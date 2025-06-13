// Service untuk mengelola autentikasi user
import { API_ENDPOINTS } from '../config/api.js';

class AuthService {
    /**
     * Login user ke sistem
     * @param {Object} kredensial - Email dan password user
     * @returns {Promise<Object>} Response dari API
     */    async login(username, password) {
        try {
            const response = await fetch('https://202.10.35.227/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } catch (error) {
            console.error('Error saat login:', error);
            
            // Coba login dengan metode alternatif jika fetch gagal
            return this.tryAlternativeLogin(username, password);
        }
    }

    async tryAlternativeLogin(username, password) {
        try {
            console.log("Mencoba metode login alternatif...");
            
            // Coba dengan alternatif endpoint
            const response = await fetch('https://202.10.35.227/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } catch (error) {
            console.error('Metode login alternatif gagal, mencoba dengan XHR...');
            
            // Jika kedua metode gagal, coba dengan XMLHttpRequest sebagai fallback
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://202.10.35.227/api/user/login', true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                
                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            localStorage.setItem('token', data.token);
                            localStorage.setItem('user', JSON.stringify(data.user));
                            resolve(data);
                        } catch (e) {
                            reject(new Error('Failed to parse response'));
                        }
                    } else {
                        reject(new Error(`XHR error! status: ${xhr.status}`));
                    }
                };
                
                xhr.onerror = function() {
                    reject(new Error('Network error with XHR'));
                };
                
                xhr.send(JSON.stringify({ username, password }));
            });
        }
    }

    /**
     * Register user baru
     * @param {Object} dataUser - Data user baru (name, email, password)
     * @returns {Promise<Object>} Response dari API
     */
    async register(userData) {
        try {
            const response = await fetch('https://202.10.35.227/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error saat register:', error);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect ke halaman login atau halaman utama
        window.location.href = '/SmartSaku/src/templates/login.html';
    }

    isAuthenticated() {
        return localStorage.getItem('token') !== null;
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    }

    getToken() {
        return localStorage.getItem('token');
    }

    async getProfile() {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('https://202.10.35.227/api/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error saat mengambil profil:', error);
            throw error;
        }
    }

    async updateProfile(profileData) {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('https://202.10.35.227/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Update user data in localStorage if necessary
            const currentUser = this.getCurrentUser();
            if (currentUser) {
                const updatedUser = { ...currentUser, ...profileData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            
            return data;
        } catch (error) {
            console.error('Error saat mengupdate profil:', error);
            throw error;
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('https://202.10.35.227/api/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error saat mengubah password:', error);
            throw error;
        }
    }

    redirectToLogin() {
        window.location.href = '/SmartSaku/src/templates/login.html';
    }
}

// Export sebagai singleton
const authService = new AuthService();
export default authService;