import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { CSVParseError, NaiveCSVParse } from "utils/naive-csv-parser";
import type { ParserFunctionReturns } from "../../common/types";
import type { SDVXEamusementCSVData } from "./types";
import type { KtLogger } from "lib/logger/logger";
import type { EmptyObject } from "utils/types";

const HEADER_COUNT = 11;

// A SDVX CSV Row has exactly 11 elements. This is used for type safety.
type SDVXCSVRow = [
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string
];

export default function ParseEamusementSDVXCSV(
	fileData: Express.Multer.File,
	_body: Record<string, unknown>,
	logger: KtLogger
): ParserFunctionReturns<SDVXEamusementCSVData, EmptyObject> {
	let rawHeaders: Array<string>;
	let rawRows: Array<Array<string>>;

	try {
		({ rawHeaders, rawRows } = NaiveCSVParse(fileData.buffer, logger));
	} catch (e) {
		if (e instanceof CSVParseError) {
			throw new ScoreImportFatalError(400, e.message);
		}

		throw e;
	}

	if (rawHeaders.length !== HEADER_COUNT) {
		logger.info(`Invalid CSV header count of ${rawHeaders.length} received.`);
		throw new ScoreImportFatalError(
			400,
			"Invalid CSV provided. CSV does not have the correct number of headers."
		);
	}

	// All of these are guaranteed to not be null by the CSV parser.
	// cells is guaranteed to have a length of exactly 11.
	const iterable = (rawRows as Array<SDVXCSVRow>).map((cells) => ({
		title: cells[0],
		difficulty: cells[1],
		level: cells[2],
		lamp: cells[3],
		score: cells[5],

		// @todo exscore is currently unused, but we should eventually store it.
		// It is 0 if the score was played without S-criticals.
		exscore: cells[6],

		// The other columns (grade, # of different clears) are essentially useless.
		// There is no timestamp :(
	}));

	return {
		iterable,
		context: {},
		game: "sdvx",
		classHandler: null,
	};
}
