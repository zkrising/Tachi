import arcRouter from "./arc/router";
import fervidexRouter from "./fervidex/router";
import kaiKaiTypeRouter from "./kai/_kaiType/router";
import { Router } from "express";

const router: Router = Router({ mergeParams: true });

router.use("/arc", arcRouter);
router.use("/kai/:kaiType", kaiKaiTypeRouter);
router.use("/fervidex", fervidexRouter);

export default router;
