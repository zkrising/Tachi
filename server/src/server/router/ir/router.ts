import { Router } from "express";
import barbatosIR from "./barbatos/router";
import chunitachiIR from "./chunitachi/router";
import directManualIR from "./direct-manual/router";
import fervidexIR from "./fervidex/router";
import uscIR from "./usc/router";
import beatorajaIR from "./beatoraja/router";

const router: Router = Router({ mergeParams: true });

router.use("/barbatos", barbatosIR);
router.use("/chunitachi", chunitachiIR);
router.use("/direct-manual", directManualIR);
router.use("/fervidex", fervidexIR);
router.use("/usc", uscIR);
router.use("/beatoraja", beatorajaIR);

export default router;
