import { RequestHandler } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData, SYMBOL_TachiAPIAuth } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { AssignToReqTachiData } from "utils/req-tachi-data";
import { IsUserIDAdmin } from "utils/user";

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

	return next();
};

export const RequireOwnershipOfImportOrAdmin: RequestHandler = async (req, res, next) => {
	const importDoc = req[SYMBOL_TachiData]!.importDoc!;
	const userID = req[SYMBOL_TachiAPIAuth].userID;

	if (userID === null) {
		return res.status(401).json({
			success: false,
			description: `You are not authorised as anyone, and this endpoint requires us to know who you are.`,
		});
	}

	if (importDoc.userID !== userID) {
		if (await IsUserIDAdmin(userID)) {
			logger.info(`Admin ${userID} interacted with someone elses import.`);
			return next();
		}

		return res.status(403).json({
			success: false,
			description: `You are not authorised to perform this action.`,
		});
	}

	return next();
};
