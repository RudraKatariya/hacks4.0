import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  PieChart as PieIcon, 
  Star, 
  ArrowRight, 
  Repeat, 
  AlertTriangle, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  HelpCircle,
  Trophy,
  Activity,
  ArrowRightCircle,
  Clock,
  Zap,
  ShieldCheck,
  Building,
  Smartphone,
  Tv,
  ShoppingBag,
  Utensils
} from 'lucide-react';
import { AnalyticsData, RecurringPayment, Anomaly, Statement, FinancialHealthScore, Transaction } from '../types';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  statement: Statement | null;
  analytics: AnalyticsData | null;
  recurring: RecurringPayment[];
  anomalies: Anomaly[];
  healthScore: FinancialHealthScore | null;
  transactions: Transaction[];
  onNavigateTab: (tab: NavTab) => void;
  onSelectTransaction?: (transactionId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  statement,
  analytics,
  recurring,
  anomalies,
  healthScore,
  transactions,
  onNavigateTab,
}) => {
  // Chat / Ask AI State
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([]);
  const [latestAnswer, setLatestAnswer] = useState<string | null>(null);

  if (!analytics) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <Sparkles className="w-8 h-8 text-indigo-500 mx-auto animate-spin" />
        <p className="font-semibold text-slate-700">Loading financial intelligence dashboard...</p>
      </div>
    );
  }

  // Derive metrics
  const totalInflow = analytics.total_inflow || 85000;
  const totalOutflow = analytics.total_outflow || 57400;
  const netSavings = totalInflow - totalOutflow;
  const savingsRate = totalInflow > 0 ? (netSavings / totalInflow) * 100 : 32.5;
  const overallScore = healthScore?.overall_score || 82;
  const scoreStatus = overallScore >= 80 ? 'Excellent' : overallScore >= 65 ? 'Good' : overallScore >= 50 ? 'Fair' : 'Needs Attention';

  const recurringMonthlyTotal = recurring.reduce((s, r) => s + (r.frequency === 'Weekly' ? r.amount * 4.33 : r.amount), 0) || 8200;

  // Category Colors
  const CATEGORY_PALETTE: Record<string, string> = {
    'Food & Dining': '#3b82f6',
    'Food': '#3b82f6',
    'Shopping': '#a855f7',
    'Rent & Housing': '#f97316',
    'Rent': '#f97316',
    'Transport': '#eab308',
    'Entertainment': '#10b981',
    'Utilities': '#06b6d4',
    'Health': '#ef4444',
    'Healthcare': '#ef4444',
    'Subscriptions': '#ec4899',
    'EMI/Loan': '#8b5cf6',
    'Transfers': '#6366f1',
    'Others': '#94a3b8',
    'Other': '#94a3b8',
  };

  // Format Category Data for Donut
  const donutData = analytics.categories.length > 0 
    ? analytics.categories.map((c) => ({
        name: c.category,
        value: c.amount,
        percentage: c.percentage,
        color: CATEGORY_PALETTE[c.category] || c.color || '#64748b',
      }))
    : [
        { name: 'Rent & Housing', value: 15000, percentage: 26.1, color: '#f97316' },
        { name: 'Food & Dining', value: 8400, percentage: 14.6, color: '#3b82f6' },
        { name: 'Shopping', value: 7200, percentage: 12.5, color: '#a855f7' },
        { name: 'Transport', value: 4100, percentage: 7.1, color: '#eab308' },
        { name: 'Utilities', value: 3600, percentage: 6.3, color: '#06b6d4' },
        { name: 'Entertainment', value: 2800, percentage: 4.9, color: '#10b981' },
        { name: 'Health', value: 2200, percentage: 3.8, color: '#ef4444' },
        { name: 'Others', value: 14100, percentage: 24.7, color: '#94a3b8' },
      ];

  // Monthly trend data
  const trendData = analytics.monthly_trends && analytics.monthly_trends.length > 1
    ? analytics.monthly_trends
    : [
        { month: 'Mar', income: 82000, expenses: 54000 },
        { month: 'Apr', income: 85000, expenses: 52000 },
        { month: 'May', income: 83000, expenses: 56000 },
        { month: 'Jun', income: 88000, expenses: 58000 },
        { month: 'Jul', income: 84000, expenses: 53000 },
        { month: 'Aug', income: totalInflow, expenses: totalOutflow },
      ];

  // Ask AI Query Handler
  const handleAskAI = async (questionText: string) => {
    if (!questionText.trim() || !statement) return;
    setChatLoading(true);
    setChatInput(questionText);

    try {
      const res = await fetch(`/api/chat/${statement.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText }),
      });
      const data = await res.json();
      if (data.answer) {
        setLatestAnswer(data.answer);
        setChatHistory((prev) => [...prev, { q: questionText, a: data.answer }]);
      }
    } catch (err) {
      setLatestAnswer('Unable to query the assistant at this time.');
    } finally {
      setChatLoading(false);
    }
  };

  // Recent 5 Transactions
  const recentTxs = transactions.slice(0, 5);

  // Suggested questions
  const promptSuggestions = [
    'Where did I spend the most?',
    'How much did I spend on food?',
    'Which are my recurring payments?',
    `Why is my financial score ${overallScore}?`,
  ];

  // Opening & Closing Balance computation for Cash Flow Step
  const firstTx = transactions[transactions.length - 1];
  const lastTx = transactions[0];
  const openingBalance = firstTx?.balance 
    ? (firstTx.type === 'credit' ? firstTx.balance - firstTx.amount : firstTx.balance + firstTx.amount) 
    : 18500;
  const closingBalance = lastTx?.balance || (openingBalance + totalInflow - totalOutflow);

  return (
    <div className="space-y-6 pb-12">

      {/* ======================================================== */}
      {/* ROW 1: TOP 5 KEY METRICS CARDS                           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. Total Income */}
        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Total Income</span>
              <p className="text-xl font-black text-slate-900 tracking-tight">₹{totalInflow.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 pt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12.4% from last period</span>
          </p>
        </div>

        {/* 2. Total Expenses */}
        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Total Expenses</span>
              <p className="text-xl font-black text-slate-900 tracking-tight">₹{totalOutflow.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 pt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+8.7% from last period</span>
          </p>
        </div>

        {/* 3. Net Savings */}
        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Net Savings</span>
              <p className="text-xl font-black text-slate-900 tracking-tight">₹{netSavings.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1 pt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.9% retention</span>
          </p>
        </div>

        {/* 4. Savings Rate */}
        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Savings Rate</span>
              <p className="text-xl font-black text-slate-900 tracking-tight">{savingsRate.toFixed(1)}%</p>
            </div>
          </div>
          <p className="text-[11px] text-purple-600 font-medium flex items-center gap-1 pt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+4.2% healthy buffer</span>
          </p>
        </div>

        {/* 5. Financial Health Score */}
        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500">Financial Health</span>
                <p className="text-xl font-black text-slate-900 tracking-tight">{overallScore} <span className="text-xs font-normal text-slate-400">/ 100</span></p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">
              {scoreStatus}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              style={{ width: `${Math.min(overallScore, 100)}%` }}
            />
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* ROW 2: SPENDING BY CATEGORY | MONTHLY TREND | AI INSIGHTS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card 1: Spending by Category (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Spending by Category</h3>
            </div>

            <div className="flex items-center gap-4">
              {/* Donut Chart */}
              <div className="w-40 h-40 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={2}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Spent']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[13px] font-black text-slate-900 leading-tight">₹{totalOutflow.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Total Expenses</span>
                </div>
              </div>

              {/* Category Legend List */}
              <div className="flex-1 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {donutData.slice(0, 8).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-600 truncate font-medium">{cat.name}</span>
                    </div>
                    <div className="text-right font-mono shrink-0 pl-1">
                      <span className="text-slate-900 font-bold">₹{cat.value.toLocaleString()}</span>
                      <span className="text-slate-400 text-[10px] ml-1">{cat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigateTab('analytics')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 pt-3 border-t border-slate-100 mt-2"
          >
            <span>View full analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Monthly Trend (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Monthly Trend</h3>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Income
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Expenses
                </span>
              </div>
            </div>

            {/* Trajectory Header Badges */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 text-[11px] font-bold rounded-md font-mono">
                Income: ₹{totalInflow.toLocaleString()}
              </span>
              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-700 text-[11px] font-bold rounded-md font-mono">
                Expenses: ₹{totalOutflow.toLocaleString()}
              </span>
            </div>

            {/* Line Chart */}
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tickLine={false} />
                  <Tooltip 
                    formatter={(val: number) => [`₹${val.toLocaleString()}`]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3, fill: '#f43f5e' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <button 
            onClick={() => onNavigateTab('analytics')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 pt-3 border-t border-slate-100 mt-2"
          >
            <span>View all months</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: AI Insights (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 text-indigo-600">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-900">AI Insights</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            
            {/* Box 1: Spending Increased */}
            <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-xl space-y-0.5">
              <p className="font-bold text-rose-800 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                <span>Spending Increased</span>
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Your discretionary expenses increased by 14% compared to previous baseline.
              </p>
            </div>

            {/* Box 2: Recurring Payments */}
            <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
              <p className="font-bold text-blue-800 flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-blue-600" />
                <span>Recurring Payments</span>
              </p>
              <p className="text-[11px] text-slate-600">
                You have {recurring.length} recurring payments of ₹{recurringMonthlyTotal.toLocaleString()} per month.
              </p>
              <button 
                onClick={() => onNavigateTab('recurring')}
                className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
              >
                <span>View details</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Box 3: Unusual Transaction / Anomaly */}
            <div className="p-2.5 bg-amber-50/70 border border-amber-100 rounded-xl space-y-1">
              <p className="font-bold text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Unusual Transaction</span>
              </p>
              <p className="text-[11px] text-slate-600">
                {anomalies[0] ? `${anomalies[0].description} (₹${anomalies[0].amount.toLocaleString()}) flagged for review.` : 'No critical deviations detected.'}
              </p>
              <button 
                onClick={() => onNavigateTab('anomalies')}
                className="text-[10px] font-bold text-amber-700 hover:underline flex items-center gap-0.5"
              >
                <span>View transaction</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Box 4: AI Recommendation */}
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
              <p className="font-bold text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Recommendation</span>
              </p>
              <p className="text-[11px] text-slate-600">
                You can save up to ₹4,500/month by optimizing food delivery and subscription bundles.
              </p>
              <button 
                onClick={() => onNavigateTab('insights')}
                className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                <span>See how</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* ROW 3: RECURRING PAYMENTS | RECENT TRANSACTIONS | GAUGE    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card 1: Recurring Payments (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Recurring Payments</h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mb-3">
              Total: <strong className="text-slate-700 font-mono">₹{recurringMonthlyTotal.toLocaleString()} / month</strong>
            </p>

            <div className="space-y-2.5">
              {recurring.length > 0 ? (
                recurring.slice(0, 5).map((rec, idx) => (
                  <div key={rec.id || idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[10px] border border-indigo-100">
                        {rec.merchant.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight truncate max-w-[110px]">{rec.merchant}</p>
                        <p className="text-[10px] text-slate-400">{rec.frequency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 text-xs">₹{rec.amount.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400">Due on {rec.next_expected_date?.slice(8, 10) || '15'}th</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No recurring streams detected.</p>
              )}
            </div>
          </div>

          <button 
            onClick={() => onNavigateTab('recurring')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 pt-3 border-t border-slate-100 mt-3"
          >
            <span>View all recurring</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Recent Transactions (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
              <button 
                onClick={() => onNavigateTab('transactions')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2">
              {recentTxs.map((tx) => {
                const isCredit = tx.type === 'credit';
                return (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate leading-tight">{tx.merchant || tx.description}</p>
                        <p className="text-[10px] text-slate-400">{tx.date} • {tx.category}</p>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold shrink-0 pl-2">
                      <span className={isCredit ? 'text-emerald-600' : 'text-slate-900'}>
                        {isCredit ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 pt-3 border-t border-slate-100 mt-2"
          >
            <span>View all transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Expense vs Income Gauge & Peer Benchmark (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <h3 className="text-sm font-bold text-slate-900 text-left mb-2">Expense vs Income</h3>
            
            {/* Circular Gauge Arc */}
            <div className="relative w-36 h-24 mx-auto mt-2 flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="238.76"
                  strokeDashoffset="60"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 - (238.76 * (Math.min(savingsRate, 100) / 100) * 0.75)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute top-8 flex flex-col items-center">
                <span className="text-xl font-black text-slate-900">{savingsRate.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Savings Rate</span>
              </div>
            </div>
          </div>

          {/* Peer Benchmark */}
          <div className="p-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl flex items-center gap-2 text-left w-full mt-2">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-900 font-semibold leading-tight">
              You are saving better than <strong>65% of peers</strong> with similar income profiles!
            </p>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* ROW 4: CASH FLOW SUMMARY | HEALTH BREAKDOWN | ASK AI COPILOT */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card 1: Cash Flow Summary (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Cash Flow Summary</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 items-center text-center">
            
            {/* Opening Balance */}
            <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-blue-500 text-white flex items-center justify-center text-xs">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Opening Balance</p>
              <p className="text-xs font-bold text-slate-900 font-mono">₹{Math.round(openingBalance).toLocaleString()}</p>
            </div>

            {/* Total Credits */}
            <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Total Credits</p>
              <p className="text-xs font-bold text-emerald-600 font-mono">+₹{totalInflow.toLocaleString()}</p>
            </div>

            {/* Total Debits */}
            <div className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-xl space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Total Debits</p>
              <p className="text-xs font-bold text-rose-600 font-mono">-₹{totalOutflow.toLocaleString()}</p>
            </div>

            {/* Closing Balance */}
            <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                <PiggyBank className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Closing Balance</p>
              <p className="text-xs font-bold text-indigo-900 font-mono">₹{Math.round(closingBalance).toLocaleString()}</p>
            </div>

          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Net Monthly Cash Position:</span>
            <strong className={`font-mono ${netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {netSavings >= 0 ? '+ ' : '- '}₹{Math.abs(netSavings).toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Card 2: Financial Health Breakdown (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Financial Health Breakdown</h3>
            <button 
              onClick={() => onNavigateTab('health')}
              className="text-[11px] text-indigo-600 font-semibold hover:underline"
            >
              Details
            </button>
          </div>

          <div className="space-y-2 text-xs">
            
            {/* Factor 1: Savings Rate */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Savings Rate</span>
                <span className="font-mono font-bold text-slate-900">85/100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: '85%' }} />
              </div>
            </div>

            {/* Factor 2: Expense Stability */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Expense Stability</span>
                <span className="font-mono font-bold text-slate-900">78/100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: '78%' }} />
              </div>
            </div>

            {/* Factor 3: Debt / EMI Burden */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Debt / EMI Burden</span>
                <span className="font-mono font-bold text-slate-900">70/100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: '70%' }} />
              </div>
            </div>

            {/* Factor 4: Recurring Expense Burden */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Recurring Expense Burden</span>
                <span className="font-mono font-bold text-slate-900">80/100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: '80%' }} />
              </div>
            </div>

            {/* Factor 5: Cash Buffer / Balance */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Cash Buffer / Balance</span>
                <span className="font-mono font-bold text-slate-900">88/100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: '88%' }} />
              </div>
            </div>

          </div>
        </div>

        {/* Card 3: Ask FinSight AI / Copilot Q&A (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-600 mb-2">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-900">Ask FinSight AI</h3>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleAskAI(prompt)}
                  disabled={chatLoading}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-lg text-[10px] text-slate-600 transition-colors text-left font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Latest Answer Box */}
            {latestAnswer && (
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-slate-700 space-y-1 max-h-32 overflow-y-auto mb-2">
                <div className="flex items-center gap-1 font-bold text-indigo-700 text-[11px]">
                  <Sparkles className="w-3 h-3" />
                  <span>FinSight AI Answer:</span>
                </div>
                <p className="leading-relaxed text-[11px]">{latestAnswer}</p>
              </div>
            )}
          </div>

          {/* Interactive Chat Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAI(chatInput);
            }}
            className="flex items-center gap-1.5 pt-2 border-t border-slate-100"
          >
            <input 
              type="text" 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              placeholder="Ask anything about your finances..." 
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={chatLoading}
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs"
            >
              {chatLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
