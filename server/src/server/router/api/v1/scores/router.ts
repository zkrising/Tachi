import { Router } from "express";
import scoreIDRouter from "./_scoreID/router";

const router: Router = Router({ mergeParams: true });

/**
 * Nothing? Maybe we can think of a good use for this endpoint at some point.
 *
 * @name GET /api/v1/scores/:scoreID
 */
// router.get("/", async (req, res) => {});

router.use("/:scoreID", scoreIDRouter);

export default router;
