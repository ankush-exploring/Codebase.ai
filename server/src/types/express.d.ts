import { JwtPayload } from './index.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      file?: any;
      files?: any;
    }
  }
}