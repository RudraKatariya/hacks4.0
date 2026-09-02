import { GoogleGenAI, Type } from '@google/genai';
import { RawExtractedTransaction, TransactionCategory, FinancialSummary, Anomaly } from '../src/types';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || 'mock-dev-key';
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export const CANONICAL_CATEGORIES: TransactionCategory[] = [
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

/**
 * AI Transaction Extraction from Statement Text with Strict JSON Schema and 1-Attempt Retry Fallback
 */
export async function extractTransactionsFromTextAI(
  statementText: string,
  retryCount: number = 0
): Promise<{ transactions: RawExtractedTransaction[]; bank_name?: string; currency?: string }> {
  const ai = getAiClient();

  const prompt = `You are an expert financial data extraction system for bank statements and SMS transaction records.
Analyze the following bank statement / SMS text and extract all transactions with high precision.

CRITICAL EXTRACTION RULES:
1. Extract every transaction row with exact date (YYYY-MM-DD format), clean readable description, numeric amount (positive float), transaction type ("credit" or "debit"), and running balance if available.
2. If the date in the statement is DD/MM/YYYY or DD-Mon-YYYY, convert to standard ISO format "YYYY-MM-DD".
3. Clean transaction descriptions: strip raw bank reference noise while preserving merchant name and UPI handles (e.g. "UPI/Swiggy/23490123/Pay" -> "Swiggy UPI", "POS 409230 NETFLIX" -> "Netflix").
4. Ensure "amount" is strictly positive numeric value.
5. Identify the bank name (e.g. HDFC Bank, SBI, ICICI, Axis, Chase, etc.) and currency code (e.g. INR, USD, EUR).

Statement text:
"""
${statementText.slice(0, 45000)}
"""`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a production-grade FinTech OCR & statement parser. Output strictly structured valid JSON matching the specified schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bank_name: { type: Type.STRING, description: 'Identified bank name' },
            currency: { type: Type.STRING, description: 'Currency code, default INR or USD' },
            transactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING, description: 'Date in YYYY-MM-DD' },
                  description: { type: Type.STRING, description: 'Normalized transaction description' },
                  amount: { type: Type.NUMBER, description: 'Transaction amount (strictly positive number)' },
                  type: { type: Type.STRING, description: 'credit or debit' },
                  balance: { type: Type.NUMBER, description: 'Running balance after transaction if present' },
                  reference_no: { type: Type.STRING, description: 'UTR or reference number if present' },
                },
                required: ['date', 'description', 'amount', 'type'],
              },
            },
          },
          required: ['transactions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!Array.isArray(parsed.transactions) || parsed.transactions.length === 0) {
      if (retryCount < 1) {
        return await extractTransactionsFromTextAI(
          `STRICT RETRY: Output at least all recognizable transaction entries without skipping. Text:\n${statementText}`,
          retryCount + 1
        );
      }
    }

    // Format & validate each transaction row
    const cleanTxs: RawExtractedTransaction[] = (parsed.transactions || []).map((t: any) => ({
      date: t.date || new Date().toISOString().split('T')[0],
      description: String(t.description || 'Transaction').trim(),
      amount: Math.abs(Number(t.amount) || 0),
      type: t.type === 'credit' ? 'credit' : 'debit',
      balance: t.balance !== undefined && !isNaN(Number(t.balance)) ? Number(t.balance) : undefined,
      reference_no: t.reference_no ? String(t.reference_no) : undefined,
    }));

    return {
      transactions: cleanTxs,
      bank_name: parsed.bank_name || 'Bank Account',
      currency: parsed.currency || 'INR',
    };
  } catch (error: any) {
    if (retryCount < 1) {
      return await extractTransactionsFromTextAI(statementText, retryCount + 1);
    }
    throw new Error(`AI Extraction failed after retry: ${error?.message || 'Unknown parsing error'}`);
  }
}

/**
 * Multimodal AI Extraction for Scanned PDFs / Bank Statement Images
 */
export async function extractTransactionsFromImageAI(
  imageBuffer: Buffer,
  mimeType: string = 'image/jpeg'
): Promise<{ transactions: RawExtractedTransaction[]; bank_name?: string; currency?: string }> {
  const ai = getAiClient();
  const base64Data = imageBuffer.toString('base64');

  const prompt = `Extract all tabular bank statement transactions from this scanned/camera-captured document.
Extract every row with date (YYYY-MM-DD), merchant/description, amount (number), type ('credit' or 'debit'), and balance.
Return high accuracy structured JSON matching schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bank_name: { type: Type.STRING },
          currency: { type: Type.STRING },
          transactions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                type: { type: Type.STRING },
                balance: { type: Type.NUMBER },
                reference_no: { type: Type.STRING },
              },
              required: ['date', 'description', 'amount', 'type'],
            },
          },
        },
        required: ['transactions'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  const cleanTxs: RawExtractedTransaction[] = (parsed.transactions || []).map((t: any) => ({
    date: t.date || new Date().toISOString().split('T')[0],
    description: String(t.description || 'Transaction').trim(),
    amount: Math.abs(Number(t.amount) || 0),
    type: t.type === 'credit' ? 'credit' : 'debit',
    balance: t.balance !== undefined && !isNaN(Number(t.balance)) ? Number(t.balance) : undefined,
    reference_no: t.reference_no,
  }));

  return {
    transactions: cleanTxs,
    bank_name: parsed.bank_name || 'Bank Account',
    currency: parsed.currency || 'INR',
  };
}

/**
 * Batch AI Categorization
 * Categorizes all transactions in a single LLM call for optimal speed and cost efficiency.
 */
export async function batchCategorizeTransactionsAI(
  transactions: { id: string; description: string; amount: number; type: string }[]
): Promise<Record<string, { category: TransactionCategory; merchant: string; confidence: number }>> {
  if (transactions.length === 0) return {};

  const ai = getAiClient();
  const txSummary = transactions.map((t) => ({
    id: t.id,
    desc: t.description,
    amt: t.amount,
    type: t.type,
  }));

  const prompt = `You are an automated transaction categorization model for personal finance.
Given the following list of transactions, categorize each into ONE of the canonical categories:
- Food (Restaurants, Swiggy, Zomato, Groceries, Blinkit, Zepto, Supermarket)
- Rent (Landlord, Society maintenance, House rent)
- Utilities (Electricity, Water, Gas, Broadband, Mobile recharge, Tata Power, BESCOM)
- Salary/Income (Monthly payroll, Employer credit, Freelance payout, Dividend)
- Subscriptions (Netflix, Spotify, AWS, GitHub, Prime, YouTube, Gym membership)
- Shopping (Amazon, Flipkart, Zara, Myntra, electronics, apparel)
- Transfers (P2P UPI, IMPS to friend/family, self transfer)
- EMI/Loan (Home loan, Car loan, Personal loan, Credit card bill payment, HDFC Loan)
- Entertainment (Movies, BookMyShow, Steam, Gaming, Concerts)
- Healthcare (Pharmacy, Apollo, Hospital, Diagnostic lab, Doctor fee, Health insurance)
- Other (Unrecognized or miscellaneous)

Extract a clean standardized merchant brand name for each (e.g. "Swiggy", "Amazon", "BESCOM").
Assign a confidence score between 0.70 and 0.99.

Transactions:
${JSON.stringify(txSummary)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: {
                type: Type.STRING,
                description: 'One of the canonical 11 categories',
              },
              merchant: { type: Type.STRING, description: 'Normalized merchant brand' },
              confidence: { type: Type.NUMBER, description: 'Confidence between 0 and 1' },
            },
            required: ['id', 'category', 'merchant'],
          },
        },
      },
    });

    const parsedArray = JSON.parse(response.text || '[]');
    const result: Record<string, { category: TransactionCategory; merchant: string; confidence: number }> = {};

    for (const item of parsedArray) {
      let matchedCategory: TransactionCategory = 'Other';
      if (CANONICAL_CATEGORIES.includes(item.category as TransactionCategory)) {
        matchedCategory = item.category as TransactionCategory;
      }
      result[item.id] = {
        category: matchedCategory,
        merchant: item.merchant || 'Merchant',
        confidence: item.confidence || 0.95,
      };
    }

    return result;
  } catch (error) {
    // Fallback heuristic categorizer
    return fallbackHeuristicCategorizer(transactions);
  }
}

/**
 * Fallback Heuristic Rule Categorizer
 */
export function fallbackHeuristicCategorizer(
  transactions: { id: string; description: string; amount: number; type: string }[]
): Record<string, { category: TransactionCategory; merchant: string; confidence: number }> {
  const result: Record<string, { category: TransactionCategory; merchant: string; confidence: number }> = {};

  for (const t of transactions) {
    const desc = t.description.toLowerCase();
    let category: TransactionCategory = 'Other';
    let merchant = t.description.slice(0, 20);

    if (t.type === 'credit' && (desc.includes('salary') || desc.includes('payroll') || desc.includes('corp') || desc.includes('wage'))) {
      category = 'Salary/Income';
      merchant = 'Salary / Employer';
    } else if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('blinkit') || desc.includes('zepto') || desc.includes('mcdonald') || desc.includes('starbucks') || desc.includes('restaurant') || desc.includes('cafe')) {
      category = 'Food';
      merchant = desc.includes('swiggy') ? 'Swiggy' : desc.includes('zomato') ? 'Zomato' : desc.includes('blinkit') ? 'Blinkit' : 'Dining & Food';
    } else if (desc.includes('rent') || desc.includes('landlord') || desc.includes('society') || desc.includes('housing')) {
      category = 'Rent';
      merchant = 'House Rent / Society';
    } else if (desc.includes('bescom') || desc.includes('electricity') || desc.includes('jio') || desc.includes('airtel') || desc.includes('broadband') || desc.includes('gas') || desc.includes('water') || desc.includes('utility')) {
      category = 'Utilities';
      merchant = desc.includes('bescom') ? 'BESCOM Power' : desc.includes('airtel') ? 'Airtel' : desc.includes('jio') ? 'Jio Telecom' : 'Utility Provider';
    } else if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('prime') || desc.includes('hotstar') || desc.includes('youtube') || desc.includes('aws') || desc.includes('github') || desc.includes('gym')) {
      category = 'Subscriptions';
      merchant = desc.includes('netflix') ? 'Netflix' : desc.includes('spotify') ? 'Spotify' : desc.includes('aws') ? 'Amazon AWS' : 'Subscription Service';
    } else if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('myntra') || desc.includes('zara') || desc.includes('retail') || desc.includes('store')) {
      category = 'Shopping';
      merchant = desc.includes('amazon') ? 'Amazon' : desc.includes('flipkart') ? 'Flipkart' : desc.includes('myntra') ? 'Myntra' : 'Shopping Retail';
    } else if (desc.includes('emi') || desc.includes('loan') || desc.includes('hdfc loan') || desc.includes('sbi card') || desc.includes('credit card bill')) {
      category = 'EMI/Loan';
      merchant = 'Bank Loan / EMI';
    } else if (desc.includes('apollo') || desc.includes('pharmacy') || desc.includes('hospital') || desc.includes('medplus') || desc.includes('diagnostic') || desc.includes('clinic')) {
      category = 'Healthcare';
      merchant = desc.includes('apollo') ? 'Apollo Healthcare' : 'Medical & Pharmacy';
    } else if (desc.includes('bookmyshow') || desc.includes('pvr') || desc.includes('inox') || desc.includes('movie') || desc.includes('cinema') || desc.includes('steam')) {
      category = 'Entertainment';
      merchant = 'Entertainment';
    } else if (desc.includes('upi') || desc.includes('transfer') || desc.includes('neft') || desc.includes('imps') || desc.includes('p2p')) {
      category = 'Transfers';
      merchant = 'UPI / P2P Transfer';
    }

    result[t.id] = {
      category,
      merchant,
      confidence: 0.88,
    };
  }

  return result;
}

/**
 * Generate Plain-Language "Why" Explanations for Detected Anomalies
 */
export async function generateAnomalyExplanationsAI(
  anomalies: { id: string; description: string; amount: number; flag_type: string; z_score?: number; historical_avg: number }[]
): Promise<Record<string, string>> {
  if (anomalies.length === 0) return {};

  const ai = getAiClient();
  const prompt = `You are a bank fraud and anomaly analyst. For each flagged transaction pattern below, provide a single, clear, objective, plain-language explanation of WHY this was flagged for user review.

CRITICAL TONE DIRECTIVE:
- Label everything as "flagged for review" or "unusual pattern"
- NEVER say "confirmed fraud" or "stolen card"
- Be concise (1 single sentence per transaction)

Flagged patterns:
${JSON.stringify(anomalies)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              why_plain_language: { type: Type.STRING, description: 'Single-sentence objective reason for review' },
            },
            required: ['id', 'why_plain_language'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    const map: Record<string, string> = {};
    for (const item of parsed) {
      map[item.id] = item.why_plain_language;
    }
    return map;
  } catch (error) {
    const map: Record<string, string> = {};
    for (const a of anomalies) {
      if (a.flag_type === 'duplicate_charge') {
        map[a.id] = `Duplicate charge pattern detected: identical amount of ₹${a.amount} charged within a short 24-hour time window.`;
      } else if (a.flag_type === 'statistical_outlier') {
        map[a.id] = `Amount of ₹${a.amount} is significantly higher than your typical average spend of ₹${Math.round(a.historical_avg)}.`;
      } else if (a.flag_type === 'sudden_large_withdrawal') {
        map[a.id] = `Unusually large debit of ₹${a.amount} deviates from customary account activity.`;
      } else {
        map[a.id] = `Unusual merchant transaction pattern flagged for routine verification.`;
      }
    }
    return map;
  }
}

/**
 * AI Financial Health Summary and Actionable Savings Recommendations
 */
export async function generateFinancialSummaryAI(context: {
  total_income: number;
  total_expenses: number;
  net_savings: number;
  savings_rate: number;
  health_score: number;
  top_categories: { category: string; amount: number; percentage: number }[];
  recurring_total: number;
  anomaly_count: number;
  bank_name?: string;
}): Promise<FinancialSummary> {
  const ai = getAiClient();

  const prompt = `You are a certified senior wealth advisor and financial health intelligence system.
Analyze the following user financial summary from bank statement intelligence:

Financial Profile:
- Total Inflow (Income): ₹${context.total_income}
- Total Outflow (Expenses): ₹${context.total_expenses}
- Net Savings: ₹${context.net_savings}
- Savings Rate: ${context.savings_rate.toFixed(1)}%
- Computed Financial Health Score: ${context.health_score}/100
- Monthly Recurring Commitments: ₹${context.recurring_total}
- Anomalies Flagged: ${context.anomaly_count}
- Top Expense Categories: ${JSON.stringify(context.top_categories)}

Generate:
1. "executive_summary": A crisp 2-3 sentence executive takeaway summarizing their cash flow discipline, spending velocity, and runway.
2. "detailed_paragraphs": Array of 2-3 structured analytical paragraphs discussing:
   (a) Income stability vs fixed recurring load
   (b) Discretionary vs essential allocation
   (c) Risk vectors and debt/anomaly mitigation
3. "actionable_suggestions": 2-4 concrete, highly specific financial recommendations with estimated monthly savings in rupees (₹), impact level (High/Medium/Low), and target category. Example: "Consolidate multiple streaming subscriptions (save ~₹1,200/month)", "Cap dining out frequency via food budget limit (save ~₹4,500/month)".
4. "key_positives": 2-3 strong positive indicators.
5. "key_risks": 2-3 potential risk points to monitor.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executive_summary: { type: Type.STRING },
            detailed_paragraphs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            actionable_suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  potential_monthly_savings: { type: Type.NUMBER },
                  impact: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['title', 'description', 'potential_monthly_savings', 'impact', 'category'],
              },
            },
            key_positives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            key_risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['executive_summary', 'detailed_paragraphs', 'actionable_suggestions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      statement_id: '',
      executive_summary: parsed.executive_summary || 'Your financial health indicates stable inflow with opportunities to optimize discretionary expenditures.',
      detailed_paragraphs: parsed.detailed_paragraphs || [
        `Your statement shows a total inflow of ₹${context.total_income.toLocaleString()} against total expenses of ₹${context.total_expenses.toLocaleString()}, yielding a savings rate of ${context.savings_rate.toFixed(1)}%.`,
        `Fixed commitments and recurring obligations comprise ₹${context.recurring_total.toLocaleString()} per month. Discretionary spending in top categories accounts for the primary variance in net cash retention.`
      ],
      actionable_suggestions: (parsed.actionable_suggestions || []).map((s: any) => ({
        title: s.title,
        description: s.description,
        potential_monthly_savings: Number(s.potential_monthly_savings) || 2500,
        impact: ['High', 'Medium', 'Low'].includes(s.impact) ? s.impact : 'Medium',
        category: (CANONICAL_CATEGORIES.includes(s.category) ? s.category : 'Food') as TransactionCategory,
      })),
      key_positives: parsed.key_positives || [
        'Positive net monthly cashflow',
        'Consistent income recognition',
        'Controlled credit utilization'
      ],
      key_risks: parsed.key_risks || [
        'High frequency of discretionary food & shopping debits',
        'Recurring subscriptions accumulation'
      ],
      generated_at: new Date().toISOString(),
    };
  } catch (error) {
    return {
      statement_id: '',
      executive_summary: `Your account exhibits an overall Financial Health Score of ${context.health_score}/100 with a net monthly savings rate of ${context.savings_rate.toFixed(1)}%.`,
      detailed_paragraphs: [
        `Total monthly income of ₹${context.total_income.toLocaleString()} comfortably covers operational expenses of ₹${context.total_expenses.toLocaleString()}.`,
        `Recurring obligations total ₹${context.recurring_total.toLocaleString()}. Reducing discretionary spend across top categories can further accelerate your emergency reserve cushion.`
      ],
      actionable_suggestions: [
        {
          title: 'Optimize Food Delivery & Dining Out',
          description: 'Consolidating weekly food orders and dining out can trim discretionary leakages by up to 25%.',
          potential_monthly_savings: Math.round(context.total_expenses * 0.08),
          impact: 'High',
          category: 'Food',
        },
        {
          title: 'Audit & Prune Unused Subscriptions',
          description: 'Review active digital subscriptions to eliminate duplicate streaming and cloud services.',
          potential_monthly_savings: Math.round(context.recurring_total * 0.2),
          impact: 'Medium',
          category: 'Subscriptions',
        },
      ],
      key_positives: ['Regular monthly income inflow', 'Positive net monthly savings balance'],
      key_risks: ['Discretionary spending concentration', 'Multiple recurring debit mandates'],
      generated_at: new Date().toISOString(),
    };
  }
}

/**
 * AI Copilot / Q&A Assistant for Bank Statement Intelligence
 */
export async function queryFinancialAssistantAI(params: {
  question: string;
  statementInfo?: { bank_name?: string; account_holder?: string };
  metrics: {
    total_income: number;
    total_expenses: number;
    net_savings: number;
    savings_rate_percent: number;
    financial_health_score: number;
  };
  topCategories: { category: string; amount: number; percentage: number }[];
  recurring: { merchant: string; amount: number; frequency: string; category: string }[];
  anomalies: { description: string; amount: number; explanation?: string }[];
  recentTransactions: { date: string; description: string; amount: number; type: string; category: string }[];
}): Promise<string> {
  const ai = getAiClient();

  const systemContext = `You are FinSight AI, a helpful, precise, and polite financial intelligence assistant built into the AI-Based Bank Statement Intelligence platform.
You analyze the user's uploaded bank statement data and provide clear, crisp, and direct answers in 1-3 concise paragraphs. Use Indian Rupee (₹) formatting.

User Financial Context:
- Bank: ${params.statementInfo?.bank_name || 'Bank Account'}
- Total Income: ₹${params.metrics.total_income.toLocaleString()}
- Total Expenses: ₹${params.metrics.total_expenses.toLocaleString()}
- Net Savings: ₹${params.metrics.net_savings.toLocaleString()} (${params.metrics.savings_rate_percent.toFixed(1)}% savings rate)
- Financial Health Score: ${params.metrics.financial_health_score}/100
- Top Expense Categories: ${params.topCategories.map((c) => `${c.category} (₹${c.amount.toLocaleString()}, ${c.percentage.toFixed(1)}%)`).join(', ')}
- Recurring Subscriptions: ${params.recurring.map((r) => `${r.merchant} (₹${r.amount}/${r.frequency})`).join(', ') || 'None detected'}
- Flagged Anomalies: ${params.anomalies.map((a) => `${a.description} ₹${a.amount} - ${a.explanation || 'Unusual spike'}`).join(', ') || 'None'}
- Recent Transaction Sample: ${params.recentTransactions.slice(0, 8).map((t) => `${t.date}: ${t.description} (₹${t.amount} ${t.type})`).join('; ')}

User Question: "${params.question}"

Answer the user directly, accurately referencing their numbers where relevant. Keep it clean, professional, and actionable.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: systemContext,
    });
    return response.text || 'I analyzed your statement records. Please let me know if you need more details.';
  } catch (error) {
    const q = params.question.toLowerCase();
    if (q.includes('where') || q.includes('most') || q.includes('highest')) {
      const top = params.topCategories[0];
      return `Your highest spending category is **${top?.category || 'General Expenses'}** at **₹${top?.amount?.toLocaleString()}** (${top?.percentage?.toFixed(1)}% of your total spend).`;
    } else if (q.includes('food') || q.includes('dining')) {
      const food = params.topCategories.find((c) => c.category.toLowerCase().includes('food'));
      return food
        ? `You spent a total of **₹${food.amount.toLocaleString()}** on Food & Dining (${food.percentage.toFixed(1)}% of total expenses).`
        : `Food & Dining expenses accounted for a portion of your living costs.`;
    } else if (q.includes('recurring') || q.includes('subscription')) {
      return `You have **${params.recurring.length} recurring commitments** totaling approximately **₹${params.recurring.reduce((s, r) => s + r.amount, 0).toLocaleString()}/month**, including ${params.recurring.slice(0, 3).map((r) => r.merchant).join(', ')}.`;
    } else if (q.includes('score') || q.includes('health') || q.includes('why')) {
      return `Your Financial Health Score is **${params.metrics.financial_health_score}/100** based on a solid **${params.metrics.savings_rate_percent.toFixed(1)}% savings rate** (₹${params.metrics.net_savings.toLocaleString()} net savings) and balanced debt obligations.`;
    }
    return `Based on your analyzed bank statement, your total income was ₹${params.metrics.total_income.toLocaleString()} and expenses were ₹${params.metrics.total_expenses.toLocaleString()}, leaving net savings of ₹${params.metrics.net_savings.toLocaleString()} (${params.metrics.savings_rate_percent.toFixed(1)}% savings rate).`;
  }
}
