import { Router } from "express";
import apiRouter from "./api/router";
import irRouter from "./ir/router";

const router: Router = Router({ mergeParams: true });

router.use("/api/v1", apiRouter);
router.use("/ir", irRouter);

export default router;
