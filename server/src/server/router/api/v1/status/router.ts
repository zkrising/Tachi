import { Router } from "express";
import { SYMBOL_TachiAPIAuth } from "lib/constants/tachi";
import { FormatVersion } from "lib/constants/version";

const router: Router = Router({ mergeParams: true });

/**
 * Returns the current status of the Tachi Server.
 *
 * @name GET /api/v1/status
 */
router.get("/", (req, res) => {
	let echo;
	if (req.query.echo && typeof req.query.echo === "string") {
		echo = req.query.echo;
	}

	return res.status(200).json({
		success: true,
		description: "Status check successful.",
		body: {
			serverTime: Date.now(),
			version: FormatVersion(),
			whoami: req[SYMBOL_TachiAPIAuth].userID,
			// converts {foo: true, bar: false, baz: true} into [foo, baz]
			permissions: Object.entries(req[SYMBOL_TachiAPIAuth].permissions)
				.filter((e) => e[1])
				.map((e) => e[0]),
			echo,
		},
	});
});

/**
 * Returns the current status of the Tachi Server, but as a POST
 * request, for that kind of testing.
 *
 * @name POST /api/v1/status
 */
router.post("/", (req, res) => {
	let echo;
	if (req.body.echo && typeof req.body.echo === "string") {
		echo = req.body.echo;
	}

	return res.status(200).json({
		success: true,
		description: "Status check successful.",
		body: {
			serverTime: Date.now(),
			version: FormatVersion(),
			whoami: req[SYMBOL_TachiAPIAuth].userID,
			// converts {foo: true, bar: false, baz: true} into [foo, baz]
			permissions: Object.entries(req[SYMBOL_TachiAPIAuth].permissions)
				.filter((e) => e[1])
				.map((e) => e[0]),
			echo,
		},
	});
});

export default router;
