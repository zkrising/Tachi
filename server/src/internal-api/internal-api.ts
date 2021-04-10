import { Router } from "express";
import authRouter from "./auth/auth";
import importRouter from "./import/import";

const router = Router({ mergeParams: true });

router.use("/auth", authRouter);
router.use("/import", importRouter);

export default router;
