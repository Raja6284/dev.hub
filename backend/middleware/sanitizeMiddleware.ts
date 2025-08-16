// backend/middleware/sanitizeMiddleware.ts
import { body } from 'express-validator';
import sanitize from 'mongo-sanitize';

const sanitizeInput = [
  body('*').customSanitizer((value) => sanitize(value)),
];

export default sanitizeInput;