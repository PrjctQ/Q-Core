import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthUtils } from "../../utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

vi.mock("bcrypt");
vi.mock("jsonwebtoken");

// vi.mock("../../src/utils/authUtils", async () => {
//     const actual = await vi.importActual<typeof import("../../utils/authUtils")>(
//         "../../utils/authUtils"
//     )
//     return {
//         ...actual,
//         JWT_SECRET: "test-jwt-secret",
//         SALT: 10
//     }
// })

describe("AuthUtils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    describe("hashPassword", () => {
        it("should hash a password using bcrypt with the default salt", async () => {
            const testPassword = "my_super_safe_password_UwU";
            const mockHash = "mock_hash_password";

            vi.mocked(bcrypt.hash).mockResolvedValue(mockHash as never)

            const result = await AuthUtils.hashPassword(testPassword);

            expect(bcrypt.hash).toHaveBeenCalledOnce();
            expect(bcrypt.hash).toHaveBeenCalledWith(testPassword, 0);

            expect(result).toBe(mockHash)
        })
    })

    describe("verifyPassword", () => {
        it("should return true if bcrypt confirms the password matches the hash", async () => {
            const testPassword = "my_secret_pass_UwU";
            const testHash = "mock_hash_UwU"

            vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

            const result = await AuthUtils.verifyPassword(testPassword, testHash)

            expect(bcrypt.compare).toHaveBeenCalledWith(testPassword, testHash)
            expect(result).toBe(true)
        })

        it("should return false if bcrypt confirms the password does NOT match the hash", async () => {
            const testPassword = "wrongPassword";
            const testHash = "some_hashed_value";

            vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

            const result = await AuthUtils.verifyPassword(testPassword, testHash)

            expect(bcrypt.compare).toHaveBeenCalledWith(testPassword, testHash)
            expect(result).toBe(false)
        })
    })

    describe("issueToken", () => {
        it("should sign a token using jwt.sign with the default secret and options", async () => {
            const payload = {
                value: "some payload value"
            };
            const secret = "q124234";
            const options = {
                expiresIn: "1d"
            };
            const mockToken = "mock.jwt.token"

            vi.mocked(jwt.sign).mockResolvedValue(mockToken as never)

            const result = await AuthUtils.issueToken(payload, secret, options);

            expect(jwt.sign).toHaveBeenCalledWith(payload, secret, options);
            expect(result).toBe(mockToken);
        })
    })

    describe("verifyToken", () => {
        it("should verify and decode a token using the secret", async () => {
            const mockedDecode = {
                user_id: "123"
            }
            const testSecret = "custom-secret"
            const testToken = "some.jwt.token"

            vi.mocked(jwt.verify).mockResolvedValue(mockedDecode as never)

            const result = await AuthUtils.verifyToken(testToken, testSecret)

            expect(jwt.verify).toHaveBeenCalledWith(testToken, testSecret)
            expect(result).toEqual(mockedDecode);
        })

        it("should throw an error if jwt.verify fails", () => {
            const invalidToken = "expired.token";
            const error = new Error("Invalid token");

            vi.mocked(jwt.verify).mockImplementation(() => {
                throw error;
            });

            expect(() => AuthUtils.verifyToken(invalidToken)).toThrow(error)
        })
    })
})
