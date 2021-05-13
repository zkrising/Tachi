import { Router } from "express";
import directManualIR from "./direct-manual/direct-manual";
import barbatosIR from "./barbatos/barbatos";

const router: Router = Router({ mergeParams: true });

router.use("/direct-manual", directManualIR);
router.use("/barbatos", barbatosIR);

export default router;
