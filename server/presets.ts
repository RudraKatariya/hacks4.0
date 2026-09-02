import { RawExtractedTransaction } from '../src/types';

export interface PresetStatement {
  id: string;
  name: string;
  bank_name: string;
  input_type: 'digital_pdf' | 'scanned_pdf_image' | 'sms_text';
  description: string;
  badge: string;
  account_holder: string;
  currency: string;
  transactions: RawExtractedTransaction[];
  sms_text?: string;
}

export const PRESET_DATASETS: PresetStatement[] = [
  {
    id: 'sample_hdfc_salaried',
    name: 'HDFC Bank - 3-Month Salaried Professional',
    bank_name: 'HDFC Bank Ltd.',
    input_type: 'digital_pdf',
    badge: 'Digital PDF (Comprehensive)',
    description: '3 months of complete transactions with payroll credits, fixed rent, recurring OTT/cloud subs, food delivery, and 2 flagged anomaly patterns.',
    account_holder: 'Ojas Goyal (Software Architect)',
    currency: 'INR',
    transactions: [
      { date: '2024-05-01', description: 'ACH/INFOSYS CORP/SALARY-MAY2024', amount: 135000, type: 'credit', balance: 182450 },
      { date: '2024-05-02', description: 'NEFT/HOUSE RENT/PRESTIGE SOCIETY', amount: 32000, type: 'debit', balance: 150450 },
      { date: '2024-05-04', description: 'POS 940231 NETFLIX COM MUMBAI', amount: 649, type: 'debit', balance: 149801 },
      { date: '2024-05-04', description: 'POS 882190 SPOTIFY INDIA', amount: 119, type: 'debit', balance: 149682 },
      { date: '2024-05-05', description: 'UPI/Swiggy/2940124/FoodOrder', amount: 485, type: 'debit', balance: 149197 },
      { date: '2024-05-07', description: 'UPI/BESCOM Electricity Bangalore', amount: 2450, type: 'debit', balance: 146747 },
      { date: '2024-05-08', description: 'UPI/Zomato Bangalore/Dinner', amount: 820, type: 'debit', balance: 145927 },
      { date: '2024-05-10', description: 'ACH/HDFC BANK LOAN EMI/AUTO-DEBIT', amount: 18500, type: 'debit', balance: 127427 },
      { date: '2024-05-12', description: 'UPI/Blinkit Grocery Delivery', amount: 1250, type: 'debit', balance: 126177 },
      { date: '2024-05-15', description: 'POS AMAZON RETAIL INDIA', amount: 3499, type: 'debit', balance: 122678 },
      { date: '2024-05-18', description: 'UPI/Cult.fit Gym Membership Bangalore', amount: 1999, type: 'debit', balance: 120679 },
      { date: '2024-05-20', description: 'UPI/Apollo Pharmacy Bangalore/Meds', amount: 1420, type: 'debit', balance: 119259 },
      { date: '2024-05-22', description: 'UPI/Swiggy/3940124/FoodOrder', amount: 560, type: 'debit', balance: 118699 },
      { date: '2024-05-24', description: 'POS BOOKMYSHOW INOX MOVIES', amount: 950, type: 'debit', balance: 117749 },
      { date: '2024-05-28', description: 'AWS CLOUD SERVICES IRELAND', amount: 1840, type: 'debit', balance: 115909 },
      
      // June Month
      { date: '2024-06-01', description: 'ACH/INFOSYS CORP/SALARY-JUN2024', amount: 135000, type: 'credit', balance: 250909 },
      { date: '2024-06-02', description: 'NEFT/HOUSE RENT/PRESTIGE SOCIETY', amount: 32000, type: 'debit', balance: 218909 },
      { date: '2024-06-04', description: 'POS 940231 NETFLIX COM MUMBAI', amount: 649, type: 'debit', balance: 218260 },
      { date: '2024-06-04', description: 'POS 882190 SPOTIFY INDIA', amount: 119, type: 'debit', balance: 218141 },
      { date: '2024-06-06', description: 'UPI/Zepto Superfast Groceries', amount: 940, type: 'debit', balance: 217201 },
      { date: '2024-06-08', description: 'UPI/AIRTEL BROADBAND FIBRE BILL', amount: 1179, type: 'debit', balance: 216022 },
      { date: '2024-06-10', description: 'ACH/HDFC BANK LOAN EMI/AUTO-DEBIT', amount: 18500, type: 'debit', balance: 197522 },
      { date: '2024-06-12', description: 'UPI/Swiggy/4940124/Lunch', amount: 480, type: 'debit', balance: 197042 },
      { date: '2024-06-14', description: 'POS CROMA ELECTRONICS LUXURY PURCHASE', amount: 48990, type: 'debit', balance: 148052 }, // Statistical Outlier Anomaly
      { date: '2024-06-18', description: 'UPI/Cult.fit Gym Membership Bangalore', amount: 1999, type: 'debit', balance: 146053 },
      { date: '2024-06-20', description: 'UPI/Swiggy/5940124/Dinner', amount: 1450, type: 'debit', balance: 144603 },
      { date: '2024-06-21', description: 'UPI/Swiggy/5940124/Dinner', amount: 1450, type: 'debit', balance: 143153 }, // Duplicate Charge Anomaly
      { date: '2024-06-25', description: 'POS FLIPKART SHOPPING INDIA', amount: 4290, type: 'debit', balance: 138863 },
      { date: '2024-06-28', description: 'AWS CLOUD SERVICES IRELAND', amount: 1890, type: 'debit', balance: 136973 },

      // July Month
      { date: '2024-07-01', description: 'ACH/INFOSYS CORP/SALARY-JUL2024', amount: 135000, type: 'credit', balance: 271973 },
      { date: '2024-07-02', description: 'NEFT/HOUSE RENT/PRESTIGE SOCIETY', amount: 32000, type: 'debit', balance: 239973 },
      { date: '2024-07-04', description: 'POS 940231 NETFLIX COM MUMBAI', amount: 649, type: 'debit', balance: 239324 },
      { date: '2024-07-04', description: 'POS 882190 SPOTIFY INDIA', amount: 119, type: 'debit', balance: 239205 },
      { date: '2024-07-07', description: 'UPI/BESCOM Electricity Bangalore', amount: 2310, type: 'debit', balance: 236895 },
      { date: '2024-07-10', description: 'ACH/HDFC BANK LOAN EMI/AUTO-DEBIT', amount: 18500, type: 'debit', balance: 218395 },
      { date: '2024-07-15', description: 'UPI/Zomato Bangalore/Weekend Party', amount: 2100, type: 'debit', balance: 216295 },
      { date: '2024-07-18', description: 'UPI/Cult.fit Gym Membership Bangalore', amount: 1999, type: 'debit', balance: 214296 },
      { date: '2024-07-22', description: 'UPI/Myntra Fashion Shopping', amount: 3150, type: 'debit', balance: 211146 },
      { date: '2024-07-28', description: 'AWS CLOUD SERVICES IRELAND', amount: 1910, type: 'debit', balance: 209236 },
      { date: '2024-07-30', description: 'INTEREST CREDIT QUARTERLY', amount: 1420, type: 'credit', balance: 210656 }
    ]
  },
  {
    id: 'sample_icici_scanned',
    name: 'ICICI Bank - Retail & Freelancer Statement',
    bank_name: 'ICICI Bank',
    input_type: 'scanned_pdf_image',
    badge: 'Vision OCR (Scanned Image/PDF)',
    description: 'Simulates physical paper statement captured via scanner/camera. Features high-velocity client credits, medical expenses, and utility payments.',
    account_holder: 'Rohan Deshmukh (Freelance Consultant)',
    currency: 'INR',
    transactions: [
      { date: '2024-06-05', description: 'IMPS/INWARD/CLIENT-PAYOUT-US-DEV', amount: 85000, type: 'credit', balance: 112000 },
      { date: '2024-06-07', description: 'UPI/COWORKING-WEWORK-SPACE', amount: 14000, type: 'debit', balance: 98000 },
      { date: '2024-06-09', description: 'POS RELIANCE DIGITAL ELECTRONICS', amount: 7800, type: 'debit', balance: 90200 },
      { date: '2024-06-11', description: 'UPI/Swiggy/Bangalore', amount: 620, type: 'debit', balance: 89580 },
      { date: '2024-06-14', description: 'POS APOLLO PHARMACY MUMBAI', amount: 2450, type: 'debit', balance: 87130 },
      { date: '2024-06-18', description: 'UPI/Jio Fibre Broadband Plan', amount: 825, type: 'debit', balance: 86305 },
      { date: '2024-06-20', description: 'IMPS/INWARD/DESIGN-CLIENT-CREDIT', amount: 45000, type: 'credit', balance: 131305 },
      { date: '2024-06-22', description: 'UPI/STARBUCKS COFFEE INDIRANAGAR', amount: 890, type: 'debit', balance: 130415 },
      { date: '2024-06-24', description: 'ACH/ICICI AUTO LOAN REPAYMENT', amount: 12500, type: 'debit', balance: 117915 },
      { date: '2024-06-28', description: 'POS SHELL PETROL STATION FUEL', amount: 3500, type: 'debit', balance: 114415 }
    ]
  },
  {
    id: 'sample_sms_feed',
    name: 'Indian Banking SMS Transaction Alerts Block',
    bank_name: 'Multi-Bank SMS Stream (HDFC / SBI / Paytm)',
    input_type: 'sms_text',
    badge: 'SMS Alerts Parser',
    description: 'Pasted raw bank SMS alerts covering instant UPI debits, credit card swipes, salary alerts, and low-balance warnings.',
    account_holder: 'Priya Iyer',
    currency: 'INR',
    sms_text: `Dear Customer, Rs. 95,000.00 credited to your A/c XX4091 on 01-Jul-24 by ECS towards SALARY FOR JUN 2024. Avl Bal Rs 1,12,450.00. - HDFC Bank

Dear SBI User, Rs 18,500.00 debited from A/c 2841 on 02-Jul-24 towards SBI HOME LOAN EMI. Available Balance: INR 93,950.00. - SBI

Sent Rs. 450.00 from Kotak Bank A/c ...8921 to Swiggy UPI on 03-Jul-24. Ref: 41829301. Avl Bal: Rs 93,500.00.

Your HDFC Bank Credit Card ending 4402 was used for Rs 649.00 at NETFLIX COM on 04-Jul-2024. Available limit Rs 1,84,000.

Paid Rs. 1,850.00 to BESCOM ELECTRICITY via Paytm UPI on 05-Jul-2024. Avl Bal Rs 91,650.00.

Sent Rs. 1,290.00 to Blinkit Grocery on 08-Jul-24 from A/c XX4091. Bal Rs 90,360.00.

Dear Customer, Rs. 38,500.00 debited from HDFC A/c XX4091 on 12-Jul-24 at CROMA RETAIL BANGALORE. Avl Bal Rs 51,860.00.

Sent Rs. 850.00 to Zomato UPI on 15-Jul-24. Ref 49201923. Bal Rs 51,010.00.

Sent Rs. 850.00 to Zomato UPI on 15-Jul-24. Ref 49201923. Bal Rs 50,160.00.

Your A/c XX4091 is debited for Rs 1,179.00 on 18-Jul-24 towards AIRTEL FIBRE BILL. Avl Bal Rs 48,981.00.`,
    transactions: [
      { date: '2024-07-01', description: 'Salary Credit ECS INFOSYS', amount: 95000, type: 'credit', balance: 112450 },
      { date: '2024-07-02', description: 'SBI HOME LOAN EMI AUTO-DEBIT', amount: 18500, type: 'debit', balance: 93950 },
      { date: '2024-07-03', description: 'Swiggy UPI Food Order', amount: 450, type: 'debit', balance: 93500 },
      { date: '2024-07-04', description: 'NETFLIX COM Subscription', amount: 649, type: 'debit', balance: 92851 },
      { date: '2024-07-05', description: 'BESCOM Electricity Bangalore', amount: 1850, type: 'debit', balance: 91001 },
      { date: '2024-07-08', description: 'Blinkit Grocery Instant', amount: 1290, type: 'debit', balance: 89711 },
      { date: '2024-07-12', description: 'CROMA RETAIL BANGALORE POS', amount: 38500, type: 'debit', balance: 51211 },
      { date: '2024-07-15', description: 'Zomato UPI Dinner', amount: 850, type: 'debit', balance: 50361 },
      { date: '2024-07-15', description: 'Zomato UPI Dinner (Duplicate)', amount: 850, type: 'debit', balance: 49511 },
      { date: '2024-07-18', description: 'AIRTEL FIBRE BILL Broadband', amount: 1179, type: 'debit', balance: 48332 }
    ]
  }
];
