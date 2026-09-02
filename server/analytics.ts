import { Transaction, Anomaly, RecurringPayment, FinancialHealthScore, AnalyticsData, SpendByCategory, TopMerchant, MonthlyTrend } from '../src/types';
import { generateAnomalyExplanationsAI } from './ai';

const CATEGORY_COLORS: Record<string, string> = {
  'Food': '#F97316', // Orange
  'Rent': '#6366F1', // Indigo
  'Utilities': '#06B6D4', // Cyan
  'Salary/Income': '#10B981', // Emerald
  'Subscriptions': '#EC4899', // Pink
  'Shopping': '#8B5CF6', // Purple
  'Transfers': '#3B82F6', // Blue
  'EMI/Loan': '#EF4444', // Red
  'Entertainment': '#F59E0B', // Amber
  'Healthcare': '#14B8A6', // Teal
  'Other': '#64748B', // Slate
};

/**
 * 1. Statistical Anomaly Detection Engine
 */
export async function detectAnomalies(
  statement_id: string,
  transactions: Transaction[]
): Promise<Anomaly[]> {
  const debits = transactions.filter((t) => t.type === 'debit');
  if (debits.length < 3) return [];

  const amounts = debits.map((t) => t.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / amounts.length;
  const stddev = Math.sqrt(variance) || 1;
  const threshold = mean + 2 * stddev;

  const anomalies: Anomaly[] = [];
  const candidateListForAI: { id: string; description: string; amount: number; flag_type: string; z_score?: number; historical_avg: number }[] = [];

  // Check 1: Statistical Outliers (> mean + 2*stddev)
  for (const t of debits) {
    if (t.amount > threshold && t.amount > 3000) {
      const zScore = Number(((t.amount - mean) / stddev).toFixed(2));
      const anomalyId = `anom_${t.id}`;
      anomalies.push({
        id: anomalyId,
        statement_id,
        transaction_id: t.id,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        severity: t.amount > mean + 3 * stddev ? 'High' : 'Medium',
        flag_type: 'statistical_outlier',
        why_plain_language: `Amount of ₹${t.amount.toLocaleString()} is significantly higher than user baseline average (₹${Math.round(mean).toLocaleString()}).`,
        z_score: zScore,
      });
      candidateListForAI.push({
        id: anomalyId,
        description: t.description,
        amount: t.amount,
        flag_type: 'statistical_outlier',
        z_score: zScore,
        historical_avg: mean,
      });
    }
  }

  // Check 2: Duplicate Charges in short window (<= 48 hours, exact amount & same merchant/desc)
  const sortedByDate = [...debits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  for (let i = 0; i < sortedByDate.length; i++) {
    for (let j = i + 1; j < sortedByDate.length; j++) {
      const t1 = sortedByDate[i];
      const t2 = sortedByDate[j];
      const timeDiffDays = Math.abs(new Date(t2.date).getTime() - new Date(t1.date).getTime()) / (1000 * 60 * 60 * 24);

      if (timeDiffDays <= 2 && t1.amount === t2.amount && t1.amount >= 200) {
        const norm1 = t1.description.toLowerCase().replace(/[^a-z0-9]/g, '');
        const norm2 = t2.description.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1)) {
          const anomalyId = `dup_${t2.id}`;
          if (!anomalies.some((a) => a.transaction_id === t2.id)) {
            anomalies.push({
              id: anomalyId,
              statement_id,
              transaction_id: t2.id,
              date: t2.date,
              description: t2.description,
              amount: t2.amount,
              type: t2.type,
              category: t2.category,
              severity: 'Medium',
              flag_type: 'duplicate_charge',
              why_plain_language: `Identical charge of ₹${t2.amount.toLocaleString()} detected within ${Math.round(timeDiffDays * 24)} hours of previous transaction.`,
            });
            candidateListForAI.push({
              id: anomalyId,
              description: t2.description,
              amount: t2.amount,
              flag_type: 'duplicate_charge',
              historical_avg: mean,
            });
          }
        }
      }
    }
  }

  // Generate enriched AI plain-language explanations
  if (candidateListForAI.length > 0) {
    try {
      const aiExplanations = await generateAnomalyExplanationsAI(candidateListForAI);
      for (const anom of anomalies) {
        if (aiExplanations[anom.id]) {
          anom.why_plain_language = aiExplanations[anom.id];
        }
      }
    } catch (e) {
      // Fallback already built-in
    }
  }

  return anomalies;
}

/**
 * 2. Recurring Payments Pattern Detector
 */
export function detectRecurringPayments(
  statement_id: string,
  transactions: Transaction[]
): RecurringPayment[] {
  const debits = transactions.filter((t) => t.type === 'debit');
  const merchantGroups: Record<string, Transaction[]> = {};

  for (const t of debits) {
    const key = (t.merchant || t.description).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14);
    if (!merchantGroups[key]) merchantGroups[key] = [];
    merchantGroups[key].push(t);
  }

  const recurringList: RecurringPayment[] = [];

  for (const [key, group] of Object.entries(merchantGroups)) {
    // If explicit subscription category or >= 2 recurring transactions
    const isExplicitSub = group.some(t => t.category === 'Subscriptions' || t.category === 'Rent' || t.category === 'EMI/Loan' || t.category === 'Utilities');
    
    if (group.length >= 2 || isExplicitSub) {
      // Sort chronologically
      group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const baseTx = group[group.length - 1];
      const avgAmount = group.reduce((sum, t) => sum + t.amount, 0) / group.length;

      // Determine cadence
      let freq: RecurringPayment['frequency'] = 'Monthly';
      if (group.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < group.length; i++) {
          const d1 = new Date(group[i - 1].date).getTime();
          const d2 = new Date(group[i].date).getTime();
          intervals.push((d2 - d1) / (1000 * 60 * 60 * 24));
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        if (avgInterval <= 10) freq = 'Weekly';
        else if (avgInterval <= 20) freq = 'Bi-weekly';
        else if (avgInterval <= 45) freq = 'Monthly';
        else if (avgInterval <= 120) freq = 'Quarterly';
        else freq = 'Annual';
      }

      // Estimate next expected date
      const lastDate = new Date(baseTx.date);
      const nextDate = new Date(lastDate);
      if (freq === 'Weekly') nextDate.setDate(lastDate.getDate() + 7);
      else if (freq === 'Bi-weekly') nextDate.setDate(lastDate.getDate() + 14);
      else if (freq === 'Monthly') nextDate.setMonth(lastDate.getMonth() + 1);
      else if (freq === 'Quarterly') nextDate.setMonth(lastDate.getMonth() + 3);
      else nextDate.setFullYear(lastDate.getFullYear() + 1);

      // Annual cost multiplier
      const multiplier = freq === 'Weekly' ? 52 : freq === 'Bi-weekly' ? 26 : freq === 'Monthly' ? 12 : freq === 'Quarterly' ? 4 : 1;

      recurringList.push({
        id: `rec_${key}_${Math.round(avgAmount)}`,
        statement_id,
        merchant: baseTx.merchant || baseTx.description,
        category: baseTx.category,
        amount: Math.round(avgAmount),
        frequency: freq,
        transaction_count: group.length,
        last_date: baseTx.date,
        next_expected_date: nextDate.toISOString().split('T')[0],
        annual_cost_estimate: Math.round(avgAmount * multiplier),
        status: 'Active',
      });
    }
  }

  return recurringList.sort((a, b) => b.amount - a.amount);
}

/**
 * 3. Financial Health Score Algorithm (0-100)
 */
export function calculateFinancialHealthScore(
  statement_id: string,
  transactions: Transaction[],
  recurring: RecurringPayment[],
  anomalies: Anomaly[]
): FinancialHealthScore {
  const credits = transactions.filter((t) => t.type === 'credit');
  const debits = transactions.filter((t) => t.type === 'debit');

  const totalIncome = credits.reduce((sum, t) => sum + t.amount, 0) || 1;
  const totalExpenses = debits.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = Math.max(0, (netSavings / totalIncome) * 100);

  // Factor 1: Income-to-Expense Ratio (Weight: 30%)
  // Benchmark: >= 1.30 (30% surplus) gets 100 pts.
  const ieRatio = totalIncome / Math.max(1, totalExpenses);
  let ieScore = 0;
  if (ieRatio >= 1.35) ieScore = 100;
  else if (ieRatio >= 1.20) ieScore = 85;
  else if (ieRatio >= 1.05) ieScore = 70;
  else if (ieRatio >= 0.95) ieScore = 50;
  else ieScore = Math.max(10, Math.round(ieRatio * 40));

  // Factor 2: Savings Rate (Weight: 25%)
  // Benchmark: >= 25% gets 100 pts.
  let srScore = 0;
  if (savingsRate >= 30) srScore = 100;
  else if (savingsRate >= 20) srScore = 85;
  else if (savingsRate >= 10) srScore = 70;
  else if (savingsRate >= 5) srScore = 50;
  else srScore = Math.max(5, Math.round(savingsRate * 4));

  // Factor 3: Recurring Obligation Burden (Weight: 25%)
  // Benchmark: Fixed commitments / Monthly Income < 35% is ideal (100 pts).
  const monthlyRecurring = recurring.reduce((sum, r) => {
    const m = r.frequency === 'Weekly' ? 4.33 : r.frequency === 'Bi-weekly' ? 2.16 : r.frequency === 'Monthly' ? 1 : 0.33;
    return sum + (r.amount * m);
  }, 0);
  const recurringBurdenPercent = (monthlyRecurring / totalIncome) * 100;
  let rbScore = 100;
  if (recurringBurdenPercent <= 25) rbScore = 100;
  else if (recurringBurdenPercent <= 35) rbScore = 85;
  else if (recurringBurdenPercent <= 50) rbScore = 65;
  else if (recurringBurdenPercent <= 65) rbScore = 40;
  else rbScore = Math.max(10, 100 - Math.round(recurringBurdenPercent));

  // Factor 4: Anomaly & Risk Frequency (Weight: 20%)
  // Benchmark: 0 anomalies = 100 pts. 1 anomaly = 85 pts. 2 = 70 pts. >=4 = 30 pts.
  let anomScore = 100;
  if (anomalies.length === 0) anomScore = 100;
  else if (anomalies.length === 1) anomScore = 85;
  else if (anomalies.length === 2) anomScore = 70;
  else if (anomalies.length === 3) anomScore = 55;
  else anomScore = Math.max(15, 100 - (anomalies.length * 18));

  // Composite Weighted Score
  const overallScore = Math.round(
    ieScore * 0.30 +
    srScore * 0.25 +
    rbScore * 0.25 +
    anomScore * 0.20
  );

  let tier: FinancialHealthScore['tier'] = 'Moderate';
  let tierDescription = 'Balanced cashflow with moderate optimization headroom.';

  if (overallScore >= 85) {
    tier = 'Excellent';
    tierDescription = 'Robust cash buffer, exceptional savings rate, and low debt burden.';
  } else if (overallScore >= 70) {
    tier = 'Strong';
    tierDescription = 'Healthy surplus and controlled recurring obligations.';
  } else if (overallScore >= 55) {
    tier = 'Moderate';
    tierDescription = 'Adequate cashflow but high discretionary or recurring drag.';
  } else if (overallScore >= 40) {
    tier = 'At Risk';
    tierDescription = 'Outflows closely track inflows; limited emergency cushion.';
  } else {
    tier = 'Critical';
    tierDescription = 'Expenditures exceed inflow; high debt/obligation strain.';
  }

  // Debt & Discretionary calculation
  const emiTotal = debits.filter(t => t.category === 'EMI/Loan').reduce((s, t) => s + t.amount, 0);
  const discretionaryTotal = debits.filter(t => ['Food', 'Shopping', 'Entertainment'].includes(t.category)).reduce((s, t) => s + t.amount, 0);

  return {
    statement_id,
    overall_score: Math.min(100, Math.max(0, overallScore)),
    tier,
    tier_description: tierDescription,
    factors: [
      {
        name: 'Income-to-Expense Ratio',
        key: 'income_expense_ratio',
        score: ieScore,
        weight: 0.30,
        benchmark: '≥ 1.30x (30% Operating Surplus)',
        actual_value: `${ieRatio.toFixed(2)}x Inflow Coverage`,
        status: ieScore >= 85 ? 'Excellent' : ieScore >= 70 ? 'Good' : ieScore >= 50 ? 'Fair' : 'Poor',
        explanation: `Measures total incoming liquidity against total expenditures. Current coverage is ${ieRatio.toFixed(2)}x.`,
        formula: 'Total Inflow ÷ Total Outflow',
      },
      {
        name: 'Net Savings Rate',
        key: 'savings_rate',
        score: srScore,
        weight: 0.25,
        benchmark: '≥ 25.0% of Monthly Inflow',
        actual_value: `${savingsRate.toFixed(1)}% Retained`,
        status: srScore >= 85 ? 'Excellent' : srScore >= 70 ? 'Good' : srScore >= 50 ? 'Fair' : 'Poor',
        explanation: `Percentage of income preserved after all operational and discretionary expenses.`,
        formula: '(Total Inflow - Total Outflow) ÷ Total Inflow × 100',
      },
      {
        name: 'Recurring Obligation Burden',
        key: 'recurring_burden',
        score: rbScore,
        weight: 0.25,
        benchmark: '≤ 35.0% of Total Inflow',
        actual_value: `${recurringBurdenPercent.toFixed(1)}% of Income (₹${Math.round(monthlyRecurring).toLocaleString()}/mo)`,
        status: rbScore >= 85 ? 'Excellent' : rbScore >= 70 ? 'Good' : rbScore >= 50 ? 'Fair' : 'Poor',
        explanation: `Measures fixed recurring commitments (rent, utilities, loans, subscriptions) against net income.`,
        formula: 'Monthly Fixed Commitments ÷ Total Inflow × 100',
      },
      {
        name: 'Anomaly & Volatility Shield',
        key: 'anomaly_frequency',
        score: anomScore,
        weight: 0.20,
        benchmark: '0 Statistical Outliers / Duplicate Charges',
        actual_value: `${anomalies.length} Flagged Pattern(s)`,
        status: anomScore >= 85 ? 'Excellent' : anomScore >= 70 ? 'Good' : anomScore >= 50 ? 'Fair' : 'Poor',
        explanation: `Evaluates irregular spending spikes (>2σ) and potential duplicate vendor billings.`,
        formula: '100 - (Flagged Spikes × Severity Weight)',
      },
    ],
    metrics: {
      total_income: Math.round(totalIncome),
      total_expenses: Math.round(totalExpenses),
      net_savings: Math.round(netSavings),
      savings_rate_percent: Number(savingsRate.toFixed(1)),
      fixed_recurring_monthly: Math.round(monthlyRecurring),
      debt_emi_burden_percent: Number(((emiTotal / totalIncome) * 100).toFixed(1)),
      discretionary_spend_percent: Number(((discretionaryTotal / Math.max(1, totalExpenses)) * 100).toFixed(1)),
      runway_days_estimate: totalExpenses > 0 ? Math.round((netSavings / (totalExpenses / 30))) : 90,
    },
    calculated_at: new Date().toISOString(),
  };
}

/**
 * 4. Monthly Spending Analytics Aggregator
 */
export function generateMonthlySpendingAnalytics(
  statement_id: string,
  transactions: Transaction[]
): AnalyticsData {
  const credits = transactions.filter((t) => t.type === 'credit');
  const debits = transactions.filter((t) => t.type === 'debit');

  const totalInflow = credits.reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = debits.reduce((sum, t) => sum + t.amount, 0);
  const netCashflow = totalInflow - totalOutflow;
  const avgTx = debits.length > 0 ? totalOutflow / debits.length : 0;

  // Category Breakdown
  const catMap: Record<string, { amount: number; count: number }> = {};
  for (const t of debits) {
    if (!catMap[t.category]) catMap[t.category] = { amount: 0, count: 0 };
    catMap[t.category].amount += t.amount;
    catMap[t.category].count += 1;
  }

  const categories: SpendByCategory[] = Object.entries(catMap)
    .map(([cat, val]) => ({
      category: cat as any,
      amount: Math.round(val.amount),
      percentage: totalOutflow > 0 ? Number(((val.amount / totalOutflow) * 100).toFixed(1)) : 0,
      transaction_count: val.count,
      color: CATEGORY_COLORS[cat] || '#64748B',
    }))
    .sort((a, b) => b.amount - a.amount);

  // Top Merchants / Counterparties
  const merchantMap: Record<string, { amount: number; count: number; category: any }> = {};
  for (const t of debits) {
    const mName = t.merchant || t.description.slice(0, 20);
    if (!merchantMap[mName]) merchantMap[mName] = { amount: 0, count: 0, category: t.category };
    merchantMap[mName].amount += t.amount;
    merchantMap[mName].count += 1;
  }

  const top_merchants: TopMerchant[] = Object.entries(merchantMap)
    .map(([mName, val]) => ({
      name: mName,
      category: val.category,
      total_spent: Math.round(val.amount),
      transaction_count: val.count,
      percent_of_outflow: totalOutflow > 0 ? Number(((val.amount / totalOutflow) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 5);

  // Daily spend timeline
  const dailyMap: Record<string, { amount: number; count: number }> = {};
  for (const t of debits) {
    if (!dailyMap[t.date]) dailyMap[t.date] = { amount: 0, count: 0 };
    dailyMap[t.date].amount += t.amount;
    dailyMap[t.date].count += 1;
  }

  const daily_spend = Object.entries(dailyMap)
    .map(([date, val]) => ({
      date,
      amount: Math.round(val.amount),
      count: val.count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Monthly trends (group by YYYY-MM)
  const monthMap: Record<string, { inflow: number; outflow: number }> = {};
  for (const t of transactions) {
    const monthKey = t.date.slice(0, 7);
    if (!monthMap[monthKey]) monthMap[monthKey] = { inflow: 0, outflow: 0 };
    if (t.type === 'credit') monthMap[monthKey].inflow += t.amount;
    else monthMap[monthKey].outflow += t.amount;
  }

  const monthly_trends: MonthlyTrend[] = Object.entries(monthMap)
    .map(([month, val]) => {
      const net = val.inflow - val.outflow;
      const sr = val.inflow > 0 ? (net / val.inflow) * 100 : 0;
      return {
        month,
        inflow: Math.round(val.inflow),
        outflow: Math.round(val.outflow),
        net: Math.round(net),
        savings_rate: Number(sr.toFixed(1)),
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    statement_id,
    total_inflow: Math.round(totalInflow),
    total_outflow: Math.round(totalOutflow),
    net_cashflow: Math.round(netCashflow),
    average_transaction_size: Math.round(avgTx),
    categories,
    top_merchants,
    monthly_trends,
    daily_spend,
    credit_count: credits.length,
    debit_count: debits.length,
  };
}
