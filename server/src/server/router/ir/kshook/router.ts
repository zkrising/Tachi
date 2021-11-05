import { Router } from "express";
import sv3cRouter from "./sv3c/router";

const router: Router = Router({ mergeParams: true });

router.use("/sv3c", sv3cRouter);

export default router;
