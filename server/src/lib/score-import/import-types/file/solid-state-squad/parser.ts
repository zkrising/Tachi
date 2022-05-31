import { XMLParser } from "fast-xml-parser";
import { KtLogger } from "lib/logger/logger";
import p, { PrudenceSchema } from "prudence";
import { FormatPrError } from "utils/prudence";
import { EmptyObject } from "utils/types";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { ParserFunctionReturns } from "../../common/types";
import { S3Score } from "./types";

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

					// https://github.com/TNG-dev/tachi-server/issues/718
					// The song title '.59' is automatically coerced into a float
					// by our XML parser. Despite the fact that it's in a CData field.
					// Regardless of the mess that is XML, we need to accept numbers in
					// this field, and then convert them back to strings later.
					//
					// Making a proper solution for this isn't possible, as the bowels
					// of the XML parser are inaccessible to us.
					// I *hate* XML.
					//
					// What a disaster.
					songname: p.or("string", p.is(0.59)),
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

// .59 is a song that is interpreted as a float by our XML parser.
type PreStringifiedS3Score = Omit<S3Score, "songname"> & { songname: 0.59 | string };

export function ParseSolidStateXML(
	fileData: Express.Multer.File,
	body: Record<string, unknown>,
	logger: KtLogger
): ParserFunctionReturns<S3Score, EmptyObject> {
	let parsedXML;

	try {
		parsedXML = xmlParser.parse(fileData.buffer.toString("utf-8"));
	} catch (err) {
		logger.info("S3 XML Parse Error", err);

		throw new ScoreImportFatalError(400, "Could not parse XML.");
	}

	if (!parsedXML?.s3data?.scoredata?.song) {
		throw new ScoreImportFatalError(400, `Invalid S3 XML, no s3data -> scoredata -> song?`);
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

	let scoreData = parsedXML.s3data.scoredata.song as PreStringifiedS3Score[];

	scoreData = scoreData.map((e) => ({
		...e,
		// Songnames here are either numbers or strings due to a disgusting hack
		// @see #718
		// We forcibly convert all these back to strings.
		// Note that we can't even use the generic solution .toString, because the
		// song title is .59, not 0.59.
		// This is genuinely horrific.
		songname: e.songname === 0.59 ? ".59" : e.songname,
	}));

	return {
		classHandler: null,
		context: {},
		iterable: scoreData as S3Score[],
		game: "iidx",
	};
}
