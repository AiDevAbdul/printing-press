import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CompanyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract company_id from JWT payload (set by JwtStrategy)
    if (req.user && (req.user as any).company_id) {
      req['company_id'] = (req.user as any).company_id;
    }
    next();
  }
}
