import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import prValidate from "server/middleware/prudence-validate";
import { DeleteUndefinedProps } from "utils/misc";
import { FormatUserDoc, GetSettingsForUser } from "utils/user";
import { RequireSelfRequestFromUser } from "../middleware";

const logger = CreateLogCtx(__filename);
const router: Router = Router({ mergeParams: true });

/**
 * Retrieve this users settings. Note that these settings are NOT private.
 *
 * @name GET /api/v1/users/:userID/settings
 */
router.get("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	const settings = await db["user-settings"].findOne({
		userID: user.id,
	});

	if (!settings) {
		logger.severe(`User ${FormatUserDoc(user)} has no settings?`);
		return res.status(500).json({
			success: false,
			description: `An internal server error has occured.`,
		});
	}

	return res.status(200).json({
		success: true,
		description: `Retrieved settings.`,
		body: settings,
	});
});

/**
 * Update a user's settings.
 *
 * @param invisible - Whether to set the user to invisible or not.
 * @param developerMode - Whether to display developer specific information in the WebUI.
 *
 * @name PATCH /api/v1/users/:userID/settings
 */
router.patch(
	"/",
	RequireSelfRequestFromUser,
	prValidate({
		invisible: "*boolean",
		developerMode: "*boolean",
	}),
	async (req, res) => {
		const user = req[SYMBOL_TachiData]!.requestedUser!;

		const preferences = {
			invisible: req.body.invisible,
			developerMode: req.body.developerMode,
		};

		DeleteUndefinedProps(preferences);

		if (Object.keys(preferences).length === 0) {
			return res.status(400).json({
				success: false,
				description: `Nothing was provided to change!`,
			});
		}

		const modifyObject: Record<string, boolean> = {};

		for (const [k, v] of Object.entries(preferences)) {
			modifyObject[`preferences.${k}`] = v;
		}

		await db["user-settings"].update(
			{
				userID: user.id,
			},
			{ $set: modifyObject }
		);

		const settings = await GetSettingsForUser(user.id);

		if (!settings) {
			logger.severe(
				`User ${FormatUserDoc(user)} has no settings, yet just successfully updated them?`,
				{ user }
			);
			return res.status(500).json({
				success: false,
				description: `An internal server error has occured.`,
			});
		}

		if (req.session.tachi?.settings) {
			req.session.tachi.settings = settings;
		}

		return res.status(200).json({
			success: true,
			description: `Updated settings.`,
			body: settings,
		});
	}
);

export default router;
