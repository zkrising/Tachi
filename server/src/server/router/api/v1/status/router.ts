import { Router } from "express";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import { VERSION_PRETTY } from "lib/constants/version";

const router: Router = Router({ mergeParams: true });

const startTime = Date.now();

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
			startTime,
			version: VERSION_PRETTY,
			whoami: req[SYMBOL_TACHI_API_AUTH].userID,

			// converts {foo: true, bar: false, baz: true} into [foo, baz]
			permissions: Object.entries(req[SYMBOL_TACHI_API_AUTH].permissions)
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

	if (req.safeBody.echo && typeof req.safeBody.echo === "string") {
		echo = req.safeBody.echo;
	}

	return res.status(200).json({
		success: true,
		description: "Status check successful.",
		body: {
			serverTime: Date.now(),
			startTime,
			version: VERSION_PRETTY,
			whoami: req[SYMBOL_TACHI_API_AUTH].userID,

			// converts {foo: true, bar: false, baz: true} into [foo, baz]
			permissions: Object.entries(req[SYMBOL_TACHI_API_AUTH].permissions)
				.filter((e) => e[1])
				.map((e) => e[0]),
			echo,
		},
	});
});

export default router;
