import { Router } from "express";
import directManualIR from "./direct-manual/direct-manual";

const router: Router = Router({ mergeParams: true });

router.use("/direct-manual", directManualIR);

export default router;
