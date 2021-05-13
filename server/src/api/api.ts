import { Router } from "express";
import authRouter from "./auth/auth";
import importRouter from "./import/import";
import irRouter from "./ir/ir";

const router: Router = Router({ mergeParams: true });

router.use("/auth", authRouter);
router.use("/import", importRouter);
router.use("/ir", irRouter);

export default router;
