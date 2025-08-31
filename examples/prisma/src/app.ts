import express, { type Express } from "express"
import { userRouter } from "./modules/user";

export const app: Express = express();

app.use(express.json())

app.use("/users", userRouter)
