import { Router } from "express";
import arcRouter from "./arc/router";
import kaiKaiTypeRouter from "./kai/_kaiType/router";

const router: Router = Router({ mergeParams: true });

router.use("/arc", arcRouter);
router.use("/kai/:kaiType", kaiKaiTypeRouter);

export default router;
