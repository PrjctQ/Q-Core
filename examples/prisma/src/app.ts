import express, { type Express } from "express"
import { userRouter } from "./resources/user";

export const app: Express = express();

app.use(express.json())

app.use("/users", userRouter.router)
