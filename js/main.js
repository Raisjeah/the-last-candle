/**
 * The Last Candle - Main JavaScript
 * Client-side logic untuk interaksi UI dan integrasi API
 */

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu ketika link diklik
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scroll untuk internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize market data if needed
    initializeMarketData();
});

/**
 * Initialize market data display
 * Menampilkan real-time market data di hero section
 */
async function initializeMarketData() {
    // Placeholder untuk market data integration
    console.log('Market data initialization ready');
    // Akan diintegrasikan dengan marketData.js
}

/**
 * Push notification handler
 */
function initializePushNotifications() {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        console.log('Push notifications not supported');
        return;
    }

    // Request notification permission
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

/**
 * Handle authentication state
 */
function updateAuthUI() {
    const token = localStorage.getItem('authToken');
    const loginLink = document.querySelector('.nav-login');
    const registerLink = document.querySelector('.nav-register');

    if (token && loginLink && registerLink) {
        // User sudah login
        loginLink.textContent = 'Dashboard';
        loginLink.href = '../dashboard/main.html';
        registerLink.textContent = 'Logout';
        registerLink.href = '#';
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

/**
 * Logout function
 */
function logout() {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    window.location.href = 'index.html';
}

/**
 * Utility: Format currency
 */
function formatCurrency(value, currency = 'USD') {
    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
    });
    return formatter.format(value);
}

/**
 * Utility: Format percentage
 */
function formatPercentage(value) {
    return `${(value).toFixed(2)}%`;
}

/**
 * Utility: Format date
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * Error handling
 */
function handleError(error, context = 'Unknown error') {
    console.error(`${context}:`, error);
    // Menampilkan user-friendly error message
    showNotification(`Error: ${error.message}`, 'error');
}

/**
 * Show notification/toast
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

/**
 * API utility functions
 */
const APIUtil = {
    /**
     * Generic fetch wrapper dengan error handling
     */
    async fetch(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders(),
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            handleError(error, `API fetch: ${url}`);
            throw error;
        }
    },

    /**
     * Get auth headers
     */
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    },

    /**
     * POST request
     */
    post(url, data) {
        return this.fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * GET request
     */
    get(url) {
        return this.fetch(url, { method: 'GET' });
    },

    /**
     * PUT request
     */
    put(url, data) {
        return this.fetch(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    /**
     * DELETE request
     */
    delete(url) {
        return this.fetch(url, { method: 'DELETE' });
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    initializePushNotifications();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatCurrency, formatPercentage, formatDate, APIUtil };
}
