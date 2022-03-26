import { Router } from "express";
import goalsRouter from "./goals/router";

const router: Router = Router({ mergeParams: true });

router.use("/goals", goalsRouter);

export default router;
