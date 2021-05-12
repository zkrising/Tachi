import { Router } from "express";
import { RequireLoggedIn } from "../../../middleware/require-logged-in";

const router = Router({ mergeParams: true });

/**
 * Imports scores in ir/json:direct-manual form.
 * @name /api/ir/direct-manual/import
 */
router.post("/import", RequireLoggedIn, async (req, res) => {});

export default router;
