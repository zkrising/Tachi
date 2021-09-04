import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import prValidate from "server/middleware/prudence-validate";
import { RequireKamaitachi } from "server/middleware/type-require";
import { RequireSelfRequestFromUser } from "../../middleware";
import { optNull } from "utils/prudence";
import { DeleteUndefinedProps } from "utils/misc";

const router: Router = Router({ mergeParams: true });

router.use(RequireKamaitachi);
router.use(RequireSelfRequestFromUser);

/**
 * Retrieve your fervidex settings.
 *
 * @name GET /api/v1/users/:userID/integrations/fervidex/settings
 */
router.get("/settings", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	const settingsDoc = await db["fer-settings"].findOne({
		userID: user.id,
	});

	return res.status(200).json({
		success: true,
		description: `Retrieved Fervidex settings.`,
		body: settingsDoc ?? null,
	});
});

/**
 * Update your fervidex configuration.
 *
 * @param cards - An array of strings to be used as a cards whitelist.
 * @param forceStaticImport - Whether or whether not to force a static import on non-INF2 clients.
 *
 * @name PUT /api/v1/users/:userID/integrations/fervidex/settings
 */
router.patch(
	"/settings",
	prValidate({ cards: optNull(["string"]), forceStaticImport: "*?boolean" }),
	async (req, res) => {
		if (req.body.cards && req.body.cards.length > 6) {
			return res.status(400).json({
				success: false,
				description: `You cannot have more than 6 card filters at once.`,
			});
		}

		const user = req[SYMBOL_TachiData]!.requestedUser!;

		const modifyDocument = req.body;

		DeleteUndefinedProps(modifyDocument);

		if (Object.keys(modifyDocument).length === 0) {
			return res.status(400).json({
				success: false,
				description: `No modifications sent.`,
			});
		}

		await db["fer-settings"].update(
			{ userID: user.id },
			{
				$set: modifyDocument,
			},
			{
				upsert: true,
			}
		);

		const settings = await db["fer-settings"].findOne({ userID: user.id });

		return res.status(200).json({
			success: true,
			description: `Successfully updated settings.`,
			body: settings,
		});
	}
);

export default router;
