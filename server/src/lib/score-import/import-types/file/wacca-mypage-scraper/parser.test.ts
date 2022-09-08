import { ParseMyPageScraperRecordsCsv } from "./parser";
import CreateLogCtx from "lib/logger/logger";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import t from "tap";
import { MockMulterFile } from "test-utils/mock-multer";
import { TestingWaccaMyPageScraperRecordsCSV } from "test-utils/test-data";
import type { MyPageRecordsParsedPB } from "./types";

const logger = CreateLogCtx(__filename);

t.test("#ParseMyPageScraperRecordsCSV", (t) => {
	t.test("Valid CSV", (t) => {
		const file = MockMulterFile(TestingWaccaMyPageScraperRecordsCSV, "score.csv");
		const { iterable, game } = ParseMyPageScraperRecordsCsv(file, {}, logger);

		t.equal(game, "wacca");

		const iterableData = iterable as Array<MyPageRecordsParsedPB>;

		// There are more than 280 lines in the file, but this includes song that are
		// never played. The actual number of charts with (non-zero) PBs is 280.
		t.equal(iterableData.length, 280);

		t.end();
	});

	t.end();
});
