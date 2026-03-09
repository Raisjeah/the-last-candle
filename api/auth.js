/**
 * Authentication API Handler
 * Menangani login, register, dan user session management
 */

class AuthAPI {
    constructor() {
        this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com/api';
        this.timeout = 5000;
    }

    /**
     * Register user baru
     * @param {object} userData - User data {email, password, username, fullName}
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                timeout: this.timeout
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }

            const data = await response.json();
            // Store token
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                timeout: this.timeout
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();
            // Store token
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('authToken');
        sessionStorage.clear();
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    /**
     * Get current user profile
     */
    async getUserProfile() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token');
            }

            const response = await fetch(`${this.baseUrl}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                timeout: this.timeout
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.logout();
                }
                throw new Error('Failed to fetch profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Profile fetch error:', error);
            throw error;
        }
    }

    /**
     * Request password reset
     * @param {string} email - User email
     */
    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
                timeout: this.timeout
            });

            if (!response.ok) {
                throw new Error('Failed to request password reset');
            }

            return await response.json();
        } catch (error) {
            console.error('Password reset request error:', error);
            throw error;
        }
    }

    /**
     * Reset password dengan token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     */
    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
                timeout: this.timeout
            });

            if (!response.ok) {
                throw new Error('Failed to reset password');
            }

            return await response.json();
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }

    /**
     * Get authentication token
     */
    getToken() {
        return localStorage.getItem('authToken');
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    /**
     * Add authorization header ke fetch request
     */
    getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }
}

// Export
const authAPI = new AuthAPI();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthAPI;
}
