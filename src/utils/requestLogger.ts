import { performance } from 'perf_hooks';
import bytes from 'bytes';
import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Custom console formatter for better readability
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length) {
            // Convert JSON to string and colorize the keys
            const jsonStr = JSON.stringify(meta, null, 2);
            const greenColor = '\x1b[32m'; // Green
            const resetColor = '\x1b[0m';  // Reset
            
            // Replace JSON keys with green color
            const coloredJson = jsonStr.replace(/"([^"]+)":/g, `"${greenColor}$1${resetColor}":`);
            metaStr = `\n${coloredJson}`;
        }
        return `${timestamp} [${level}]: ${message}${metaStr}`;
    })
);

// Configure Winston logger with file rotation
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d'
        }),
        new winston.transports.Console({
            format: consoleFormat
        })
    ]
});

// Rate limit alert threshold (in ms)
const SLOW_REQUEST_THRESHOLD = 500;

function requestLogger(req: Request, res: Response, next: NextFunction) {
    if(req.method === "OPTIONS") return next()
    const startTime = performance.now();
    const startMemory = process.memoryUsage().rss;

    // Capture request data (filter sensitive fields)
    const requestSizeBytes = parseInt(req.headers['content-length'] as string) || 0;
    const requestData = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent') || '',
        requestSize: bytes(requestSizeBytes),
        requestSizeBytes: requestSizeBytes,
        timestamp: new Date().toISOString()
    };

    logger.info('Request', requestData);

    const originalEnd = res.end;
    res.end = function(this: Response, ...args: any[]) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Alert for slow requests
        if (duration > SLOW_REQUEST_THRESHOLD) {
            logger.warn(`Slow request detected: ${duration.toFixed(2)}ms`, {
                url: req.originalUrl,
                threshold: SLOW_REQUEST_THRESHOLD
            });
        }

        // Capture response metrics
        const responseData = {
            status: res.statusCode,
            duration: `${duration.toFixed(2)}ms`,
            memoryUsed: bytes(process.memoryUsage().rss - startMemory),
            timestamp: new Date().toISOString()
        };

        // Log response
        logger.info('Response', {
            ...requestData,
            ...responseData
        });

        // Log errors separately
        if (res.statusCode >= 400) {
            logger.error('API Error', {
                ...requestData,
                ...responseData,
                error: (res.locals["error"] as Error)?.stack || 'Unknown error'
            });
        }

        return originalEnd.apply(this, args as any);
    };

    next();
}

export default requestLogger;
