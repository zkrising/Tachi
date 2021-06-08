import { Router } from "express";
import barbatosIR from "./barbatos/router";
import chunitachiIR from "./chunitachi/router";
import directManualIR from "./direct-manual/router";
import fervidexIR from "./fervidex/router";
import uscIR from "./usc/router";
import beatorajaIR from "./beatoraja/router";
import { RequireBokutachi, RequireKamaitachi } from "../../middleware/type-require";

const router: Router = Router({ mergeParams: true });

// Common IRs

router.use("/direct-manual", directManualIR);

// Bokutachi IRs

router.use("/usc", RequireBokutachi, uscIR);
router.use("/beatoraja", RequireBokutachi, beatorajaIR);

// Kamaitachi IRs

router.use("/barbatos", RequireKamaitachi, barbatosIR);
router.use("/chunitachi", RequireKamaitachi, chunitachiIR);
router.use("/fervidex", RequireKamaitachi, fervidexIR);

export default router;
