import { Router } from "express";
import sessionIDRouter from "./_sessionID/router";

const router: Router = Router({ mergeParams: true });

/**
 * nothing, yet.
 *
 * @name GET /api/v1/sessions
 */
// router.get("/", async (req, res) => {});

router.use("/:sessionID", sessionIDRouter);

export default router;
