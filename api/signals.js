/**
 * Trading Signals API Handler
 * Menangani sinyal trading, entry points, stop loss, take profit
 */

class SignalsAPI {
    constructor() {
        this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com/api';
        this.timeout = 5000;
    }

    /**
     * Get list of active signals
     * @param {object} filters - Filter options {status, pair, timeframe}
     */
    async getSignals(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(
                `${this.baseUrl}/signals?${params}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders(),
                    timeout: this.timeout
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch signals');
            }

            return await response.json();
        } catch (error) {
            console.error('Get signals error:', error);
            return [];
        }
    }

    /**
     * Get single signal detail
     * @param {string} signalId - Signal ID
     */
    async getSignal(signalId) {
        try {
            const response = await fetch(
                `${this.baseUrl}/signals/${signalId}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders(),
                    timeout: this.timeout
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch signal');
            }

            return await response.json();
        } catch (error) {
            console.error('Get signal error:', error);
            throw error;
        }
    }

    /**
     * Subscribe to signal notifications
     * @param {string} signalId - Signal ID untuk subscribe
     */
    async subscribeToSignal(signalId) {
        try {
            const response = await fetch(
                `${this.baseUrl}/signals/${signalId}/subscribe`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    timeout: this.timeout
                }
            );

            if (!response.ok) {
                throw new Error('Failed to subscribe to signal');
            }

            return await response.json();
        } catch (error) {
            console.error('Subscribe signal error:', error);
            throw error;
        }
    }

    /**
     * Get signal performance history
     * @param {object} filters - Filter options
     */
    async getSignalPerformance(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(
                `${this.baseUrl}/signals/performance?${params}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders(),
                    timeout: this.timeout
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch performance');
            }

            return await response.json();
        } catch (error) {
            console.error('Get performance error:', error);
            return null;
        }
    }

    /**
     * Get win rate statistics
     */
    async getWinRateStats() {
        try {
            const response = await fetch(
                `${this.baseUrl}/signals/stats/winrate`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders(),
                    timeout: this.timeout
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch win rate stats');
            }

            return await response.json();
        } catch (error) {
            console.error('Get win rate error:', error);
            return null;
        }
    }

    /**
     * Report signal result (profit/loss)
     * @param {string} signalId - Signal ID
     * @param {object} result - Result data {entryPrice, exitPrice, profit, loss}
     */
    async reportSignalResult(signalId, result) {
        try {
            const response = await fetch(
                `${this.baseUrl}/signals/${signalId}/result`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(result),
                    timeout: this.timeout
                }
            );

            if (!response.ok) {
                throw new Error('Failed to report signal result');
            }

            return await response.json();
        } catch (error) {
            console.error('Report result error:', error);
            throw error;
        }
    }

    /**
     * Enable push notifications for signals
     */
    async enablePushNotifications() {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                throw new Error('Push notifications not supported');
            }

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
            });

            // Send subscription to server
            const response = await fetch(
                `${this.baseUrl}/signals/notifications/subscribe`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify({ subscription }),
                    timeout: this.timeout
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Push notification error:', error);
            throw error;
        }
    }

    /**
     * Get user's signal subscriptions
     */
    async getUserSubscriptions() {
        try {
            const response = await fetch(
                `${this.baseUrl}/signals/subscriptions`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders(),
                    timeout: this.timeout
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch subscriptions');
            }

            return await response.json();
        } catch (error) {
            console.error('Get subscriptions error:', error);
            return [];
        }
    }

    /**
     * Unsubscribe dari signal
     * @param {string} signalId - Signal ID
     */
    async unsubscribeFromSignal(signalId) {
        try {
            const response = await fetch(
                `${this.baseUrl}/signals/${signalId}/unsubscribe`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    timeout: this.timeout
                }
            );

            if (!response.ok) {
                throw new Error('Failed to unsubscribe');
            }

            return await response.json();
        } catch (error) {
            console.error('Unsubscribe error:', error);
            throw error;
        }
    }

    /**
     * Get authorization headers with token
     */
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }
}

// Export
const signalsAPI = new SignalsAPI();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SignalsAPI;
}
