import { Router } from "express";
import authRouter from "./auth/router";
import importRouter from "./import/router";
import irRouter from "../../ir/router";

const router: Router = Router({ mergeParams: true });

router.use("/auth", authRouter);
router.use("/import", importRouter);
router.use("/ir", irRouter);

export default router;
