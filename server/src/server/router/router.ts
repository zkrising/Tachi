import { Router } from "express";
import { UpdateLastSeen } from "server/middleware/update-last-seen";
import { SetRequestPermissions } from "../middleware/auth";
import { RateLimitMiddleware } from "../middleware/rate-limiter";
import apiRouterV1 from "./api/v1/router";
import irRouter from "./ir/router";

const router: Router = Router({ mergeParams: true });

// Add APIAuth and RateLimiting
router.use(RateLimitMiddleware);

router.use("/ir", irRouter);

// request perms only apply to the api, IR may reuse this
// but also may require custom authentication.
router.use(SetRequestPermissions);
router.use(UpdateLastSeen);

router.use("/api/v1", apiRouterV1);

export default router;
