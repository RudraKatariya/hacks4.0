import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building, 
  Layers, 
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import { AnalyticsData, Statement, Transaction } from '../types';

interface AnalyticsViewProps {
  statement: Statement | null;
  analytics: AnalyticsData | null;
  transactions: Transaction[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  statement,
  analytics,
  transactions,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'trends' | 'merchants'>('categories');

  if (!analytics) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <Sparkles className="w-8 h-8 text-indigo-500 mx-auto animate-spin" />
        <p>Analyzing spending velocity and generating visualizations...</p>
      </div>
    );
  }

  const netCashflow = analytics.total_inflow - analytics.total_outflow;
  const savingsRate = analytics.total_inflow > 0 ? (netCashflow / analytics.total_inflow) * 100 : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Spending &amp; Cash Velocity Analytics</h2>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
              Deep Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Category distribution, inflow vs outflow velocity, and counterparty concentration analysis
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'categories'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveSubTab('trends')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'trends'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Trends
          </button>
          <button
            onClick={() => setActiveSubTab('merchants')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'merchants'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top Merchants
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">TOTAL INFLOW</span>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{analytics.total_inflow.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">{analytics.credit_count} Credit transactions</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">TOTAL OUTFLOW</span>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{analytics.total_outflow.toLocaleString()}</p>
          <p className="text-xs text-rose-600 font-medium mt-1">{analytics.debit_count} Debit transactions</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">NET SAVINGS BUFFER</span>
          <p className={`text-2xl font-black mt-1 ${netCashflow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ₹{netCashflow.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">{savingsRate.toFixed(1)}% savings retention</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">CATEGORIES TRACKED</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{analytics.categories.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Automated classification</p>
        </div>
      </div>

      {/* Main Analytics Content */}
      {activeSubTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Donut Chart */}
          <div className="lg:col-span-6 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Category Allocation Donut</h3>
            <div className="h-72 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {analytics.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1 text-white">
                            <p className="font-bold">{data.category}</p>
                            <p className="text-emerald-400 font-mono">₹{data.amount.toLocaleString()}</p>
                            <p className="text-slate-400 text-[11px]">{data.percentage}% of total outflow</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 font-medium">Total Outflow</span>
                <span className="text-base font-black text-slate-900 font-mono">₹{analytics.total_outflow.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Breakdown */}
          <div className="lg:col-span-6 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Expenditure by Category (₹)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categories} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Spent']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {analytics.categories.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'trends' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Multi-Month Income vs Expenses Trajectory</h3>
              <p className="text-xs text-slate-500">Historical trend progression across banking cycles</p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthly_trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <Tooltip 
                  formatter={(val: number) => [`₹${val.toLocaleString()}`]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="inflow" name="Inflow (+)" stroke="#10b981" fillOpacity={1} fill="url(#colorInflow)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="outflow" name="Outflow (-)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorOutflow)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeSubTab === 'merchants' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Top Counterparties &amp; Merchant Concentration</h3>
            </div>
            <span className="text-xs text-slate-500">Highest volume spending destinations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {analytics.top_merchants.map((m, idx) => (
              <div key={m.name} className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center font-mono">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-mono text-indigo-600 font-bold">{m.percent_of_outflow}% Outflow</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs truncate">{m.name}</p>
                  <p className="text-[11px] text-slate-500">{m.category}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">{m.transaction_count} transactions</span>
                  <span className="text-slate-900 font-bold">₹{m.total_spent.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
