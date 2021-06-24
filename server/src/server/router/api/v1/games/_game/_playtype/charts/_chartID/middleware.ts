import { RequestHandler } from "express";
import db from "../../../../../../../../../external/mongo/db";
import { SYMBOL_TachiData } from "../../../../../../../../../lib/constants/tachi";
import { AssignToReqTachiData } from "../../../../../../../../../utils/req-tachi-data";

export const ValidateAndGetChart: RequestHandler = async (req, res, next) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const chart = await db.charts[game].findOne({
		chartID: req.params.chartID,
		playtype, // technically redundant, but we're under playtypes here URL wise.
		// this means we cant match an SP chart when we're under IIDX SP, for
		// example.
	});

	if (!chart) {
		return res.status(404).json({
			success: false,
			description: `The chart ${req.params.chartID} does not exist.`,
		});
	}

	AssignToReqTachiData(req, { chartDoc: chart });

	return next();
};
