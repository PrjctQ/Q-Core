import { BaseController } from "@/base"
import { Router } from "express"

/* eslint-disable @typescript-eslint/no-explicit-any */

export class BaseRouter<
    TController extends BaseController = any
> {
    public controller: TController

    constructor({ controller }: {
        controller: TController
    }) {
        this.controller = controller
    }

    public router(): Router {
        const router = Router()

        router.get("/", this.controller.getAll)
        router.get("/:id", this.controller.getById)
        router.post("/", this.controller.post)
        router.put("/:id", this.controller.update)
        router.delete("/:id", this.controller.delete)

        return router;
    }
}
