import { Router } from "express";
import db from "external/mongo/db";
import {
	CUSTOM_TACHI_BMS_TABLES,
	HandleBMSTableBodyRequest,
	HandleBMSTableHTMLRequest,
	HandleBMSTableHeaderRequest,
} from "lib/game-specific/custom-bms-tables";
import { ValidatePlaytypeFromParamFor } from "server/router/api/v1/games/_game/_playtype/middleware";
import { AssignToReqTachiData, GetTachiData, GetUGPT, GetUser } from "utils/req-tachi-data";
import type { RequestHandler } from "express";

const router: Router = Router({ mergeParams: true });

const FindCustomBMSTable: RequestHandler = (req, res, next) => {
	const { playtype, tableUrlName } = req.params;

	// find the table
	const customTable = CUSTOM_TACHI_BMS_TABLES.find((t) => t.urlName === tableUrlName);

	if (!customTable) {
		return res.status(404).json({
			success: false,
			description: `No such table with the ID '${tableUrlName}' exists.`,
		});
	}

	if (customTable.playtype && customTable.playtype !== playtype) {
		return res.status(404).json({
			success: false,
			description: `The table '${tableUrlName}' exists, but is for ${customTable.playtype}, not ${playtype}.`,
		});
	}

	if (customTable.forSpecificUser !== true) {
		return res.status(404).json({
			success: false,
			description: `The table '${tableUrlName}' exists, but isn't user specific. You should be fetching this table from /api/v1/games instead of /api/v1/users/:userID.`,
		});
	}

	AssignToReqTachiData(req, { customBMSTable: customTable });

	next();
};

/**
 * Return some HTML for this custom table.
 *
 * @note Since this is the UGPT route, trying to fetch GPT custom tables
 * will result in a 404. This applies for all subsequent :tableUrlName routes.
 *
 * @name GET /api/v1/users/:userID/games/bms/:playtype/custom-tables/:tableUrlName
 */
router.get(
	"/:playtype/custom-tables/:tableUrlName",
	ValidatePlaytypeFromParamFor("bms"),
	FindCustomBMSTable,
	(req, res) => {
		const customTable = GetTachiData(req, "customBMSTable");

		// This handles returning a response for us.
		return HandleBMSTableHTMLRequest(customTable, req, res);
	}
);

/**
 * Return the header.json for this custom table.
 *
 * @name GET /api/v1/users/:userID/games/bms/:playtype/custom-tables/:tableUrlName/header.json
 */
router.get(
	"/:playtype/custom-tables/:tableUrlName/header.json",
	ValidatePlaytypeFromParamFor("bms"),
	FindCustomBMSTable,
	(req, res) => {
		const customTable = GetTachiData(req, "customBMSTable");

		// This handles returning a response for us.
		return HandleBMSTableHeaderRequest(customTable, req, res);
	}
);

/**
 * Return the body.json for this custom table.
 *
 * @name GET /api/v1/users/:userID/games/bms/:playtype/custom-tables/:tableUrlName/body.json
 */
router.get(
	"/:playtype/custom-tables/:tableUrlName/body.json",
	ValidatePlaytypeFromParamFor("bms"),
	FindCustomBMSTable,
	(req, res) => {
		const customTable = GetTachiData(req, "customBMSTable");

		// This handles returning a response for us.
		return HandleBMSTableBodyRequest(customTable, req, res);
	}
);

const MD5_CHECKSUM_LENGTH = "60b725f10c9c85c70d97880dfe8191b3".length;
const SHA256_CHECKSUM_LENGTH = "87428fc522803d31065e7bce3cf03fe475096631e5e07bbd7a0fde60c4cf25c7"
	.length;

/**
 * Get this user's best chart on the given chart MD5 or SHA256.
 *
 * @name GET /api/v1/users/:userID/games/bms/:playtype/best-score/:checksum
 */
router.get(
	"/:playtype/best-score/:checksum",
	ValidatePlaytypeFromParamFor("bms"),
	async (req, res) => {
		const user = GetUser(req);

		if (!req.params.checksum) {
			return res.status(400).json({ success: false, description: "No checksum provided." });
		}

		const checksum = req.params.checksum.toLowerCase();

		let query = {};

		if (!/^[0-9a-f]+$/u.exec(checksum)) {
			return res.status(400).json({
				success: false,
				description: "Invalid checksum (Was not a MD5 or SHA256 checksum).",
			});
		}

		if (checksum.length === MD5_CHECKSUM_LENGTH) {
			query = {
				"data.hashMD5": checksum,
			};
		} else if (checksum.length === SHA256_CHECKSUM_LENGTH) {
			query = {
				"data.hashSHA256": checksum,
			};
		} else {
			return res.status(400).json({
				success: false,
				description: "Invalid checksum length (Was not a MD5 or SHA256 checksum).",
			});
		}

		const chart = await db.charts.bms.findOne({
			...query,
		});

		if (!chart) {
			return res
				.status(404)
				.json({ success: false, description: "No chart found with the given checksum." });
		}

		const pb = await db["personal-bests"].findOne({
			game: "bms",
			playtype: chart.playtype,
			userID: user.id,
			chartID: chart.chartID,
		});

		const description = pb ? "Best score found." : "Player has not played this chart.";

		return res.status(200).json({ success: true, description, body: pb });
	}
);

export default router;
