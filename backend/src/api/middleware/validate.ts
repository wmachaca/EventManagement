// src/middleware/validate.ts

import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import type { Result, ValidationError } from 'express-validator';

type FormattedError = {
  field: string;
  message: string;
  value?: unknown;
};

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors: Result<ValidationError> = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors inside middleware:', errors.array());
    const formattedErrors: FormattedError[] = errors.array().map(error => {
      // In express-validator v7+, field errors have `path`, while others might not
      const field = 'path' in error ? error.path : 'unknown';
      return {
        field,
        message: error.msg,
        value: 'value' in error ? error.value : undefined,
      };
    });

    res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors,
    });
    return;
  }

  next();
};
