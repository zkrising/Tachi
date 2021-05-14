import { Router } from "express";
import barbatosIR from "./barbatos/barbatos";
import chunitachiIR from "./chunitachi/chunitachi";
import directManualIR from "./direct-manual/direct-manual";
import fervidexIR from "./fervidex/fervidex";

const router: Router = Router({ mergeParams: true });

router.use("/barbatos", barbatosIR);
router.use("/chunitachi", chunitachiIR);
router.use("/direct-manual", directManualIR);
router.use("/fervidex", fervidexIR);

export default router;
