import { Router } from "express";
import { UserController } from "./user";

export const userRouter: Router = Router()
const controller = new UserController()

userRouter.get("/", controller.get)
userRouter.get("/:id", controller.getById)
userRouter.post("/", controller.post)
userRouter.put("/:id", controller.update)
userRouter.delete("/:id", controller.delete)
