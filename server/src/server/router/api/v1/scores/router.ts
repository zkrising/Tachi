import { Router } from "express";
import scoreIDRouter from "./_scoreID/router";

const router: Router = Router({ mergeParams: true });

/**
 * No idea yet.
 *
 * @name GET /api/v1/scores
 */
router.get("/", async (req, res) => {});

router.use("/:scoreID", scoreIDRouter);

export default router;
