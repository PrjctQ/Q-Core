import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Record } from "@prisma/client/runtime/library";

/* eslint-disable @typescript-eslint/no-explicit-any */

const JWT_SECRET = process.env["ACCESS_TOKEN_SECRET"] as string
const SALT = process.env["SALT"] as string | number

export class AuthUtils {
    public static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, Number(SALT));
    }

    public static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    public static issueToken(
        payload: Record<string, unknown>,
        jwt_secret: string = JWT_SECRET,
        options: Record<string, unknown> = { expiresIn: "2d" }
    ): string {
        return jwt.sign(payload, jwt_secret, options)
    }

    public static verifyToken(
        token: string,
        jwt_secret: string = JWT_SECRET
    ): any {
        return jwt.verify(token, jwt_secret)
    }
}
