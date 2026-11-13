import { CompanyNote, ProductSaleRecord, TaDaClaim } from '../types';

/**
 * Safely parses numeric values that may arrive as numbers, formatted strings
 * (e.g. "25,000", "৳25000"), null, or undefined.
 */
export function parseSafeAmount(val: unknown): number {
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : 0;
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Extracts a normalized "YYYY-MM" month key from ISO dates, YYYY/MM/DD,
 * DD/MM/YYYY, DD-MM-YYYY, or full ISO timestamps, trying fallbacks in order.
 */
export function extractMonthKey(
  primary?: string,
  ...fallbacks: (string | undefined)[]
): string {
  const candidates = [primary, ...fallbacks];
  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Match YYYY-MM or YYYY/MM at start (covers YYYY-MM-DD and ISO timestamps)
    const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = isoMatch[2].padStart(2, '0');
      if (Number(month) >= 1 && Number(month) <= 12) {
        return `${year}-${month}`;
      }
    }

    // Match DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      if (Number(month) >= 1 && Number(month) <= 12) {
        return `${year}-${month}`;
      }
    }
  }
  return '';
}

/**
 * Returns true if a CompanyNote represents a Company Operational Expense entry:
 * either explicitly categorized as 'expense' OR carrying a positive BDT amount
 * under 'operational', 'urgent', 'policy', or 'general'.
 */
export function isCompanyOpsNote(note: CompanyNote): boolean {
  if (!note) return false;
  return note.category === 'expense' || parseSafeAmount(note.amount) > 0;
}

export function getCompanyNoteAmount(note: CompanyNote): number {
  return parseSafeAmount(note?.amount);
}

export function getCompanyNoteMonthKey(note: CompanyNote): string {
  return extractMonthKey(note?.date, note?.created_at, note?.updated_at);
}

export function getTaDaClaimTotal(c: TaDaClaim): number {
  const explicit = parseSafeAmount(c.total_amount);
  if (explicit > 0) return explicit;
  return (
    parseSafeAmount(c.travel_allowance) +
    parseSafeAmount(c.daily_allowance) +
    parseSafeAmount(c.transportation_expense) +
    parseSafeAmount(c.accommodation_food_expense)
  );
}

export function getTaDaClaimMonthKey(c: TaDaClaim): string {
  return extractMonthKey(
    c.travel_start_date,
    c.travel_end_date,
    c.submitted_at,
    c.paid_at,
    c.created_at
  );
}

export function getSaleMonthKey(s: ProductSaleRecord): string {
  return extractMonthKey(s.sale_date, s.created_at, s.updated_at);
}
