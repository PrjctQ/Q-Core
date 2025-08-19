export const errorCode = {
    duplicateEntry: "DUPLICATE_ENTRY",
    foreignConstraint: "FOREIGN_KEY_CONSTRAINT",
    notFound: "RESOURCE_NOT_FOUND",
    database: "DATABASE_ERROR",
    validation: "VALIDATION_ERROR",
    internalError: "INTERNAL_SERVER_ERROR",
    http: "HTTP_ERROR",
    unknown: "UNKNOWN",
    badRequest: "BAD_REQUEST",
    unauthorized: "UNAUTHORIZED",
    forbidden: "FORBIDDEN",
    conflict: "CONFLICT"
} as const

export type ErrorCode = typeof errorCode[keyof typeof errorCode];
