// @ts-ignore
import * as pdfParseModule from 'pdf-parse';
import { RawExtractedTransaction } from '../src/types';
import { extractTransactionsFromTextAI, extractTransactionsFromImageAI } from './ai';

const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;

/**
 * Extracts text from digital PDF buffers using pdf-parse, then sends to structured AI extractor
 */
export async function parseDigitalPdf(
  buffer: Buffer
): Promise<{ transactions: RawExtractedTransaction[]; bank_name?: string; currency?: string; raw_text_preview?: string }> {
  try {
    const data = await pdfParse(buffer);
    const fullText = data.text || '';
    
    if (fullText.trim().length < 30) {
      // PDF might be scanned or image-only inside PDF container
      throw new Error('PDF contains minimal extractable text stream; routing to OCR vision pipeline.');
    }

    const aiResult = await extractTransactionsFromTextAI(fullText);
    return {
      ...aiResult,
      raw_text_preview: fullText.slice(0, 500) + '...',
    };
  } catch (error: any) {
    throw error;
  }
}

/**
 * Parses Scanned PDF or Image via Gemini Multimodal Vision
 */
export async function parseScannedImage(
  buffer: Buffer,
  mimeType: string = 'image/jpeg'
): Promise<{ transactions: RawExtractedTransaction[]; bank_name?: string; currency?: string }> {
  return await extractTransactionsFromImageAI(buffer, mimeType);
}

/**
 * Parses raw SMS text blocks containing bank alerts
 * Supports multi-line transaction SMS from HDFC, SBI, ICICI, Axis, Kotak, UPI, etc.
 */
export async function parseSmsTextBlock(
  smsText: string
): Promise<{ transactions: RawExtractedTransaction[]; bank_name?: string; currency?: string }> {
  if (!smsText || smsText.trim().length < 10) {
    throw new Error('SMS text is empty or too short. Please provide valid bank alert messages.');
  }

  // First attempt specialized regex parser for speed and offline accuracy
  const regexExtracted = parseSmsWithRegex(smsText);
  
  if (regexExtracted.length >= 2) {
    return {
      transactions: regexExtracted,
      bank_name: detectBankFromSms(smsText) || 'SMS Bank Feed',
      currency: 'INR',
    };
  }

  // Fallback to AI parser for non-standard formats
  return await extractTransactionsFromTextAI(smsText);
}

/**
 * High-speed regex heuristics for Indian banking SMS formats
 */
function parseSmsWithRegex(text: string): RawExtractedTransaction[] {
  const transactions: RawExtractedTransaction[] = [];
  // Split by individual SMS messages (often separated by blank lines or headers)
  const messages = text.split(/(?:\r?\n){2,}|(?=Dear [A-Za-z]+,)|(?=Rs\.|INR|A\/c|Acct)/i).map(m => m.trim()).filter(Boolean);

  for (const msg of messages) {
    if (msg.length < 15) continue;

    // Detect amount: e.g. Rs. 1,450.00 or INR 500.00 or Rs 450
    const amtMatch = msg.match(/(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{2})?)/i);
    if (!amtMatch) continue;
    const amount = parseFloat(amtMatch[1].replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) continue;

    // Detect credit vs debit
    const isCredit = /credited|received|deposited|refunded|cr\b/i.test(msg);
    const isDebit = /debited|spent|paid|withdrawn|dr\b|sent\b/i.test(msg);
    const type: 'credit' | 'debit' = isCredit ? 'credit' : 'debit';

    // Detect date: e.g. 14-Aug-2024, 14/08/2024, on 12-05-24, on 15Jul
    let dateStr = new Date().toISOString().split('T')[0];
    const dateMatch = msg.match(/(?:on\s+)?(\d{1,2}[-\/](?:\d{1,2}|[A-Za-z]{3})[-\/]\d{2,4})/i);
    if (dateMatch) {
      try {
        const d = new Date(dateMatch[1].replace(/-/g, ' '));
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0];
        }
      } catch {}
    }

    // Detect merchant / info: e.g. "at SWIGGY BANGALORE", "to VPA swiggy@icici", "info: NETFLIX"
    let desc = 'Bank Transaction';
    const merchantMatch = msg.match(/(?:at|to|info|towards|VPA|for)\s+([A-Za-z0-9\s*.\-_@]{3,30})(?:\.|\s+on|\s+avl|\s+ref|\s+balance)/i);
    if (merchantMatch && merchantMatch[1]) {
      desc = merchantMatch[1].trim();
    } else {
      desc = isCredit ? 'Credit Deposit / Transfer' : 'Debit Payment';
    }

    // Detect balance: e.g. "Avl Bal Rs 45,210.50" or "Bal INR 12,000"
    let balance: number | undefined = undefined;
    const balMatch = msg.match(/(?:Avl\s+Bal|Balance|Bal\.?|Available)\s*(?:is|:)?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{2})?)/i);
    if (balMatch) {
      const b = parseFloat(balMatch[1].replace(/,/g, ''));
      if (!isNaN(b)) balance = b;
    }

    transactions.push({
      date: dateStr,
      description: desc,
      amount,
      type,
      balance,
    });
  }

  return transactions;
}

function detectBankFromSms(text: string): string | undefined {
  if (/HDFC/i.test(text)) return 'HDFC Bank';
  if (/SBI|State Bank/i.test(text)) return 'State Bank of India';
  if (/ICICI/i.test(text)) return 'ICICI Bank';
  if (/Axis/i.test(text)) return 'Axis Bank';
  if (/Kotak/i.test(text)) return 'Kotak Mahindra Bank';
  if (/Paytm/i.test(text)) return 'Paytm Payments Bank';
  if (/IndusInd/i.test(text)) return 'IndusInd Bank';
  return undefined;
}
