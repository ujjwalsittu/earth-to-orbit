/**
 * Generate a formatted number with prefix and padding
 * @param prefix - The prefix for the number (e.g., 'REQ', 'INV')
 * @param number - The sequential number
 * @param year - The year (defaults to current year)
 * @returns Formatted number (e.g., 'REQ-2025-00001')
 */
export const generateFormattedNumber = (
  prefix: string,
  number: number,
  year?: number
): string => {
  const yearStr = year || new Date().getFullYear();
  const paddedNumber = number.toString().padStart(5, '0');
  return `${prefix}-${yearStr}-${paddedNumber}`;
};

/**
 * Generate a request number
 */
export const generateRequestNumber = (sequenceNumber: number): string => {
  return generateFormattedNumber('REQ', sequenceNumber);
};

/**
 * Generate an invoice number
 */
export const generateInvoiceNumber = (sequenceNumber: number): string => {
  return generateFormattedNumber('INV', sequenceNumber);
};

/**
 * Generate a payment ID
 */
export const generatePaymentId = (sequenceNumber: number): string => {
  return generateFormattedNumber('PAY', sequenceNumber);
};

export default {
  generateFormattedNumber,
  generateRequestNumber,
  generateInvoiceNumber,
  generatePaymentId,
};
