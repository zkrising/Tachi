import SV6CRouter from "./sv6c/router";
import { Router } from "express";

const router: Router = Router({ mergeParams: true });

router.use("/sv6c", SV6CRouter);

export default router;
