import { RequestHandler } from "express";
import db from "external/mongo/db";
import { AssignToReqTachiData, GetGPT } from "utils/req-tachi-data";

export const GetFolderFromParam: RequestHandler = async (req, res, next) => {
	const { game, playtype } = GetGPT(req);

	const folder = await db.folders.findOne({ folderID: req.params.folderID, game, playtype });

	if (!folder) {
		return res.status(404).json({
			success: false,
			description: `This folder does not exist.`,
		});
	}

	AssignToReqTachiData(req, { folderDoc: folder });

	return next();
};
