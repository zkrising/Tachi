import db from "external/mongo/db";
import { SYMBOL_TACHI_DATA, SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { AssignToReqTachiData } from "utils/req-tachi-data";
import { IsRequesterAdmin } from "utils/user";
import type { RequestHandler } from "express";

const logger = CreateLogCtx(__filename);

export const GetImportFromParam: RequestHandler = async (req, res, next) => {
	const importDoc = await db.imports.findOne({ importID: req.params.importID });

	if (!importDoc) {
		return res.status(404).json({
			success: false,
			description: `This import does not exist.`,
		});
	}

	AssignToReqTachiData(req, { importDoc });

	next();
};

export const RequireOwnershipOfImportOrAdmin: RequestHandler = async (req, res, next) => {
	const importDoc = req[SYMBOL_TACHI_DATA]!.importDoc!;
	const userID = req[SYMBOL_TACHI_API_AUTH].userID;

	if (userID === null) {
		return res.status(401).json({
			success: false,
			description: `You are not authorised as anyone, and this endpoint requires us to know who you are.`,
		});
	}

	if (importDoc.userID !== userID) {
		if (await IsRequesterAdmin(req[SYMBOL_TACHI_API_AUTH])) {
			logger.info(`Admin ${userID} interacted with someone elses import.`);
			next();
			return;
		}

		return res.status(403).json({
			success: false,
			description: `You are not authorised to perform this action.`,
		});
	}

	next();
};
