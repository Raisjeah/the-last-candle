# The Last Candle - API Documentation

## Overview
API folder structure untuk menghubungkan aplikasi The Last Candle dengan berbagai data provider dan backend services.

## Folder Structure

```
/api
├── marketData.js      # Cryptocurrency & Market Data API
├── auth.js            # Authentication & User Management
├── signals.js         # Trading Signals API
├── .env.example       # Environment variables template
└── README.md          # Documentation (file ini)
```

## API Modules

### 1. Market Data API (`marketData.js`)
Mengelola semua data harga real-time dari berbagai sumber.

#### Features:
- **Binance Integration**: Fetch cryptocurrency prices dari Binance
- **WebSocket Support**: Real-time price updates
- **Historical Data**: Candle/OHLC data untuk charting
- **Multiple Symbols**: Support untuk berbagai trading pairs

#### Usage:
```javascript
// Import
const MarketDataAPI = require('./api/marketData.js');
const marketData = new MarketDataAPI();

// Get single price
const btcPrice = await marketData.getCryptoPrice('BTCUSDT');

// Get multiple prices
const prices = await marketData.getMultiplePrices(['BTCUSDT', 'ETHUSDT']);

// Get market snapshot
const snapshot = await marketData.getMarketSnapshot();

// Subscribe to real-time updates
const unsubscribe = marketData.subscribeToPrice('BTCUSDT', (data) => {
    console.log('New price:', data.price);
});

// Unsubscribe
unsubscribe();

// Get historical candles
const candles = await marketData.getCandles('BTCUSDT', '1h', 100);
```

#### Supported Symbols:
- **Crypto**: BTCUSDT, ETHUSDT, BNBUSDT, ADAUSDT, DOGEUSDT, XRPUSDT
- **Forex**: EUR/USD, GBP/USD, JPY/USD (pending implementation)
- **Commodities**: GOLD, OIL, SILVER (pending implementation)

---

### 2. Authentication API (`auth.js`)
Mengelola user authentication dan session management.

#### Features:
- **User Registration**: Daftar user baru
- **Login**: Autentikasi user
- **Token Management**: JWT token handling
- **Password Reset**: Reset password functionality
- **Profile Management**: User profile management

#### Usage:
```javascript
// Import
const AuthAPI = require('./api/auth.js');
const auth = new AuthAPI();

// Register
const registerResult = await auth.register({
    email: 'user@example.com',
    password: 'securePassword123',
    username: 'username',
    fullName: 'User Full Name'
});

// Login
const loginResult = await auth.login('user@example.com', 'password');
// Token otomatis disimpan di localStorage

// Get current user
const profile = await auth.getUserProfile();

// Check authentication
if (auth.isAuthenticated()) {
    console.log('User is logged in');
}

// Request password reset
await auth.requestPasswordReset('user@example.com');

// Reset password dengan token
await auth.resetPassword(resetToken, 'newPassword123');

// Logout
auth.logout();
```

#### Token Storage:
- Token disimpan di `localStorage.authToken`
- Otomatis dikirim di header `Authorization: Bearer {token}`

---

### 3. Trading Signals API (`signals.js`)
Mengelola trading signals dan notifikasi.

#### Features:
- **Get Signals**: Ambil list sinyal aktif
- **Signal Details**: Detail sinyal (entry, SL, TP)
- **Subscribe**: Subscribe ke sinyal tertentu
- **Performance**: Tracking sinyal performance & win rate
- **Push Notifications**: Real-time signal notifications
- **Report Results**: Report profit/loss dari sinyal

#### Usage:
```javascript
// Import
const SignalsAPI = require('./api/signals.js');
const signals = new SignalsAPI();

// Get all active signals
const activeSignals = await signals.getSignals({
    status: 'active',
    pair: 'BTCUSDT'
});

// Get specific signal
const signal = await signals.getSignal('signal_id_123');

// Subscribe to signal
await signals.subscribeToSignal('signal_id_123');

// Get signal performance
const performance = await signals.getSignalPerformance({
    timeframe: '7d'
});

// Get win rate statistics
const stats = await signals.getWinRateStats();

// Report signal result
await signals.reportSignalResult('signal_id_123', {
    entryPrice: 42000,
    exitPrice: 43000,
    profit: 1000,
    pnlPercent: 2.38
});

// Enable push notifications
await signals.enablePushNotifications();

// Get user's subscriptions
const subscriptions = await signals.getUserSubscriptions();

// Unsubscribe
await signals.unsubscribeFromSignal('signal_id_123');
```

---

## Backend Integration Guide

### Koneksi ke Backend API
Semua module menggunakan base URL dari environment variable:

```javascript
const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com/api';
```

### Required API Endpoints

Backend Anda harus menyediakan endpoints berikut:

#### Authentication
```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
GET    /api/auth/profile           - Get user profile
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
```

#### Signals
```
GET    /api/signals                - List signals
GET    /api/signals/:id            - Get signal detail
POST   /api/signals/:id/subscribe  - Subscribe to signal
POST   /api/signals/:id/result     - Report signal result
GET    /api/signals/stats/winrate  - Get win rate stats
GET    /api/signals/performance    - Get performance data
```

---

## Third-Party Integrations

### 1. Binance API (Public)
- **Endpoint**: https://api.binance.com/api/v3
- **No Authentication Required**: API publik, tidak perlu API key untuk basic queries
- **Rate Limits**: 1200 requests per minute
- **Docs**: https://binance-docs.github.io/apidocs/

### 2. WebSocket (Real-time Data)
```javascript
// Binance WebSocket
wss://stream.binance.com:9443/ws/btcusdt@ticker

// Data types available:
// @ticker      - 24h ticker
// @trade       - Recent trades
// @klines      - Candlestick/OHLC
// @depth       - Order book depth
```

### 3. TradingView Charting Library (Frontend)
```html
<!-- Include TradingView Library -->
<script src="https://s3.tradingview.com/tv.js"></script>

<!-- Usage in dashboard -->
<div id="tv_chart_container"></div>
<script>
    new TradingView.widget({
        autosize: true,
        symbol: 'BINANCE:BTCUSDT',
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#0f1419',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: 'tv_chart_container'
    });
</script>
```

---

## Security Considerations

### 1. HTTPS Requirement
- Semua koneksi API harus menggunakan HTTPS
- Set `REACT_APP_ENABLE_HTTPS=true` di environment

### 2. Authentication Token
- Simpan JWT token di secure httpOnly cookie (jika possible)
- Atau gunakan localStorage dengan CSRF protection
- Selalu kirim token di Authorization header

### 3. CORS Configuration
```javascript
// Backend harus mengkonfigurasi CORS
CORS_ORIGIN = https://yourdomain.com
```

### 4. Rate Limiting
- Implementasikan rate limiting untuk API calls
- Contoh: 100 requests per 5 minutes per user

### 5. Input Validation
- Validasi semua input di frontend dan backend
- Gunakan parameterized queries untuk database

---

## Error Handling

Setiap module mengembalikan error dengan format:
```javascript
{
    status: 400,
    message: 'Deskripsi error',
    code: 'ERROR_CODE'
}
```

### Common Error Codes:
- `UNAUTHORIZED` - Token tidak valid atau expired
- `FORBIDDEN` - User tidak memiliki akses
- `NOT_FOUND` - Resource tidak ditemukan
- `VALIDATION_ERROR` - Input validation gagal
- `RATE_LIMIT` - Terlalu banyak requests
- `SERVER_ERROR` - Backend error

---

## Environment Variables Setup

1. Copy `.env.example` ke `.env`:
```bash
cp api/.env.example .env
```

2. Update dengan nilai yang sesuai:
```env
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_BINANCE_API_URL=https://api.binance.com/api/v3
REACT_APP_JWT_SECRET=your_secret_key
```

3. Load environment variables dalam aplikasi:
```javascript
// Untuk frontend
import dotenv from 'dotenv';
dotenv.config();
```

---

## Testing API Endpoints

### Using cURL
```bash
# Get BTC price
curl "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"

# Login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Using Postman
1. Import API collection dari file docs/postman_collection.json
2. Set environment variables di Postman
3. Run requests untuk testing

---

## Future Enhancements

### Planned Features:
- [ ] Forex API integration (Alpha Vantage / OANDA)
- [ ] Commodity API integration (MetalAPI / Twelve Data)
- [ ] Advanced charting dengan WebGL
- [ ] Machine Learning signal prediction
- [ ] Advanced portfolio tracking
- [ ] Social trading features
- [ ] Mobile app synchronization

---

## Support & Documentation

- **API Docs**: https://api.example.com/docs
- **GitHub Issues**: https://github.com/yourrepo/issues
- **Discord Community**: https://discord.gg/yourserver

---

## License
Proprietary - The Last Candle Platform
