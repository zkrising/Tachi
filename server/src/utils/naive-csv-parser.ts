import { KtLogger } from "lib/logger/logger";

export class CSVParseError extends Error {
	constructor(description: string) {
		super(description);
		this.name = "CSVParseError";
	}
}

/**
 * Parse a "naive CSV". A Naive CSV is one that does not properly escape " or , characters.
 * This also means that if konami ever have a song that has a comma, it will cause some serious problems.
 *
 * The reason we have a handrolled CSV parser instead of using an existing library is because eamusement CSVs are
 * invalid -- due to their lack of escaping. We have to do very manual parsing to actually make this work!
 */
export function NaiveCSVParse(csvBuffer: Buffer, logger: KtLogger) {
	const csvString = csvBuffer.toString("utf-8");

	const csvData = csvString.split("\n");

	const rawHeaders = [];
	let headerLen = 0;
	let curStr = "";

	// looks like we're doing it like this.
	for (const char of csvData[0]) {
		headerLen++;

		// safety checks to avoid getting DOS'd
		if (headerLen > 1000) {
			throw new CSVParseError("Headers were longer than 1000 characters long.");
		} else if (rawHeaders.length >= 50) {
			// this does not *really* do what it seems.
			// because there's inevitably something left in curStr in this fn
			// this means that the above check is actually > 50 headers. Not
			// >= 50.
			throw new CSVParseError("Too many CSV headers.");
		}

		if (char === ",") {
			rawHeaders.push(curStr);
			curStr = "";
		} else {
			curStr += char;
		}
	}

	rawHeaders.push(curStr);

	const rawRows = [];

	for (let i = 1; i < csvData.length; i++) {
		const data = csvData[i];

		// @security: This should probably be safetied from DOSing
		const cells = data.split(",");

		// an empty string split on "," is an array with one empty value.
		if (cells.length === 1) {
			logger.verbose(`Skipped empty row ${i}.`);
			continue;
		}

		if (cells.length !== rawHeaders.length) {
			logger.info(
				`csv has row (${i}) with invalid cell count of ${cells.length}, rejecting.`,
				{
					data,
				}
			);
			throw new CSVParseError(
				`Row ${i} has an invalid amount of cells (${cells.length}, expected ${rawHeaders.length}).`
			);
		}

		rawRows.push(cells);
	}

	return {
		rawHeaders,
		rawRows,
	};
}
