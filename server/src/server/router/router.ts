import { Router } from "express";
import { SetRequestPermissions } from "../middleware/auth";
import { RateLimitMiddleware } from "../middleware/rate-limiter";
import apiRouterV1 from "./api/v1/router";
import irRouter from "./ir/router";

const router: Router = Router({ mergeParams: true });

// Add APIAuth and RateLimiting
router.use(SetRequestPermissions, RateLimitMiddleware);

router.use("/api/v1", apiRouterV1);
router.use("/ir", irRouter);

export default router;
