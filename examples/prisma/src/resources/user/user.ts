import { Q } from "@prjq/q-core"
import z from "zod"

// Creating schema for DTO
const userSchema = z.object({
    id: z.uuid(),
    username: z.string(),
    email: z.email(),
    password: z.string().min(8),
    isDeleted: z.boolean().default(false)
})

export const userRouter = Q.router({
    name: "user",
    baseSchema: userSchema,
    autoFields: {
        idField: "id",
        isDeletedField: "isDeleted"
    }
})
