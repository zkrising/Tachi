import { Router } from "express";
import directManualIR from "./direct-manual/direct-manual";
import barbatosIR from "./barbatos/barbatos";
import fervidexIR from "./fervidex/fervidex";

const router: Router = Router({ mergeParams: true });

router.use("/direct-manual", directManualIR);
router.use("/barbatos", barbatosIR);
router.use("/fervidex", fervidexIR);

export default router;
