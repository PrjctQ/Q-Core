# Utils

The `utils` directory contains essential utility functions and classes that provide cross-cutting functionality throughout the application. These utilities handle common tasks such as error handling, authentication, logging, and response formatting, ensuring consistency and reducing boilerplate code across the codebase.

## File Index

| File | Description | Key Exports |
|------|-------------|-------------|
| `apiError.ts` | Standardized error class for API error handling | `ApiError` |
| `authUtils.ts` | Authentication-related utility functions | `AuthUtils` |
| `catchAsync.ts` | Async error handling wrapper for Express | `catchAsync` |
| `rateLimiter.ts` | Rate limiting middleware for API protection | `apiLimiter` |
| `requestLogger.ts` | Comprehensive request/response logging middleware | `requestLogger` |
| `sendResponse.ts` | Standardized response formatting and sending | `ResponseSender` |
| `index.ts` | Barrel file for convenient utility imports | All utilities |

## Best Practices

1. **Always use `catchAsync`** for async route handlers to prevent unhandled promise rejections
2. **Throw `ApiError`** instead of generic errors for consistent error handling
3. **Use `ResponseSender`** for all responses to maintain consistent API format
4. **Apply rate limiting** to public endpoints to prevent abuse
5. **Keep request logger** enabled in production for monitoring and debugging

## Configuration

Most utilities read configuration from environment variables:

- `ACCESS_TOKEN_SECRET`: JWT secret key
- `SALT`: bcrypt salt rounds
- `NODE_ENV`: Environment mode (development/production)

## Performance Considerations

- Rate limiting and request logging add minimal overhead
- Password hashing is intentionally CPU-intensive (security feature)
- JWT verification is fast and stateless
- File logging uses rotation to prevent disk space issues

## Security Features

- Password hashing with appropriate work factors
- JWT token signing and verification
- Rate limiting to prevent brute force attacks
- Secure cookie options in response sender
- Sensitive data filtering in logs
