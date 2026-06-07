/**
 * Trading Symbols
 */
export const TRADING_SYMBOLS = [
  { symbol: 'XAUUSD', name: 'Gold', category: 'Commodities' },
  { symbol: 'EURUSD', name: 'Euro/US Dollar', category: 'Majors' },
  { symbol: 'GBPUSD', name: 'British Pound/US Dollar', category: 'Majors' },
  { symbol: 'USDJPY', name: 'US Dollar/Japanese Yen', category: 'Majors' },
  { symbol: 'AUDUSD', name: 'Australian Dollar/US Dollar', category: 'Majors' },
  { symbol: 'USDCAD', name: 'US Dollar/Canadian Dollar', category: 'Majors' },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar/US Dollar', category: 'Majors' },
  { symbol: 'USDINR', name: 'US Dollar/Indian Rupee', category: 'Minors' },
] as const;

/**
 * Timeframes for trading charts
 */
export const TIMEFRAMES = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' },
] as const;

/**
 * Order types
 */
export const ORDER_TYPES = {
  MARKET: 'market',
  LIMIT: 'limit',
  STOP: 'stop',
  STOP_LIMIT: 'stop_limit',
} as const;

/**
 * Trade types
 */
export const TRADE_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
} as const;

/**
 * Order status
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  FILLED: 'filled',
  PARTIALLY_FILLED: 'partially_filled',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const;

/**
 * Position status
 */
export const POSITION_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  PENDING_CLOSE: 'pending_close',
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  USER: {
    PROFILE: '/api/user/profile',
    SETTINGS: '/api/user/settings',
    UPDATE_PROFILE: '/api/user/profile',
  },
  TRADING: {
    SYMBOLS: '/api/trading/symbols',
    QUOTE: '/api/trading/quote',
    CHART_DATA: '/api/trading/chart',
    OPEN_POSITIONS: '/api/trading/positions',
    ORDER_HISTORY: '/api/trading/orders',
    PLACE_ORDER: '/api/trading/orders/place',
    CLOSE_POSITION: '/api/trading/positions/close',
  },
  ACCOUNT: {
    BALANCE: '/api/account/balance',
    ANALYTICS: '/api/account/analytics',
    PERFORMANCE: '/api/account/performance',
  },
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme_preference',
  RECENT_SYMBOLS: 'recent_symbols',
  WATCHLIST: 'watchlist',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Invalid email address',
  WEAK_PASSWORD: 'Password does not meet requirements',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SERVER_ERROR: 'An error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  ORDER_PLACED: 'Order placed successfully',
  POSITION_CLOSED: 'Position closed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const;

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL: true,
} as const;

/**
 * Chart colors
 */
export const CHART_COLORS = {
  UP: '#10b981', // Green
  DOWN: '#ef4444', // Red
  NEUTRAL: '#3b82f6', // Blue
  PROFIT: '#10b981', // Green
  LOSS: '#ef4444', // Red
} as const;

/**
 * Risk levels
 */
export const RISK_LEVELS = {
  LOW: { label: 'Low', color: '#10b981', percentage: 1 },
  MEDIUM: { label: 'Medium', color: '#f59e0b', percentage: 2 },
  HIGH: { label: 'High', color: '#ef4444', percentage: 5 },
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  SHORT: 'MMM d',
  MEDIUM: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  FULL: 'EEEE, MMMM d, yyyy',
  TIME: 'HH:mm:ss',
  DATE_TIME: 'MMM d, yyyy HH:mm:ss',
} as const;

/**
 * Animation durations (in ms)
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  XS: '0px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;
