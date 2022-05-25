import ParseEamusementSDVXCSV from "./parser";
import CreateLogCtx from "lib/logger/logger";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import t from "tap";
import { MockMulterFile } from "test-utils/mock-multer";
import { TestingSDVXEamusementCSV } from "test-utils/test-data";
import type { SDVXEamusementCSVData } from "./types";

const logger = CreateLogCtx(__filename);

t.test("#ParseEamusementSDVXCSV", (t) => {
	t.test("Valid CSV", (t) => {
		const file = MockMulterFile(TestingSDVXEamusementCSV, "score.csv");

		const { iterable, game } = ParseEamusementSDVXCSV(file, {}, logger);

		t.equal(game, "sdvx");

		const iterableData = iterable as Array<SDVXEamusementCSVData>;

		t.equal(iterableData.length, 204);

		t.end();
	});

	t.test("Broken CSV", (t) => {
		const buffer = Buffer.from(`${"a,".repeat(10)}a\n${"a,".repeat(3)}a`);

		const file = MockMulterFile(buffer, "score.csv");

		t.throws(
			() => ParseEamusementSDVXCSV(file, {}, logger),
			new ScoreImportFatalError(400, "Row 1 has an invalid amount of cells (4, expected 11)")
		);

		t.end();
	});

	t.test("Wrong number of headers", (t) => {
		const buffer = Buffer.from(`${"a,".repeat(15)}a\n`.repeat(3));

		const file = MockMulterFile(buffer, "score.csv");

		t.throws(
			() => ParseEamusementSDVXCSV(file, {}, logger),
			new ScoreImportFatalError(
				400,
				"Invalid CSV provided. CSV does not have the correct number of headers."
			),
			"Should throw an error on no headers."
		);

		t.end();
	});

	t.end();
});
