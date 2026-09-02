import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  AlertTriangle, 
  Repeat, 
  Check, 
  Calendar,
  Layers,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { Transaction, TransactionCategory, Statement } from '../types';

interface TransactionsViewProps {
  statement: Statement | null;
  transactions: Transaction[];
  onUpdateCategory: (transactionId: string, newCategory: TransactionCategory) => Promise<void>;
  isUpdatingId: string | null;
}

const CATEGORIES: TransactionCategory[] = [
  'Food',
  'Rent',
  'Utilities',
  'Salary/Income',
  'Subscriptions',
  'Shopping',
  'Transfers',
  'EMI/Loan',
  'Entertainment',
  'Healthcare',
  'Other',
];

const CATEGORY_COLORS: Record<TransactionCategory, { bg: string; text: string; border: string }> = {
  'Food': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Rent': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Utilities': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Salary/Income': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Subscriptions': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  'Shopping': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Transfers': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'EMI/Loan': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Entertainment': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Healthcare': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Other': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  statement,
  transactions,
  onUpdateCategory,
  isUpdatingId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'credit' | 'debit'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.merchant && tx.merchant.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.amount.toString().includes(searchQuery);

      const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
      const matchesType = selectedType === 'all' || tx.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    }).sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return sortOrder === 'desc' ? diff : -diff;
      } else {
        const diff = b.amount - a.amount;
        return sortOrder === 'desc' ? diff : -diff;
      }
    });
  }, [transactions, searchQuery, selectedCategory, selectedType, sortField, sortOrder]);

  const totalInflow = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalOutflow = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  const handleExportCsv = () => {
    const headers = ['Date', 'Merchant / Description', 'Type', 'Amount', 'Category', 'Balance', 'Is Recurring', 'Is Anomaly'];
    const rows = filteredTransactions.map(tx => [
      `"${tx.date}"`,
      `"${(tx.merchant || tx.description).replace(/"/g, '""')}"`,
      `"${tx.type}"`,
      tx.amount,
      `"${tx.category}"`,
      tx.balance || '',
      tx.is_recurring ? 'Yes' : 'No',
      tx.is_anomaly ? 'Yes' : 'No',
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Transactions_${statement?.id || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Structured Transactions Ledger</h2>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
              Live Editable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {statement?.bank_name || 'Bank Account'} • {statement?.account_holder || 'Extracted Statement'} • {transactions.length} verified records
          </p>
        </div>

        {/* Quick summary metrics & CSV Export */}
        <div className="flex items-center flex-wrap gap-3 font-mono text-xs">
          <div className="px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <span className="text-emerald-700 block text-[10px]">TOTAL CREDITS</span>
            <span className="text-emerald-900 font-bold">₹{totalInflow.toLocaleString()}</span>
          </div>
          <div className="px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl">
            <span className="text-rose-700 block text-[10px]">TOTAL DEBITS</span>
            <span className="text-rose-900 font-bold">₹{totalOutflow.toLocaleString()}</span>
          </div>
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input_search_tx"
            type="text"
            placeholder="Search merchant, description, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('credit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedType === 'credit' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Credits (+)
            </button>
            <button
              onClick={() => setSelectedType('debit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedType === 'debit' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Debits (-)
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort Field */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-xs flex items-center gap-1 font-semibold"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{sortOrder.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Merchant / Description</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Category (Live Reassign)</th>
                <th className="py-3.5 px-4 text-right">Running Balance</th>
                <th className="py-3.5 px-4 text-center">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions match your search query.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isCredit = tx.type === 'credit';
                  const catStyle = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS['Other'];
                  const isUpdating = isUpdatingId === tx.id;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Description / Merchant */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">
                          {tx.merchant || tx.description}
                        </div>
                        {tx.merchant && tx.merchant !== tx.description && (
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {tx.description}
                          </div>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isCredit ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isCredit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isCredit ? 'text-emerald-600' : 'text-slate-900'}>
                          {isCredit ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Live Category Selector */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={tx.category}
                            disabled={isUpdating}
                            onChange={(e) => onUpdateCategory(tx.id, e.target.value as TransactionCategory)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer focus:ring-1 focus:ring-indigo-500 ${catStyle.bg} ${catStyle.text} ${catStyle.border} ${isUpdating ? 'opacity-50' : ''}`}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c} className="bg-white text-slate-800">
                                {c}
                              </option>
                            ))}
                          </select>
                          {isUpdating && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <Sparkles className="w-3 h-3 text-indigo-500 animate-spin" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Running Balance */}
                      <td className="py-3 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                        {tx.balance !== undefined ? `₹${tx.balance.toLocaleString()}` : '—'}
                      </td>

                      {/* Anomaly & Recurring Flags */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {tx.is_recurring && (
                            <span 
                              title="Identified Recurring Stream" 
                              className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              <Repeat className="w-3 h-3" />
                            </span>
                          )}
                          {tx.is_anomaly && (
                            <span 
                              title={tx.anomaly_reason || 'Statistical spending anomaly'} 
                              className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                            >
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          )}
                          {!tx.is_recurring && !tx.is_anomaly && (
                            <span className="text-slate-300">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
