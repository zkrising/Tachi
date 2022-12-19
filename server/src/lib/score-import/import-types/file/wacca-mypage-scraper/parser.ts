import { CreateMyPageScraperClassHandler } from "./class-handler";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { parse, CsvError } from "csv-parse/sync";
import p from "prudence";
import type { ParserFunctionReturns } from "../../common/types";
import type { MyPageRecordsRawCsvRecord, MyPageRecordsParsedPB } from "./types";
import type { KtLogger } from "lib/logger/logger";
import type { PrudenceSchema } from "prudence";
import type { EmptyObject } from "utils/types";

// This should match MyPageRecordsRawCsvRecord.
const RECORDS_CSV_SCHEMA: PrudenceSchema = {
	music_id: "string",
	music_title: "string",
	music_levels: "string",
	music_scores: "string",
	music_achieves: "string",
};

const ARRAY_REGEX = /\[(.+?),(.+?),(.+?)(?:,(.+?))?\]/u;

function parseCsvArray(csvString: string): Array<string> {
	const matches = ARRAY_REGEX.exec(csvString);

	if (matches === null) {
		return [];
	}

	const ret: Array<string> = [];

	// index 0 is the whole match, see the docs for RegExp.exec()

	for (let i = 1; i <= 4; i++) {
		const match = matches[i];

		if (typeof match === "undefined") {
			// match group 4 can be missing if the array only has 3 elements
			break;
		}

		ret.push(match);
	}

	return ret;
}

export function ParseMyPageScraperRecordsCsv(
	fileData: Express.Multer.File,
	_body: Record<string, unknown>,
	_logger: KtLogger
): ParserFunctionReturns<MyPageRecordsParsedPB, EmptyObject> {
	let rawCsvRecords: Array<unknown>;

	try {
		rawCsvRecords = parse(fileData.buffer, { columns: true }) as Array<unknown>;
	} catch (err) {
		if (err instanceof CsvError) {
			throw new ScoreImportFatalError(400, `Failed to parse CSV: ${err.message}`);
		}

		throw err;
	}

	for (const rawRecord of rawCsvRecords) {
		const err = p(rawRecord, RECORDS_CSV_SCHEMA, {}, { allowExcessKeys: true });

		if (err) {
			// TODO: add some context so we don't get things like just "Expected string."
			throw new ScoreImportFatalError(
				400,
				`Malformed CSV, invalid column(s) (${err.keychain}: ${err.userVal}): ${err.message}`
			);
		}
	}

	const csvRecords = rawCsvRecords as Array<MyPageRecordsRawCsvRecord>;

	const iterable: Array<MyPageRecordsParsedPB> = [];

	for (const csvRecord of csvRecords) {
		const levels = parseCsvArray(csvRecord.music_levels);
		const scores = parseCsvArray(csvRecord.music_scores);
		const lamps = parseCsvArray(csvRecord.music_achieves);

		for (const [diffIndex, level] of levels.entries()) {
			if (level === "0") {
				// This indicates that the song has no inferno.
				continue;
			}

			const score = Number(scores[diffIndex]);

			if (score === 0) {
				// This inidcates no play, let's not create a PB.
				continue;
			}

			iterable.push({
				songId: Number(csvRecord.music_id),
				songTitle: csvRecord.music_title,
				diffIndex,
				level,
				score,
				lamp: Number(lamps[diffIndex]),
			});
		}
	}

	return {
		iterable,
		context: {},
		game: "wacca",
		classHandler: null,
	};
}

export function ParseMyPageScraperPlayerCsv(
	fileData: Express.Multer.File,
	_body: Record<string, unknown>,
	_logger: KtLogger
): ParserFunctionReturns<never, EmptyObject> {
	let csvRecords: Array<Record<string, string>>;

	try {
		csvRecords = parse(fileData.buffer, { columns: true }) as Array<Record<string, string>>;
	} catch (err) {
		if (err instanceof CsvError) {
			throw new ScoreImportFatalError(400, `Failed to parse CSV: ${err.message}`);
		}

		throw err;
	}

	const csvRecord = csvRecords[0];

	// It's impossible for this to be (false || true), but we need the second one to satisfy TS.

	if (csvRecords.length !== 1 || csvRecord === undefined) {
		throw new ScoreImportFatalError(
			400,
			`Found ${csvRecords.length} records instead of exactly 1 in the player CSV.`
		);
	}

	const stageArrayString = csvRecord.player_stage;

	if (stageArrayString === undefined) {
		throw new ScoreImportFatalError(400, "Malformed CSV: no player_stage column.");
	}

	// The first element is the full match, the next 3 elements are the groups.
	const matches = /\[(\d+),(.+?),(\d+)\]/u.exec(stageArrayString) as
		| [string, string, string, string]
		| null;

	if (matches === null) {
		throw new ScoreImportFatalError(400, "Malformed player_stage entry.");
	}

	const stage = {
		id: Number(matches[1]),
		name: matches[2],
		grade: Number(matches[3]),
	};

	return {
		iterable: [],
		context: {},
		game: "wacca",
		classHandler: CreateMyPageScraperClassHandler(stage),
	};
}
