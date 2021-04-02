import { Router } from "express";
import authRouter from "./auth/auth";

const router = Router({ mergeParams: true });

router.use("/auth", authRouter);

export default router;
