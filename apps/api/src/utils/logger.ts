import pino from 'pino';
import { env, isDevelopment } from '../config/env';

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: env.NODE_ENV,
  },
});
