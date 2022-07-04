import sessionIDRouter from "./_sessionID/router";
import { Router } from "express";

const router: Router = Router({ mergeParams: true });

/**
 * nothing, yet.
 *
 * @name GET /api/v1/sessions
 */
// router.get("/", async (req, res) => {});

router.use("/:sessionID", sessionIDRouter);

export default router;
