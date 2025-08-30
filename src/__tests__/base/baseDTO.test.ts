import { describe, it, expect, beforeEach } from "vitest";
import { testUserDTOConfig, TestUserDTO } from "./testDTOImpl"
import { BaseDTO } from "../../base"
import { ZodError } from "zod";
import { ApiError } from "../../utils";

describe("BaseDTO", () => {
    let testUserDTO: BaseDTO;

    beforeEach(() => {
        testUserDTO = (new TestUserDTO()) as BaseDTO;
    })

    describe("Constructor and configuration", () => {
        it("should store the provided configuration", () => {
            expect(testUserDTO.config).toEqual(testUserDTOConfig)
        })
    })

    describe("toCreateDTO", () => {
        it("should validate and return data for a create operation, omitting auto-generated fields", () => {
            const createInput = {
                email: "valid@email.com",
                password: "password123"
            }

            const result = testUserDTO.toCreateDTO(createInput);

            expect(result).not.toHaveProperty("id");
            expect(result).not.toHaveProperty("createdAt");
            expect(result).not.toHaveProperty("updatedAt");
            expect(result).not.toHaveProperty("isDeleted");
        })

        it("should throw a zod error if validation fails for create", () => {
            const invalidInput = {
                // No email provided
                password: "short"
            }

            expect(
                () => testUserDTO.toCreateDTO(invalidInput)
            ).toThrow(ZodError)
        })
    })

    describe("toUpdateDTO", () => {
        it("should validate and return data for an update operation, omitting immutable fields and adding updatedAt", () => {
            const updateInput = {
                email: "new@email.com"
            }

            const result = testUserDTO.toUpdateDTO(updateInput)

            expect(result["email"]).toBe("new@email.com");
            expect(result["updatedAt"]).toBeInstanceOf(Date);
            expect(result).not.toHaveProperty("id");
            expect(result).not.toHaveProperty("createdAt");
        })

        it("should throw an ApiError if no fields are provided for update", () => {
            const updateInput = {}
            expect(
                () => testUserDTO.toUpdateDTO(updateInput)
            ).toThrow(ApiError)
        })

        it("should throw a zod error if validation fails for update", () => {
            const invalidUpdate = {
                email: "not-an-email"
            }

            expect(
                () => testUserDTO.toUpdateDTO(invalidUpdate)
            ).toThrow(ZodError)
        })
    })

    describe("toJSON", () => {
        it("should return the input object unchanged by default", () => {
            const dtoObject = {
                id: 123,
                email: "valid@email.com",
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
            }

            const result = testUserDTO.toJSON(dtoObject)

            expect(result).toEqual(dtoObject)
        })
    })
})
