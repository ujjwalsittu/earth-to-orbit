/**
 * Generate sequential numbers for requests, invoices, payments
 * Format: PREFIX-YYYY-NNNNN
 * Example: REQ-2024-00001, INV-2024-00001
 */
export function generateSequentialNumber(
  prefix: string,
  lastNumber?: string
): string {
  const year = new Date().getFullYear();
  let sequence = 1;

  if (lastNumber) {
    const parts = lastNumber.split('-');
    const lastYear = parseInt(parts[1], 10);
    const lastSeq = parseInt(parts[2], 10);

    if (lastYear === year) {
      sequence = lastSeq + 1;
    }
  }

  const sequenceStr = sequence.toString().padStart(5, '0');
  return `${prefix}-${year}-${sequenceStr}`;
}

/**
 * Parse sequential number to extract components
 */
export function parseSequentialNumber(number: string): {
  prefix: string;
  year: number;
  sequence: number;
} {
  const [prefix, yearStr, seqStr] = number.split('-');
  return {
    prefix,
    year: parseInt(yearStr, 10),
    sequence: parseInt(seqStr, 10),
  };
}
