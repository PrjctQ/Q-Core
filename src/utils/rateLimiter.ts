import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  handler: (req: Request, res: Response) => {
    console.log('Rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl
    });
    res.status(429).json({ 
      error: 'Too many requests' 
    });
  }
});
