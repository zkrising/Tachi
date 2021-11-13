import { Router } from "express";
import uscirRouter from "./_playtype/router";

const router: Router = Router({ mergeParams: true });

router.use((req, res, next) => {
	if (req.params.playtype !== "Keyboard" && req.params.playtype !== "Controller") {
		return res.status(400).json({
			success: false,
			description: "Invalid playtype. Expected Keyboard or Controller.",
		});
	}

	return next();
});

router.use("/:playtype", uscirRouter);

export default router;
