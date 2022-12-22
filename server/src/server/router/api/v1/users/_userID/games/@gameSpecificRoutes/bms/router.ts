import { Router } from "express";
import {
	CUSTOM_TACHI_BMS_TABLES,
	HandleBMSTableBodyRequest,
	HandleBMSTableHTMLRequest,
	HandleBMSTableHeaderRequest,
} from "lib/game-specific/custom-bms-tables";
import { ValidatePlaytypeFromParamFor } from "server/router/api/v1/games/_game/_playtype/middleware";
import { AssignToReqTachiData, GetTachiData } from "utils/req-tachi-data";
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

export default router;
