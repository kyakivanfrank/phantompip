'use client';

import { motion } from 'framer-motion';
import { Filter, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';

const monthlyData = [
  { month: 'Jan', trades: 12, wins: 8, losses: 4, profit: 2500, drawdown: -150 },
  { month: 'Feb', trades: 15, wins: 10, losses: 5, profit: 3200, drawdown: -200 },
  { month: 'Mar', trades: 10, wins: 7, losses: 3, profit: 2100, drawdown: -100 },
  { month: 'Apr', trades: 18, wins: 12, losses: 6, profit: 4500, drawdown: -300 },
  { month: 'May', trades: 20, wins: 14, losses: 6, profit: 6200, drawdown: -250 },
  { month: 'Jun', trades: 16, wins: 11, losses: 5, profit: 8300, drawdown: -180 },
];

const tradeTypeData = [
  { name: 'Winning Trades', value: 67, color: '#10b981' },
  { name: 'Losing Trades', value: 33, color: '#ef4444' },
];

const trades = [
  {
    id: 1,
    date: '2024-06-15',
    symbol: 'XAUUSD',
    type: 'BUY',
    entry: 1950.45,
    exit: 1962.30,
    quantity: 10,
    profit: 590,
    pnlPct: 3.05,
    duration: '2h 15m',
    status: 'Closed',
  },
  {
    id: 2,
    date: '2024-06-14',
    symbol: 'EURUSD',
    type: 'SELL',
    entry: 1.0850,
    exit: 1.0820,
    quantity: 100000,
    profit: 3000,
    pnlPct: 2.76,
    duration: '4h 30m',
    status: 'Closed',
  },
  {
    id: 3,
    date: '2024-06-13',
    symbol: 'GBPUSD',
    type: 'BUY',
    entry: 1.2650,
    exit: 1.2720,
    quantity: 50000,
    profit: 3500,
    pnlPct: 2.85,
    duration: '6h',
    status: 'Closed',
  },
  {
    id: 4,
    date: '2024-06-12',
    symbol: 'USDJPY',
    type: 'SELL',
    entry: 156.80,
    exit: 155.50,
    quantity: 50000,
    profit: -650,
    pnlPct: -0.83,
    duration: '1h 45m',
    status: 'Closed',
  },
  {
    id: 5,
    date: '2024-06-11',
    symbol: 'AUDUSD',
    type: 'BUY',
    entry: 0.6720,
    exit: 0.6810,
    quantity: 100000,
    profit: 9000,
    pnlPct: 1.34,
    duration: '3h',
    status: 'Closed',
  },
];

const statistics = [
  { label: 'Total Trades', value: '81', change: '+12%' },
  { label: 'Win Rate', value: '67.3%', change: '+5.2%' },
  { label: 'Profit Factor', value: '2.45', change: '+0.3' },
  { label: 'Avg Win/Loss', value: '1.8x', change: '+0.2x' },
  { label: 'Best Trade', value: '$9,000', change: 'AUDUSD' },
  { label: 'Worst Trade', value: '-$650', change: 'USDJPY' },
  { label: 'Consecutive Wins', value: '7', change: 'Current' },
  { label: 'Drawdown', value: '-$3,200', change: 'Max' },
];

export default function AnalyticsPage() {
  const [filterSymbol, setFilterSymbol] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-3xl font-bold text-light-primary">Analytics & Performance</h1>
        <p className="text-light-secondary">Comprehensive trading analysis and performance metrics</p>
      </motion.div>

      {/* Statistics Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statistics.map((stat, i) => (
          <div key={i} className="card p-6">
            <p className="text-light-secondary text-xs uppercase tracking-wider mb-2">
              {stat.label}
            </p>
            <h3 className="text-2xl font-bold text-light-primary mb-2">{stat.value}</h3>
            <p className={`text-sm font-semibold ${
              stat.value.includes('+') || stat.label === 'Win Rate' || stat.label === 'Avg Win/Loss'
                ? 'text-accent-green'
                : 'text-light-secondary'
            }`}>
              {stat.change}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Performance */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-bold text-light-primary mb-4">Monthly Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="profit" fill="#10b981" name="Profit ($)" />
              <Bar dataKey="drawdown" fill="#ef4444" name="Drawdown ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Win Rate Pie */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-primary mb-4">Trade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tradeTypeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {tradeTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {tradeTypeData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-light-secondary">{item.name}</span>
                </div>
                <span className="text-light-primary font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Trade Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trades Per Month */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-bold text-light-primary mb-4">Trades & Win Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" yAxisId="left" />
              <YAxis stroke="#9ca3af" yAxisId="right" orientation="right" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="trades" stroke="#3b82f6" strokeWidth={2} name="Total Trades" />
              <Line yAxisId="right" type="monotone" dataKey="wins" stroke="#10b981" strokeWidth={2} name="Winning Trades" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Ratios */}
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-bold text-light-primary">Key Ratios</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-dark-border">
              <span className="text-light-secondary">Sharpe Ratio</span>
              <span className="text-light-primary font-bold">2.34</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-dark-border">
              <span className="text-light-secondary">Sortino Ratio</span>
              <span className="text-light-primary font-bold">3.12</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-dark-border">
              <span className="text-light-secondary">Recovery Factor</span>
              <span className="text-light-primary font-bold">4.44</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light-secondary">Profit Factor</span>
              <span className="text-accent-green font-bold">2.45</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trade History */}
      <motion.div variants={itemVariants} className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-light-primary">Trade History</h3>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 pb-6 border-b border-dark-border">
          <div className="flex-1">
            <label className="block text-xs text-light-secondary mb-2">Symbol</label>
            <select
              value={filterSymbol}
              onChange={(e) => setFilterSymbol(e.target.value)}
              className="input w-full text-sm"
            >
              <option>All</option>
              <option>XAUUSD</option>
              <option>EURUSD</option>
              <option>GBPUSD</option>
              <option>USDJPY</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-light-secondary mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input w-full text-sm"
            >
              <option>All</option>
              <option>BUY</option>
              <option>SELL</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button className="btn-secondary text-sm">Apply</button>
            <button className="btn-secondary text-sm">Reset</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-dark-border">
              <tr className="text-light-secondary text-xs uppercase">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Symbol</th>
                <th className="text-center py-3 px-4">Type</th>
                <th className="text-right py-3 px-4">Entry</th>
                <th className="text-right py-3 px-4">Exit</th>
                <th className="text-right py-3 px-4">Qty</th>
                <th className="text-right py-3 px-4">Profit</th>
                <th className="text-right py-3 px-4">Return %</th>
                <th className="text-right py-3 px-4">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-dark-tertiary transition">
                  <td className="py-4 px-4 text-light-secondary">{trade.date}</td>
                  <td className="py-4 px-4 font-semibold text-light-primary">{trade.symbol}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        trade.type === 'BUY'
                          ? 'bg-accent-green/20 text-accent-green'
                          : 'bg-accent-red/20 text-accent-red'
                      }`}
                    >
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-light-secondary">{trade.entry}</td>
                  <td className="py-4 px-4 text-right text-light-secondary">{trade.exit}</td>
                  <td className="py-4 px-4 text-right text-light-secondary">{trade.quantity}</td>
                  <td className={`py-4 px-4 text-right font-bold ${
                    trade.profit > 0 ? 'text-accent-green' : 'text-accent-red'
                  }`}>
                    ${trade.profit}
                  </td>
                  <td className={`py-4 px-4 text-right font-bold ${
                    trade.pnlPct > 0 ? 'text-accent-green' : 'text-accent-red'
                  }`}>
                    {trade.pnlPct > 0 ? '+' : ''}{trade.pnlPct}%
                  </td>
                  <td className="py-4 px-4 text-right text-light-secondary">{trade.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 text-sm">
          <span className="text-light-secondary">Showing 1-5 of 81 trades</span>
          <div className="flex gap-2">
            <button className="btn-secondary disabled:opacity-50">Previous</button>
            <button className="px-3 py-2 bg-accent-blue text-white rounded">1</button>
            <button className="btn-secondary">2</button>
            <button className="btn-secondary">3</button>
            <button className="btn-secondary">Next</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
