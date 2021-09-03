import { Router } from "express";
import adminRouter from "./admin/router";
import authRouter from "./auth/router";
import importRouter from "./import/router";
import statusRouter from "./status/router";
import usersRouter from "./users/router";
import gamesRouter from "./games/router";
import searchRouter from "./search/router";
import scoresRouter from "./scores/router";
import sessionsRouter from "./sessions/router";
import oauthRouter from "./oauth/router";

const router: Router = Router({ mergeParams: true });

router.use("/admin", adminRouter);
router.use("/auth", authRouter);
router.use("/status", statusRouter);
router.use("/import", importRouter);
router.use("/users", usersRouter);
router.use("/games", gamesRouter);
router.use("/search", searchRouter);
router.use("/scores", scoresRouter);
router.use("/sessions", sessionsRouter);
router.use("/oauth", oauthRouter);

/**
 * Return a JSON 404 response if an endpoint is hit that does not exist.
 *
 * @name ALL /api/v1/*
 */
router.all("*", (req, res) =>
	res.status(404).json({
		success: false,
		description: "Endpoint Not Found.",
	})
);

export default router;
