/**
 * Common types used throughout the application
 */

/**
 * User type
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Auth tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Trading symbol
 */
export interface TradingSymbol {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Order
 */
export interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price: number;
  limitPrice?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected';
  createdAt: Date;
  filledAt?: Date;
  cancelledAt?: Date;
}

/**
 * Position
 */
export interface Position {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number;
  pnlPercent: number;
  openedAt: Date;
  status: 'open' | 'closed' | 'pending_close';
}

/**
 * Trade (closed position)
 */
export interface Trade extends Position {
  exitPrice: number;
  closedAt: Date;
  duration: number; // in milliseconds
}

/**
 * Account balance
 */
export interface AccountBalance {
  totalBalance: number;
  availableBalance: number;
  usedMargin: number;
  freeMargin: number;
  marginLevel: number;
  openPositions: number;
}

/**
 * Portfolio statistics
 */
export interface PortfolioStats {
  totalProfit: number;
  totalProfitPercent: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
}

/**
 * API Response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Filter options
 */
export interface FilterOptions {
  symbol?: string;
  type?: 'buy' | 'sell';
  status?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'date' | 'profit' | 'symbol';
  sortOrder?: 'asc' | 'desc';
}

/**
 * UI State
 */
export interface UiState {
  isLoading: boolean;
  error?: string;
  success?: string;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  read: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'dark' | 'light';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  defaultTimeframe: string;
  defaultSymbols: string[];
}

/**
 * Market data
 */
export interface MarketData {
  symbol: string;
  timestamp: Date;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  change: number;
  changePercent: number;
}

/**
 * Risk parameters
 */
export interface RiskParameters {
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
  positionSize: number;
}

/**
 * Trade alert
 */
export interface TradeAlert {
  id: string;
  symbol: string;
  type: 'price' | 'technical' | 'news';
  condition: string;
  price?: number;
  triggered: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}
