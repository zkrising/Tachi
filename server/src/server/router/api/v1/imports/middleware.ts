import { RequestHandler } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData, SYMBOL_TachiAPIAuth } from "lib/constants/tachi";
import { AssignToReqTachiData } from "utils/req-tachi-data";

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

export const RequireOwnershipOfImport: RequestHandler = (req, res, next) => {
	const importDoc = req[SYMBOL_TachiData]!.importDoc!;
	const userID = req[SYMBOL_TachiAPIAuth].userID;

	if (userID === null) {
		return res.status(401).json({
			success: false,
			description: `You are not authorised as anyone, and this endpoint requires us to know who you are.`,
		});
	}

	if (importDoc.userID !== userID) {
		return res.status(403).json({
			success: false,
			description: `You are not authorised to perform this action.`,
		});
	}

	return next();
};
