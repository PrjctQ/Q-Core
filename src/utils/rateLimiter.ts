import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter middleware for API endpoints
 * Limits each IP address to 100 requests per 15-minute window
 * 
 * @example
 * // Apply to all routes:
 * app.use(apiLimiter);
 * 
 * @example  
 * // Apply to specific routes:
 * router.post('/login', apiLimiter, authController.login);
 */
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
