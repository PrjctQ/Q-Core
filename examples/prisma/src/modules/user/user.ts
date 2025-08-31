import {
    BaseDTO,
    PrismaDAO,
    BaseService,
    BaseController
} from "@prjq/q-core"
import z from "zod"

// Creating schema for DTO
const userSchema = z.object({
    id: z.uuid(),
    username: z.string(),
    email: z.email(),
    password: z.string().min(8),
    isDeleted: z.boolean().default(false)
})

export class UserDTO extends BaseDTO {
    constructor() {
        super({
            baseSchema: userSchema,
            commonFields: {
                idField: "id",
                isDeletedField: "isDeleted"
            }
        })
    }
}

export class UserDAO extends PrismaDAO<UserDTO> {
    constructor() {
        super({
            modelName: "user",
            dto: new UserDTO()
        })
    }
}

export class UserService extends BaseService<UserDAO> {
    constructor() {
        super({
            dao: new UserDAO()
        })
    }
}

export class UserController extends BaseController<UserService> {
    constructor() {
        super({
            service: new UserService()
        })
    }
}
