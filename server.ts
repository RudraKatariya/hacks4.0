import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db';
import { Statement, Transaction, InputType } from './src/types';
import { parseDigitalPdf, parseScannedImage, parseSmsTextBlock } from './server/parsers';
import { batchCategorizeTransactionsAI, generateFinancialSummaryAI, queryFinancialAssistantAI } from './server/ai';
import { detectAnomalies, detectRecurringPayments, calculateFinancialHealthScore, generateMonthlySpendingAnalytics } from './server/analytics';
import { PRESET_DATASETS } from './server/presets';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage for PDF & Image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// Security & Privacy Header: Mask sensitive logs
app.use((req, res, next) => {
  // Never log raw PII or statement payload in server logs
  if (req.path.startsWith('/api/')) {
    const sanitizedPath = req.path;
    // Log route access without dumping request body containing bank data
    console.log(`[StatementIQ API] ${req.method} ${sanitizedPath}`);
  }
  next();
});

// ==========================================
// API ENDPOINTS
// ==========================================

/**
 * GET /api/health - Uptime & System Health Check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'StatementIQ AI Financial Intelligence Engine',
    version: '2.4.0',
    capabilities: [
      'digital_pdf_extraction',
      'vision_ocr_extraction',
      'sms_alerts_parser',
      'batch_categorization',
      'statistical_anomaly_detection',
      'recurring_cadence_engine',
      'composite_health_scoring',
      'ai_summary_engine',
    ],
  });
});

/**
 * GET /api/statements - List all uploaded/processed statements
 */
app.get('/api/statements', (req: Request, res: Response) => {
  const statements = db.getAllStatements();
  res.json({ statements });
});

/**
 * GET /api/presets - Get pre-configured sample financial datasets
 */
app.get('/api/presets', (req: Request, res: Response) => {
  res.json({ presets: PRESET_DATASETS });
});

/**
 * POST /api/seed-preset/:preset_id - Instant 1-Click Load for Sample Datasets
 */
app.post('/api/seed-preset/:preset_id', async (req: Request, res: Response) => {
  try {
    const { preset_id } = req.params;
    const preset = PRESET_DATASETS.find((p) => p.id === preset_id) || PRESET_DATASETS[0];

    const statementId = `stmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const statement: Statement = {
      id: statementId,
      filename: `${preset.bank_name} Statement.pdf`,
      input_type: preset.input_type,
      uploaded_at: new Date().toISOString(),
      bank_name: preset.bank_name,
      account_holder: preset.account_holder,
      account_number_masked: 'XXXX-XXXX-4091',
      currency: preset.currency,
      status: 'uploaded',
      total_transactions: preset.transactions.length,
      sms_text_preview: preset.sms_text,
    };

    db.createStatement(statement);

    // Build transactions
    const rawTxs = preset.transactions;
    const initialTxs: Transaction[] = rawTxs.map((t, idx) => ({
      id: `tx_${statementId}_${idx + 1}`,
      statement_id: statementId,
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type,
      balance: t.balance,
      category: 'Other',
      created_at: new Date().toISOString(),
    }));

    db.saveTransactions(statementId, initialTxs);

    // Auto-run full pipeline for instantaneous demo experience
    const categoriesMap = await batchCategorizeTransactionsAI(
      initialTxs.map((t) => ({ id: t.id, description: t.description, amount: t.amount, type: t.type }))
    );

    const categorizedTxs = initialTxs.map((t) => ({
      ...t,
      category: categoriesMap[t.id]?.category || 'Other',
      merchant: categoriesMap[t.id]?.merchant || t.description,
      confidence_score: categoriesMap[t.id]?.confidence || 0.92,
    }));

    db.saveTransactions(statementId, categorizedTxs);

    // Detect anomalies and recurring
    const anomalies = await detectAnomalies(statementId, categorizedTxs);
    db.saveAnomalies(statementId, anomalies);

    const recurring = detectRecurringPayments(statementId, categorizedTxs);
    db.saveRecurring(statementId, recurring);

    // Analytics
    const analytics = generateMonthlySpendingAnalytics(statementId, categorizedTxs);
    db.saveAnalytics(statementId, analytics);

    // Health Score
    const healthScore = calculateFinancialHealthScore(statementId, categorizedTxs, recurring, anomalies);
    db.saveHealthScore(statementId, healthScore);

    // Summary
    const summary = await generateFinancialSummaryAI({
      total_income: healthScore.metrics.total_income,
      total_expenses: healthScore.metrics.total_expenses,
      net_savings: healthScore.metrics.net_savings,
      savings_rate: healthScore.metrics.savings_rate_percent,
      health_score: healthScore.overall_score,
      top_categories: analytics.categories.slice(0, 4),
      recurring_total: healthScore.metrics.fixed_recurring_monthly,
      anomaly_count: anomalies.length,
      bank_name: statement.bank_name,
    });
    summary.statement_id = statementId;
    db.saveSummary(statementId, summary);

    db.updateStatement(statementId, { status: 'analyzed' });

    res.json({
      success: true,
      statement_id: statementId,
      statement: db.getStatement(statementId),
      transactions: categorizedTxs,
      recurring,
      anomalies,
      analytics,
      healthScore,
      summary,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to seed preset data' });
  }
});

/**
 * POST /api/upload - Upload file (PDF / Image) OR raw SMS text block
 */
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    const file = req.file;
    const smsText = req.body.sms_text;
    const customBankName = req.body.bank_name;

    let inputType: InputType = 'digital_pdf';
    let filename = 'Bank_Statement.pdf';
    let fileSizeBytes = 0;

    if (file) {
      filename = file.originalname;
      fileSizeBytes = file.size;
      const mime = file.mimetype.toLowerCase();
      if (mime.includes('image') || filename.match(/\.(jpg|jpeg|png|webp)$/i)) {
        inputType = 'scanned_pdf_image';
      } else {
        inputType = 'digital_pdf';
      }
    } else if (smsText && smsText.trim().length > 0) {
      inputType = 'sms_text';
      filename = 'SMS_Transaction_Alerts.txt';
      fileSizeBytes = Buffer.byteLength(smsText, 'utf8');
    } else {
      return res.status(400).json({
        error: 'Please upload a PDF/Image file or paste an SMS text block.',
      });
    }

    const statementId = `stmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const statement: Statement = {
      id: statementId,
      filename,
      input_type: inputType,
      uploaded_at: new Date().toISOString(),
      bank_name: customBankName || (inputType === 'sms_text' ? 'SMS Bank Stream' : 'Bank Statement'),
      currency: 'INR',
      status: 'uploaded',
      total_transactions: 0,
      file_size_bytes: fileSizeBytes,
      sms_text_preview: smsText ? smsText.slice(0, 300) : undefined,
    };

    if (file) {
      db.createStatement(statement, {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
      });
    } else {
      db.createStatement(statement, { smsText });
    }

    res.json({
      statement_id: statementId,
      input_type: inputType,
      filename,
      status: 'uploaded',
      message: 'Statement ingested successfully. Proceeding to extraction pipeline.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Upload processing error' });
  }
});

/**
 * POST /api/extract/:statement_id - Extract Transactions Pipeline
 */
app.post('/api/extract/:statement_id', async (req: Request, res: Response) => {
  const { statement_id } = req.params;
  const statement = db.getStatement(statement_id);

  if (!statement) {
    return res.status(404).json({ error: 'Statement not found' });
  }

  const raw = db.getRawFile(statement_id);
  if (!raw) {
    return res.status(400).json({ error: 'Raw file buffer or SMS content missing' });
  }

  try {
    let extractedData: { transactions: any[]; bank_name?: string; currency?: string } = { transactions: [] };

    if ('smsText' in raw) {
      extractedData = await parseSmsTextBlock(raw.smsText);
    } else if (raw.mimetype.includes('pdf')) {
      try {
        extractedData = await parseDigitalPdf(raw.buffer);
      } catch (pdfErr) {
        // If digital text extraction encounters scanned image, try image OCR
        extractedData = await parseScannedImage(raw.buffer, 'application/pdf');
      }
    } else {
      // Scanned image
      extractedData = await parseScannedImage(raw.buffer, raw.mimetype);
    }

    if (!extractedData.transactions || extractedData.transactions.length === 0) {
      throw new Error('No readable transaction entries could be extracted from this document format.');
    }

    const transactions: Transaction[] = extractedData.transactions.map((t, idx) => ({
      id: `tx_${statement_id}_${idx + 1}`,
      statement_id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type,
      balance: t.balance,
      reference_no: t.reference_no,
      category: 'Other',
      created_at: new Date().toISOString(),
    }));

    db.saveTransactions(statement_id, transactions);
    db.updateStatement(statement_id, {
      status: 'extracted',
      bank_name: extractedData.bank_name || statement.bank_name,
      currency: extractedData.currency || statement.currency,
      total_transactions: transactions.length,
    });

    res.json({
      statement_id,
      status: 'extracted',
      count: transactions.length,
      transactions,
    });
  } catch (error: any) {
    db.updateStatement(statement_id, {
      status: 'error',
      error_message: error.message || 'Extraction failed',
    });
    res.status(422).json({
      error: error.message || 'Failed to extract transactions from the provided format.',
      statement_id,
    });
  }
});

/**
 * POST /api/categorize/:statement_id - Batch Categorization
 */
app.post('/api/categorize/:statement_id', async (req: Request, res: Response) => {
  const { statement_id } = req.params;
  const transactions = db.getTransactions(statement_id);

  if (transactions.length === 0) {
    return res.status(400).json({ error: 'No transactions found to categorize. Extract first.' });
  }

  try {
    const catMap = await batchCategorizeTransactionsAI(
      transactions.map((t) => ({ id: t.id, description: t.description, amount: t.amount, type: t.type }))
    );

    const updatedTxs = transactions.map((t) => ({
      ...t,
      category: catMap[t.id]?.category || t.category || 'Other',
      merchant: catMap[t.id]?.merchant || t.description,
      confidence_score: catMap[t.id]?.confidence || 0.9,
    }));

    db.saveTransactions(statement_id, updatedTxs);
    db.updateStatement(statement_id, { status: 'categorized' });

    res.json({
      statement_id,
      status: 'categorized',
      count: updatedTxs.length,
      transactions: updatedTxs,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Batch categorization failed' });
  }
});

/**
 * GET /api/recurring/:statement_id - Identify recurring payments
 */
app.get('/api/recurring/:statement_id', (req: Request, res: Response) => {
  const { statement_id } = req.params;
  const transactions = db.getTransactions(statement_id);

  const recurring = detectRecurringPayments(statement_id, transactions);
  db.saveRecurring(statement_id, recurring);

  res.json({
    statement_id,
    count: recurring.length,
    recurring,
  });
});

/**
 * GET /api/anomalies/:statement_id - Detect unusual spending
 */
app.get('/api/anomalies/:statement_id', async (req: Request, res: Response) => {
  const { statement_id } = req.params;
  const transactions = db.getTransactions(statement_id);

  try {
    const anomalies = await detectAnomalies(statement_id, transactions);
    db.saveAnomalies(statement_id, anomalies);

    res.json({
      statement_id,
      count: anomalies.length,
      anomalies,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Anomaly detection failed' });
  }
});

/**
 * GET /api/analytics/:statement_id - Spending Breakdown & Inflow/Outflow
 */
app.get('/api/analytics/:statement_id', (req: Request, res: Response) => {
  const { statement_id } = req.params;
  const transactions = db.getTransactions(statement_id);

  if (transactions.length === 0) {
    return res.status(404).json({ error: 'No transactions found for this statement' });
  }

  const analytics = generateMonthlySpendingAnalytics(statement_id, transactions);
  db.saveAnalytics(statement_id, analytics);

  res.json({
    statement_id,
    analytics,
  });
});

/**
 * GET /api/health-score/:statement_id - Composite Financial Health Score
 */
app.get('/api/health-score/:statement_id', (req: Request, res: Response) => {
  const { statement_id } = req.params;
  const transactions = db.getTransactions(statement_id);
  const recurring = db.getRecurring(statement_id);
  const anomalies = db.getAnomalies(statement_id);

  if (transactions.length === 0) {
    return res.status(404).json({ error: 'No transactions found for this statement' });
  }

  const healthScore = calculateFinancialHealthScore(statement_id, transactions, recurring, anomalies);
  db.saveHealthScore(statement_id, healthScore);

  res.json({
    statement_id,
    healthScore,
  });
});

/**
 * GET /api/summary/:statement_id - AI Natural-Language Summary & Savings Suggestions
 */
app.get('/api/summary/:statement_id', async (req: Request, res: Response) => {
  const { statement_id } = req.params;
  const statement = db.getStatement(statement_id);
  const transactions = db.getTransactions(statement_id);
  const recurring = db.getRecurring(statement_id);
  const anomalies = db.getAnomalies(statement_id);

  if (transactions.length === 0) {
    return res.status(404).json({ error: 'No transactions found' });
  }

  const analytics = generateMonthlySpendingAnalytics(statement_id, transactions);
  const healthScore = calculateFinancialHealthScore(statement_id, transactions, recurring, anomalies);

  try {
    const summary = await generateFinancialSummaryAI({
      total_income: healthScore.metrics.total_income,
      total_expenses: healthScore.metrics.total_expenses,
      net_savings: healthScore.metrics.net_savings,
      savings_rate: healthScore.metrics.savings_rate_percent,
      health_score: healthScore.overall_score,
      top_categories: analytics.categories.slice(0, 4),
      recurring_total: healthScore.metrics.fixed_recurring_monthly,
      anomaly_count: anomalies.length,
      bank_name: statement?.bank_name,
    });
    summary.statement_id = statement_id;
    db.saveSummary(statement_id, summary);

    res.json({
      statement_id,
      summary,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Summary generation failed' });
  }
});

/**
 * PATCH /api/transaction/:statement_id/:transaction_id - Live Category Edit
 */
app.patch('/api/transaction/:statement_id/:transaction_id', (req: Request, res: Response) => {
  const { statement_id, transaction_id } = req.params;
  const { category } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'New category required' });
  }

  const updated = db.updateTransactionCategory(statement_id, transaction_id, category);
  if (!updated) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  // Refresh analytics
  const txs = db.getTransactions(statement_id);
  const analytics = generateMonthlySpendingAnalytics(statement_id, txs);
  db.saveAnalytics(statement_id, analytics);

  const recurring = db.getRecurring(statement_id);
  const anomalies = db.getAnomalies(statement_id);
  const healthScore = calculateFinancialHealthScore(statement_id, txs, recurring, anomalies);
  db.saveHealthScore(statement_id, healthScore);

  res.json({
    success: true,
    transaction: updated,
    analytics,
    healthScore,
  });
});

/**
 * DELETE /api/statement/:statement_id - Hard Deletion of User Data
 */
app.delete('/api/statement/:statement_id', (req: Request, res: Response) => {
  const { statement_id } = req.params;
  const result = db.hardDeleteStatement(statement_id);

  res.json({
    success: true,
    message: 'User data, original document buffer, derived transactions, and AI analytics have been permanently erased.',
    statement_id,
    records_purged: result.purged_records,
    audit_timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/audit-logs - View anonymized data privacy deletion logs
 */
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({
    logs: db.getDeletionAuditLogs(),
  });
});

/**
 * POST /api/chat/:statement_id - Ask AI Financial Assistant / Copilot Q&A
 */
app.post('/api/chat/:statement_id', async (req: Request, res: Response) => {
  const { statement_id } = req.params;
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required' });
  }

  const statement = db.getStatement(statement_id);
  const transactions = db.getTransactions(statement_id);
  const recurring = db.getRecurring(statement_id);
  const anomalies = db.getAnomalies(statement_id);
  const analytics = db.getAnalytics(statement_id) || generateMonthlySpendingAnalytics(statement_id, transactions);
  const healthScore = db.getHealthScore(statement_id) || calculateFinancialHealthScore(statement_id, transactions, recurring, anomalies);

  try {
    const answer = await queryFinancialAssistantAI({
      question,
      statementInfo: {
        bank_name: statement?.bank_name,
        account_holder: statement?.account_holder,
      },
      metrics: {
        total_income: healthScore.metrics.total_income,
        total_expenses: healthScore.metrics.total_expenses,
        net_savings: healthScore.metrics.net_savings,
        savings_rate_percent: healthScore.metrics.savings_rate_percent,
        financial_health_score: healthScore.overall_score,
      },
      topCategories: analytics.categories.slice(0, 6),
      recurring: recurring.map((r) => ({
        merchant: r.merchant,
        amount: r.amount,
        frequency: r.frequency,
        category: r.category,
      })),
      anomalies: anomalies.map((a) => ({
        description: a.description,
        amount: a.amount,
        explanation: a.why_plain_language,
      })),
      recentTransactions: transactions.slice(0, 10).map((t) => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
      })),
    });

    res.json({
      question,
      answer,
      statement_id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to process financial query' });
  }
});

// ==========================================
// VITE SPA MIDDLEWARE INTEGRATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StatementIQ Server running on port ${PORT}`);
  });
}

startServer();
