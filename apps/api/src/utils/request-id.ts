import { randomBytes } from 'crypto';

/**
 * Generate a unique request ID
 */
export const generateRequestId = (): string => {
  return randomBytes(16).toString('hex');
};

export default generateRequestId;
