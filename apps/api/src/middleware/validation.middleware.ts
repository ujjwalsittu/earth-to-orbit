import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/api-error';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(
          new BadRequestError(
            `Validation failed: ${errors.map((e) => `${e.path}: ${e.message}`).join(', ')}`
          )
        );
      } else {
        next(error);
      }
    }
  };
}

export function validateBody(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(
          new BadRequestError(
            `Validation failed: ${errors.map((e) => `${e.path}: ${e.message}`).join(', ')}`
          )
        );
      } else {
        next(error);
      }
    }
  };
}
