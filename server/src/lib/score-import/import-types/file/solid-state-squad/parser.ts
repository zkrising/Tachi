import { parse as FastParseXML } from "fast-xml-parser";
import { EmptyObject } from "../../../../../utils/types";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import p, { PrudenceSchema } from "prudence";
import { FormatPrError } from "../../../../../utils/prudence";
import { S3Score } from "./types";
import { ParserFunctionReturns } from "../../common/types";
import { KtLogger } from "../../../../logger/logger";

const PR_SolidState: PrudenceSchema = {
	s3data: {
		userdata: {
			id: p.isPositiveInteger,
			login: "string",
			djname: "string",
		},
		scoredata: {
			song: [
				{
					id: p.isPositiveInteger,
					diff: p.isIn("L7", 7, "A", "B", 5, "L14", 14, "A14", "B14"),
					songname: "string",
					styles: "string",

					exscore: p.isPositiveInteger,
					scorebreakdown: p.optional({
						justgreats: p.isPositiveInteger,
						greats: p.isPositiveInteger,
						good: p.isPositiveInteger,
						bad: p.isPositiveInteger,
						poor: p.isPositiveInteger,
					}),
					mods: {
						hardeasy: p.optional(p.isIn("H", "E")),
					},
					cleartype: p.isIn(
						"played",
						"cleared",
						"combo",
						"comboed",
						"perfect",
						"perfected"
					),
					date: "string",

					// loads of stuff is ignored from this and just defaults to any because we don't use it.
				},
			],
		},
	},
};

export function ParseSolidStateXML(
	fileData: Express.Multer.File,
	body: Record<string, unknown>,
	logger: KtLogger
): ParserFunctionReturns<S3Score, EmptyObject> {
	let parsedXML;

	try {
		parsedXML = FastParseXML(fileData.buffer.toString("utf-8"));
	} catch (err) {
		logger.info(err);

		throw new ScoreImportFatalError(400, "Could not parse XML.");
	}

	if (!parsedXML?.s3data?.scoredata?.song) {
		throw new ScoreImportFatalError(400, `Invalid S3 XML.`);
	}

	// the XML parser can't understand this is meant to be an array
	// if someone only has one score.
	if (!Array.isArray(parsedXML.s3data.scoredata.song)) {
		parsedXML.s3data.scoredata.song = [parsedXML.s3data.scoredata.song];
	}

	const err = p(parsedXML, PR_SolidState, {}, { allowExcessKeys: true });

	if (err) {
		throw new ScoreImportFatalError(400, FormatPrError(err, "Invalid S3 XML."));
	}

	return {
		classHandler: null,
		context: {},
		iterable: parsedXML.s3data.scoredata.song as S3Score[],
		game: "iidx",
	};
}
