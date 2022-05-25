import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { XMLParser } from "fast-xml-parser";
import p from "prudence";
import { FormatPrError } from "utils/prudence";
import type { ParserFunctionReturns } from "../../common/types";
import type { S3Score } from "./types";
import type { KtLogger } from "lib/logger/logger";
import type { PrudenceSchema } from "prudence";
import type { EmptyObject } from "utils/types";

const PR_SOLID_STATE: PrudenceSchema = {
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

const xmlParser = new XMLParser();

export function ParseSolidStateXML(
	fileData: Express.Multer.File,
	body: Record<string, unknown>,
	logger: KtLogger
): ParserFunctionReturns<S3Score, EmptyObject> {
	let parsedXML;

	try {
		// insanely hacky. This XML parser might return anything, but we still need
		// to traverse it as if it's normal!
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		parsedXML = xmlParser.parse(fileData.buffer.toString("utf-8"));
	} catch (err) {
		logger.info("S3 XML Parse Error", err);

		throw new ScoreImportFatalError(400, "Could not parse XML.");
	}

	// the XML parser can't understand this is meant to be an array
	// if someone only has one score, so we need to override it in that case.
	// However, this results in us having to do some painful by-hand validation.
	// :(

	// @hack Poor typechecking here, but it's kind of painful any way you slice it.
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	let maybeSongs: unknown = parsedXML?.s3data?.scoredata?.song;

	if (maybeSongs === undefined) {
		throw new ScoreImportFatalError(400, `Invalid S3 XML, no s3data -> scoredata -> song?`);
	}

	// If maybeSongs isn't an array, convert it to an array with one element.
	// Note that this is **before** we actually validate it's contents! So even if
	// this results in something stupid like [null], we still reject it in validation.
	if (!Array.isArray(maybeSongs)) {
		maybeSongs = [maybeSongs];
	}

	// Our validator checks the entire XML, lets mutate the original object
	// (which we know to exist now)
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	parsedXML.s3data.scoredata.song = maybeSongs;

	const err = p(parsedXML, PR_SOLID_STATE, {}, { allowExcessKeys: true });

	if (err) {
		throw new ScoreImportFatalError(400, FormatPrError(err, "Invalid S3 XML."));
	}

	return {
		classHandler: null,
		context: {},
		iterable: maybeSongs as Array<S3Score>,
		game: "iidx",
	};
}
