'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Plus, Minus, Settings, Clock, AlertCircle } from 'lucide-react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, Area } from 'recharts';
import { useState } from 'react';

const candleData = [
  { time: '00:00', open: 1950.20, high: 1955.80, low: 1948.50, close: 1952.40 },
  { time: '04:00', open: 1952.40, high: 1958.90, low: 1950.10, close: 1956.20 },
  { time: '08:00', open: 1956.20, high: 1962.30, low: 1954.80, close: 1960.15 },
  { time: '12:00', open: 1960.15, high: 1965.90, low: 1958.40, close: 1963.50 },
  { time: '16:00', open: 1963.50, high: 1968.20, low: 1961.30, close: 1965.80 },
  { time: '20:00', open: 1965.80, high: 1970.45, low: 1963.10, close: 1968.90 },
];

const openPositions = [
  { id: 1, symbol: 'XAUUSD', type: 'BUY', entry: 1950.45, current: 1968.90, quantity: 10, pnl: 1850, pnlPct: 9.51, stopLoss: 1940.00, takeProfit: 1980.00 },
  { id: 2, symbol: 'EURUSD', type: 'SELL', entry: 1.0850, current: 1.0820, quantity: 100000, pnl: 3000, pnlPct: 2.76, stopLoss: 1.0900, takeProfit: 1.0750 },
  { id: 3, symbol: 'GBPUSD', type: 'BUY', entry: 1.2650, current: 1.2720, quantity: 50000, pnl: 3500, pnlPct: 2.85, stopLoss: 1.2600, takeProfit: 1.2800 },
];

const orderHistory = [
  { id: 1, symbol: 'XAUUSD', type: 'BUY', price: 1950.45, quantity: 10, status: 'FILLED', time: '09:30 AM' },
  { id: 2, symbol: 'EURUSD', type: 'SELL', price: 1.0850, quantity: 100000, status: 'FILLED', time: '08:15 AM' },
  { id: 3, symbol: 'GBPUSD', type: 'BUY', price: 1.2650, quantity: 50000, status: 'FILLED', time: '07:45 AM' },
];

export default function TerminalPage() {
  const [activeSymbol] = useState('XAUUSD');
  const [orderType, setOrderType] = useState('market');
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('1968.90');

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-light-primary">Trading Terminal</h1>
        <p className="text-light-secondary">Professional trading interface with live market data</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Main Chart Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Chart Card */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-light-primary">{activeSymbol}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl font-bold text-text-glow">1,968.90</span>
                  <div className="flex items-center gap-1 px-2 py-1 bg-accent-green/20 rounded">
                    <TrendingUp className="w-4 h-4 text-accent-green" />
                    <span className="text-sm font-semibold text-accent-green">+18.45 (+0.94%)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  1H
                </button>
                <button className="btn-secondary">4H</button>
                <button className="btn-secondary">1D</button>
                <button className="btn-secondary flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={candleData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="open" fill="#3b82f6" opacity={0.1} />
                <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={3} dot={false} />
                <Area type="monotone" dataKey="high" fill="#10b981" stroke="none" fillOpacity={0.1} />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Chart Info */}
            <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-dark-tertiary rounded-lg">
              {[
                { label: 'Open', value: '1,950.20' },
                { label: 'High', value: '1,970.45' },
                { label: 'Low', value: '1,948.50' },
                { label: 'Close', value: '1,968.90' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-light-secondary mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-light-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Open Positions */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-light-primary mb-4">Open Positions</h3>
            <div className="space-y-3">
              {openPositions.map((position) => (
                <div
                  key={position.id}
                  className="flex items-center justify-between p-4 bg-dark-tertiary rounded-lg border border-dark-border hover:border-accent-blue transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-light-primary">{position.symbol}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          position.type === 'BUY'
                            ? 'bg-accent-green/20 text-accent-green'
                            : 'bg-accent-red/20 text-accent-red'
                        }`}
                      >
                        {position.type}
                      </span>
                      <span className="text-xs text-light-secondary">
                        {position.quantity} units @ {position.entry}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-light-secondary">
                      <span>SL: {position.stopLoss}</span>
                      <span>•</span>
                      <span>TP: {position.takeProfit}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      position.pnl > 0 ? 'text-accent-green' : 'text-accent-red'
                    }`}>
                      +${position.pnl.toLocaleString()}
                    </p>
                    <p className={`text-xs ${
                      position.pnl > 0 ? 'text-accent-green' : 'text-accent-red'
                    }`}>
                      +{position.pnlPct}%
                    </p>
                  </div>
                  <button className="ml-4 px-3 py-1 text-xs text-accent-red hover:bg-red-500/20 rounded transition">
                    Close
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Order History */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-light-primary mb-4">Order History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-dark-border">
                  <tr className="text-light-secondary text-xs uppercase">
                    <th className="text-left py-3 px-2">Symbol</th>
                    <th className="text-left py-3 px-2">Type</th>
                    <th className="text-right py-3 px-2">Price</th>
                    <th className="text-right py-3 px-2">Quantity</th>
                    <th className="text-center py-3 px-2">Status</th>
                    <th className="text-right py-3 px-2">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {orderHistory.map((order) => (
                    <tr key={order.id} className="hover:bg-dark-tertiary transition">
                      <td className="py-3 px-2 font-semibold text-light-primary">{order.symbol}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.type === 'BUY'
                              ? 'bg-accent-green/20 text-accent-green'
                              : 'bg-accent-red/20 text-accent-red'
                          }`}
                        >
                          {order.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-light-secondary">{order.price}</td>
                      <td className="py-3 px-2 text-right text-light-secondary">{order.quantity}</td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-accent-green/20 text-accent-green">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-light-secondary">{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Right: Execution Panel */}
        <div className="space-y-6">
          {/* Trading Controls */}
          <motion.div
            className="card p-6 sticky top-28"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-bold text-light-primary mb-4">Execute Trade</h3>

            {/* Order Type */}
            <div className="mb-4">
              <label className="block text-xs uppercase text-light-secondary font-semibold mb-2">
                Order Type
              </label>
              <div className="flex gap-2">
                {['Market', 'Limit', 'Stop'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type.toLowerCase())}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                      orderType === type.toLowerCase()
                        ? 'bg-accent-blue text-white'
                        : 'bg-dark-tertiary text-light-secondary hover:border-accent-blue border border-dark-border'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Trade Direction */}
            <div className="mb-4">
              <label className="block text-xs uppercase text-light-secondary font-semibold mb-2">
                Direction
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    tradeType === 'buy'
                      ? 'bg-accent-green/20 text-accent-green border-2 border-accent-green'
                      : 'bg-dark-tertiary text-light-secondary border-2 border-dark-border hover:border-accent-green'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  BUY
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    tradeType === 'sell'
                      ? 'bg-accent-red/20 text-accent-red border-2 border-accent-red'
                      : 'bg-dark-tertiary text-light-secondary border-2 border-dark-border hover:border-accent-red'
                  }`}
                >
                  <Minus className="w-5 h-5" />
                  SELL
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-xs uppercase text-light-secondary font-semibold mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input w-full"
              />
            </div>

            {/* Price (if not market) */}
            {orderType !== 'market' && (
              <div className="mb-4">
                <label className="block text-xs uppercase text-light-secondary font-semibold mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input w-full"
                />
              </div>
            )}

            {/* Stop Loss & Take Profit */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-xs uppercase text-light-secondary font-semibold mb-2">
                  Stop Loss
                </label>
                <input type="number" placeholder="1940.00" className="input w-full text-xs" />
              </div>
              <div>
                <label className="block text-xs uppercase text-light-secondary font-semibold mb-2">
                  Take Profit
                </label>
                <input type="number" placeholder="1980.00" className="input w-full text-xs" />
              </div>
            </div>

            {/* Estimated Info */}
            <div className="bg-dark-tertiary rounded-lg p-3 mb-4 space-y-2 text-xs">
              <div className="flex justify-between text-light-secondary">
                <span>Entry Price:</span>
                <span className="text-light-primary font-semibold">1,968.90</span>
              </div>
              <div className="flex justify-between text-light-secondary">
                <span>Position Size:</span>
                <span className="text-light-primary font-semibold">${(parseFloat(quantity) * 1968.90).toFixed(2)}</span>
              </div>
              <div className="border-t border-dark-border pt-2 flex justify-between text-light-secondary">
                <span>Margin Required:</span>
                <span className="text-accent-blue font-semibold">${((parseFloat(quantity) * 1968.90) * 0.02).toFixed(2)}</span>
              </div>
            </div>

            {/* Alert */}
            <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-3 mb-4 flex gap-2 text-xs text-light-secondary">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent-blue" />
              <span>Trading involves risk. Always use stop loss orders.</span>
            </div>

            {/* Execute Button */}
            <button
              className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                tradeType === 'buy'
                  ? 'bg-accent-green hover:bg-green-600'
                  : 'bg-accent-red hover:bg-red-600'
              }`}
            >
              {tradeType === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
            </button>

            {/* Additional Buttons */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="btn-secondary text-xs py-2">Close All</button>
              <button className="btn-secondary text-xs py-2">History</button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
