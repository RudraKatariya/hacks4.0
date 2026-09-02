export type TransactionCategory =
  | 'Food'
  | 'Rent'
  | 'Utilities'
  | 'Salary/Income'
  | 'Subscriptions'
  | 'Shopping'
  | 'Transfers'
  | 'EMI/Loan'
  | 'Entertainment'
  | 'Healthcare'
  | 'Other';

export type TransactionType = 'credit' | 'debit';

export type InputType = 'digital_pdf' | 'scanned_pdf_image' | 'sms_text' | 'sample_data';

export interface RawExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  balance?: number;
  reference_no?: string;
}

export interface Transaction extends RawExtractedTransaction {
  id: string;
  statement_id: string;
  category: TransactionCategory;
  is_recurring?: boolean;
  is_anomaly?: boolean;
  anomaly_reason?: string;
  merchant?: string;
  confidence_score?: number;
  created_at: string;
}

export interface Statement {
  id: string;
  filename: string;
  input_type: InputType;
  uploaded_at: string;
  bank_name?: string;
  account_holder?: string;
  account_number_masked?: string;
  currency: string;
  status: 'uploaded' | 'extracted' | 'categorized' | 'analyzed' | 'error';
  error_message?: string;
  total_transactions: number;
  date_range?: {
    start: string;
    end: string;
  };
  file_size_bytes?: number;
  sms_text_preview?: string;
}

export interface RecurringPayment {
  id: string;
  statement_id: string;
  merchant: string;
  category: TransactionCategory;
  amount: number;
  frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'Bi-weekly';
  transaction_count: number;
  last_date: string;
  next_expected_date: string;
  annual_cost_estimate: number;
  status: 'Active' | 'Under Review';
}

export interface Anomaly {
  id: string;
  statement_id: string;
  transaction_id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  severity: 'High' | 'Medium' | 'Low';
  flag_type: 'statistical_outlier' | 'duplicate_charge' | 'sudden_large_withdrawal' | 'unusual_merchant';
  why_plain_language: string;
  z_score?: number;
  is_dismissed?: boolean;
}

export interface HealthScoreFactor {
  name: string;
  key: 'income_expense_ratio' | 'savings_rate' | 'recurring_burden' | 'anomaly_frequency';
  score: number; // 0-100
  weight: number; // e.g. 0.30
  benchmark: string;
  actual_value: string;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  explanation: string;
  formula: string;
}

export interface FinancialHealthScore {
  statement_id: string;
  overall_score: number; // 0-100
  tier: 'Excellent' | 'Strong' | 'Moderate' | 'At Risk' | 'Critical';
  tier_description: string;
  factors: HealthScoreFactor[];
  metrics: {
    total_income: number;
    total_expenses: number;
    net_savings: number;
    savings_rate_percent: number;
    fixed_recurring_monthly: number;
    debt_emi_burden_percent: number;
    discretionary_spend_percent: number;
    runway_days_estimate: number;
  };
  calculated_at: string;
}

export interface SpendByCategory {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  transaction_count: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
  savings_rate: number;
}

export interface TopMerchant {
  name: string;
  category: TransactionCategory;
  total_spent: number;
  transaction_count: number;
  percent_of_outflow: number;
}

export interface AnalyticsData {
  statement_id: string;
  total_inflow: number;
  total_outflow: number;
  net_cashflow: number;
  average_transaction_size: number;
  categories: SpendByCategory[];
  top_merchants: TopMerchant[];
  monthly_trends: MonthlyTrend[];
  daily_spend: { date: string; amount: number; count: number }[];
  credit_count: number;
  debit_count: number;
}

export interface FinancialSummary {
  statement_id: string;
  executive_summary: string;
  detailed_paragraphs: string[];
  actionable_suggestions: {
    title: string;
    description: string;
    potential_monthly_savings: number;
    impact: 'High' | 'Medium' | 'Low';
    category: TransactionCategory;
  }[];
  key_positives: string[];
  key_risks: string[];
  generated_at: string;
}

export interface ProcessingPipelineStatus {
  step: 'uploading' | 'extracting' | 'validating' | 'categorizing' | 'analyzing' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
  timings?: {
    extraction_ms: number;
    categorization_ms: number;
    anomaly_ms: number;
    health_ms: number;
    summary_ms: number;
    total_ms: number;
  };
}
