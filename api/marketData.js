/**
 * Market Data API Handler
 * Menghubungkan dengan API eksternal untuk mendapatkan data harga real-time
 * Supports: Binance, MetaTrader, Forex APIs
 */

class MarketDataAPI {
    constructor() {
        this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com';
        this.binanceUrl = 'https://api.binance.com/api/v3';
        this.timeout = 5000;
    }

    /**
     * Fetch cryptocurrency prices dari Binance API
     * @param {string} symbol - Trading pair (e.g., 'BTCUSDT', 'ETHUSDT')
     */
    async getCryptoPrice(symbol) {
        try {
            const response = await fetch(
                `${this.binanceUrl}/ticker/24hr?symbol=${symbol}`,
                { timeout: this.timeout }
            );
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            return {
                symbol: data.symbol,
                price: parseFloat(data.lastPrice),
                change24h: parseFloat(data.priceChangePercent),
                high24h: parseFloat(data.highPrice),
                low24h: parseFloat(data.lowPrice),
                volume: parseFloat(data.quoteAssetVolume),
                timestamp: new Date(data.closeTime)
            };
        } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
            return null;
        }
    }

    /**
     * Fetch multiple cryptocurrency prices
     * @param {array} symbols - Array of trading pairs
     */
    async getMultiplePrices(symbols) {
        try {
            const prices = await Promise.all(
                symbols.map(symbol => this.getCryptoPrice(symbol))
            );
            return prices.filter(price => price !== null);
        } catch (error) {
            console.error('Error fetching multiple prices:', error);
            return [];
        }
    }

    /**
     * Fetch market snapshot data
     * Menggabungkan data dari berbagai sumber
     */
    async getMarketSnapshot() {
        const defaultSymbols = [
            'BTCUSDT',   // Bitcoin
            'ETHUSDT',   // Ethereum
            'BNBUSDT',   // Binance Coin
            'ADAUSDT'    // Cardano
        ];

        return await this.getMultiplePrices(defaultSymbols);
    }

    /**
     * Fetch forex data (EUR/USD, GBP/USD, etc)
     * TODO: Integrate dengan Forex API provider
     */
    async getForexPrice(pair) {
        console.warn('Forex API integration pending');
        // Placeholder untuk koneksi forex API
        return null;
    }

    /**
     * Fetch commodity prices (GOLD, OIL, etc)
     * TODO: Integrate dengan commodity API provider
     */
    async getCommodityPrice(commodity) {
        console.warn('Commodity API integration pending');
        // Placeholder untuk koneksi commodity API
        return null;
    }

    /**
     * Subscribe ke real-time price updates menggunakan WebSocket
     * @param {string} symbol - Trading pair
     * @param {function} callback - Callback function untuk data baru
     */
    subscribeToPrice(symbol, callback) {
        const ws = new WebSocket(
            `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
        );

        ws.onopen = () => {
            console.log(`Connected to ${symbol} stream`);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            callback({
                symbol: data.s,
                price: parseFloat(data.c),
                change: parseFloat(data.p),
                changePercent: parseFloat(data.P),
                timestamp: new Date(data.E)
            });
        };

        ws.onerror = (error) => {
            console.error(`WebSocket error for ${symbol}:`, error);
        };

        // Return unsubscribe function
        return () => ws.close();
    }

    /**
     * Get historical price data untuk chart
     * @param {string} symbol - Trading pair
     * @param {string} interval - Candle interval (1m, 5m, 1h, 1d, etc)
     * @param {number} limit - Number of candles to fetch
     */
    async getCandles(symbol, interval = '1h', limit = 100) {
        try {
            const response = await fetch(
                `${this.binanceUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
                { timeout: this.timeout }
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.map(candle => ({
                time: new Date(candle[0]),
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[7])
            }));
        } catch (error) {
            console.error(`Error fetching candles for ${symbol}:`, error);
            return [];
        }
    }
}

// Export instance
const marketDataAPI = new MarketDataAPI();

// If using in Node/Browser, export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketDataAPI;
}
