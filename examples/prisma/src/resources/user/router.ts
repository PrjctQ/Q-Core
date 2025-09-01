import { ExpressCRUDRouter } from "@prjq/q-core"
import { UserController } from "./user";

const controller = new UserController()

export const userRouter = new ExpressCRUDRouter({ controller })


