import { BaseDTO, DTOConfig } from "@/base";
import z from "zod";

// Create user schema that represents user entity
export const testUserSchema = z.object({
    id: z.uuid(),
    email: z.email(),
    password: z.string().min(8),
    createdAt: z.date(),
    updatedAt: z.date(),
    isDeleted: z.boolean()
})

// Define config for the DTO class for test DTO
export const testUserDTOConfig: DTOConfig = {
    baseSchema: testUserSchema,
    autoFields: {
        idField: "id",
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        isDeletedField: "isDeleted",
    }
}

// Concrete test class that extends the base class
export class TestUserDTO extends BaseDTO {
    public override config: DTOConfig;
    constructor() {
        super(testUserDTOConfig)
        this.config = testUserDTOConfig
    }
}
