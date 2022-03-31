import { Router } from "express";
import goalsRouter from "./goals/router";
import milestonesRouter from "./milestones/router";

const router: Router = Router({ mergeParams: true });

router.use("/goals", goalsRouter);
router.use("/milestones", milestonesRouter);

export default router;
