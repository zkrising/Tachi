import { RequestHandler } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { AssignToReqTachiData } from "utils/req-tachi-data";
import { ParseStrPositiveInt } from "utils/string-checks";

export const ValidateAndGetSong: RequestHandler = async (req, res, next) => {
	const songID = ParseStrPositiveInt(req.params.songID);

	if (songID === null) {
		return res.status(400).json({
			success: false,
			description: `Invalid songID - could not be converted into integer?`,
		});
	}

	const game = req[SYMBOL_TachiData]!.game!;

	const song = await db.songs[game].findOne({ id: songID });

	if (!song) {
		return res.status(404).json({
			success: false,
			description: `No song exists with the songID ${songID}.`,
		});
	}

	AssignToReqTachiData(req, { songDoc: song });

	return next();
};
