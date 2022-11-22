import apiRouterV1 from "./api/v1/router";
import irRouter from "./ir/router";
import { RejectIfBanned, SetRequestPermissions } from "../middleware/auth";
import { NormalRateLimitMiddleware } from "../middleware/rate-limiter";
import { Router } from "express";
import { UpdateLastSeen } from "server/middleware/update-last-seen";

const router: Router = Router({ mergeParams: true });

router.use(RejectIfBanned);

router.use("/ir", NormalRateLimitMiddleware, irRouter);

// request perms only apply to the api, IR may reuse this
// but also may require custom authentication.
router.use(SetRequestPermissions);
router.use(UpdateLastSeen);

router.use("/api/v1", apiRouterV1);

export default router;
