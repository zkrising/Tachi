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
import lr2hookIR from "./lr2hook/router";

const router: Router = Router({ mergeParams: true });

// Common IRs

router.use("/direct-manual", SetRequestPermissions, RequireNotGuest, directManualIR);

// Bokutachi IRs

// note: this is the only IR that cannot use SetRequestPermissions for its
// auth, because the USCIR spec requires a different set of response
// codes for auth.
router.use("/usc", RequireBokutachi, uscIR);
router.use("/beatoraja", SetRequestPermissions, RequireNotGuest, RequireBokutachi, beatorajaIR);
router.use("/lr2hook", SetRequestPermissions, RequireNotGuest, RequireBokutachi, lr2hookIR);

// Kamaitachi IRs

router.use(
	"/kshook",
	RequireKamaitachi,
	SetFervidexStyleRequestPermissions,
	FervidexStyleRequireNotGuest,
	ksHookIR
);
router.use("/barbatos", SetRequestPermissions, RequireNotGuest, RequireKamaitachi, barbatosIR);
router.use(
	"/fervidex",
	SetFervidexStyleRequestPermissions,
	FervidexStyleRequireNotGuest,
	RequireKamaitachi,
	fervidexIR
);

export default router;
