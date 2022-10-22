import arcRouter from "./arc/router";
import fervidexRouter from "./fervidex/router";
import kaiKaiTypeRouter from "./kai/_kaiType/router";
import ksHookSV6CRouter from "./kshook-sv6c/router";
import { Router } from "express";

const router: Router = Router({ mergeParams: true });

router.use("/arc", arcRouter);
router.use("/kai/:kaiType", kaiKaiTypeRouter);
router.use("/fervidex", fervidexRouter);
router.use("/kshook-sv6c", ksHookSV6CRouter);

export default router;
