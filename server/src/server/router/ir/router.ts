import { Router } from "express";
import {
	FervidexStyleRequireNotGuest,
	RequireNotGuest,
	SetFervidexStyleRequestPermissions,
	SetRequestPermissions,
} from "../../middleware/auth";
import { RequireBokutachi, RequireKamaitachi } from "../../middleware/type-require";
import barbatosIR from "./barbatos/router";
import beatorajaIR from "./beatoraja/router";
import directManualIR from "./direct-manual/router";
import fervidexIR from "./fervidex/router";
import ksHookIR from "./kshook/router";
import uscIR from "./usc/router";

const router: Router = Router({ mergeParams: true });

// Common IRs

router.use("/direct-manual", SetRequestPermissions, RequireNotGuest, directManualIR);
router.use("/kshook", SetFervidexStyleRequestPermissions, FervidexStyleRequireNotGuest, ksHookIR);

// Bokutachi IRs

// note: this is the only IR that cannot use SetRequestPermissions for its
// auth, because the USCIR spec requires a different set of response
// codes for auth.
router.use("/usc", RequireBokutachi, uscIR);
router.use("/beatoraja", SetRequestPermissions, RequireBokutachi, beatorajaIR);

// Kamaitachi IRs

router.use("/barbatos", SetRequestPermissions, RequireNotGuest, RequireKamaitachi, barbatosIR);
router.use(
	"/fervidex",
	SetFervidexStyleRequestPermissions,
	FervidexStyleRequireNotGuest,
	RequireKamaitachi,
	fervidexIR
);

export default router;
