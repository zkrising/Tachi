import { Router } from "express";
import { RateLimitMiddleware } from "../middleware/rate-limiter";
import apiRouterV1 from "./api/v1/router";
import irRouter from "./ir/router";

const router: Router = Router({ mergeParams: true });

router.use(RateLimitMiddleware);

router.use("/api/v1", apiRouterV1);
router.use("/ir", irRouter);

export default router;
