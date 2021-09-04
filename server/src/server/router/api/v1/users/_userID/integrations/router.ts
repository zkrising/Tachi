import { Router } from "express";
import fervidexRouter from "./fervidex/router";
import arcRouter from "./arc/router";
import kaiKaiTypeRouter from "./kai/_kaiType/router";

const router: Router = Router({ mergeParams: true });

router.use("/arc", arcRouter);
router.use("/kai/:kaiType", kaiKaiTypeRouter);
router.use("/fervidex", fervidexRouter);

export default router;
