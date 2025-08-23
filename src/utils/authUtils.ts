import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Record } from "@prisma/client/runtime/library";

/* eslint-disable @typescript-eslint/no-explicit-any */

const JWT_SECRET = process.env["ACCESS_TOKEN_SECRET"] as string
const SALT = process.env["SALT"] as string | number

/**
 * Utility class for authentication-related operations
 * Provides static methods for password hashing, verification, and JWT token handling
 */
export class AuthUtils {

    /**
     * Hashes a password using bcrypt
     * @param password - The plain text password to hash
     * @returns Hashed password
     */
    public static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, Number(SALT));
    }

    /**
     * Verifies a password against a hash
     * @param password - Plain text password to verify
     * @param hash - Hash to compare against
     * @returns True if password matches hash
     */
    public static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Issues a JWT token
     * @param payload - Data to include in the token
     * @param jwt_secret - Secret key for signing (default: ACCESS_TOKEN_SECRET)
     * @param options - JWT options like expiresIn
     * @returns Signed JWT token
     */
    public static issueToken(
        payload: Record<string, unknown>,
        jwt_secret: string = JWT_SECRET,
        options: Record<string, unknown> = { expiresIn: "2d" }
    ): string {
        return jwt.sign(payload, jwt_secret, options)
    }

    /**
     * Verifies and decodes a JWT token
     * @param token - JWT token to verify
     * @param jwt_secret - Secret key for verification
     * @returns Decoded token payload
     */
    public static verifyToken(
        token: string,
        jwt_secret: string = JWT_SECRET
    ): any {
        return jwt.verify(token, jwt_secret)
    }
}
