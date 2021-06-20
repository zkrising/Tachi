import { Router } from "express";
import { SYMBOL_TachiAPIAuth } from "../../../../../lib/constants/tachi";
import { FormatVersion } from "../../../../../lib/constants/version";

const router: Router = Router({ mergeParams: true });

router.get("/", (req, res) => {
	let echo;
	if (req.query.echo && typeof req.query.echo === "string") {
		echo = req.query.echo;
	}

	res.status(200).json({
		success: true,
		description: "Status check successful.",
		body: {
			serverTime: Date.now(),
			version: FormatVersion(),
			// converts {foo: true, bar: false, baz: true} into [foo, baz]
			permissions: Object.entries(req[SYMBOL_TachiAPIAuth].permissions)
				.filter((e) => e[1])
				.map((e) => e[0]),
			echo,
		},
	});
});

router.post("/", (req, res) => {
	let echo;
	if (req.body.echo && typeof req.body.echo === "string") {
		echo = req.body.echo;
	}

	res.status(200).json({
		success: true,
		description: "Status check successful.",
		body: {
			serverTime: Date.now(),
			version: FormatVersion(),
			// converts {foo: true, bar: false, baz: true} into [foo, baz]
			permissions: Object.entries(req[SYMBOL_TachiAPIAuth].permissions)
				.filter((e) => e[1])
				.map((e) => e[0]),
			echo,
		},
	});
});

export default router;
