import { ParseMyPageScraperRecordsCsv, ParseMyPageScraperPlayerCsv } from "./parser";
import CreateLogCtx from "lib/logger/logger";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import { WACCA_STAGEUPS } from "lib/constants/classes";
import t from "tap";
import { MockMulterFile } from "test-utils/mock-multer";
import { TestingWaccaMyPageScraperRecordsCSV } from "test-utils/test-data";
import type { MyPageRecordsParsedPB } from "./types";

const logger = CreateLogCtx(__filename);

t.test("#ParseMyPageScraperRecordsCSV", (t) => {
	t.test("Valid CSV", (t) => {
		// This example file is cg505's actual records dump.
		const file = MockMulterFile(TestingWaccaMyPageScraperRecordsCSV, "records.csv");
		const { iterable, game } = ParseMyPageScraperRecordsCsv(file, {}, logger);

		t.equal(game, "wacca");

		const iterableData = iterable as Array<MyPageRecordsParsedPB>;

		// Each line in the file corresponds to a song, not a chart. So one line
		// can have up to 4 PBs. There are more than 280 lines in the file, but
		// this includes songs that are never played. The actual number of
		// charts with (non-zero) PBs is 280.
		t.equal(iterableData.length, 280);

		t.end();
	});

	t.test("Correctly parse CSV", (t) => {
		const buffer = Buffer.from("music_id,music_title,music_artist,music_genre,music_levels,music_play_counts,music_scores,music_achieves\n3080,Avenue,aran,6,\"[3,7+,12+,0]\",\"[0,0,12]\",\"[0,0,996952]\",\"[0,0,3]\"");

		const file = MockMulterFile(buffer, "records.csv");

		const { iterable, game } = ParseMyPageScraperRecordsCsv(file, {}, logger);

		t.equal(game, "wacca");

		t.strictSame(iterable, [{
			songId: 3080,
			songTitle: "Avenue",
			diffIndex: 2,
			level: "12+",
			score: 996952,
			lamp: 3,
		}]);

		t.end();
	});

	t.test("Malformed CSV", (t) => {
		// Missing music_id in the record
		const buffer = Buffer.from("music_id,music_title,music_artist,music_genre,music_levels,music_play_counts,music_scores,music_achieves\nAvenue,aran,6,\"[3,7+,12+,0]\",\"[0,0,12]\",\"[0,0,996952]\",\"[0,0,3]\"");

		const file = MockMulterFile(buffer, "records.csv");

		t.throws(
			() => ParseMyPageScraperRecordsCsv(file, {}, logger),
			new ScoreImportFatalError(400, "Failed to parse CSV: Invalid Record Length: columns length is 8, got 7 on line 2")
		);

		t.end();
	});

	t.test("CSV with wrong headers", (t) => {
		// not_music_title instead of music_title
		const buffer = Buffer.from("music_id,not_music_title,music_artist,music_genre,music_levels,music_play_counts,music_scores,music_achieves\n3080,Avenue,aran,6,\"[3,7+,12+,0]\",\"[0,0,12]\",\"[0,0,996952]\",\"[0,0,3]\"");

		const file = MockMulterFile(buffer, "records.csv");

		t.throws(
			() => ParseMyPageScraperRecordsCsv(file, {}, logger),
			new ScoreImportFatalError(400, "Malformed CSV, invalid column(s) (music_title: undefined): Expected string.")
		);

		t.end();
	});

	t.test("CSV with missing headers", (t) => {
		// missing music_achieves
		const buffer = Buffer.from("music_id,music_title,music_levels,music_scores\n3080,Avenue,\"[3,7+,12+,0]\",\"[0,0,996952]\"");

		const file = MockMulterFile(buffer, "records.csv");

		t.throws(
			() => ParseMyPageScraperRecordsCsv(file, {}, logger),
			new ScoreImportFatalError(400, "Malformed CSV, invalid column(s) (music_achieves: undefined): Expected string.")
		);

		t.end();
	});

	t.end();
});

t.test("#ParseMyPageScraperPlayerCSV", (t) => {
	t.test("Valid CSV", (t) => {
		// This file is small so we just inline it.
		const buffer = Buffer.from("player_name,player_level,player_rate,player_stage,player_play_count,player_play_count_versus,player_play_count_coop,player_total_rp_earned,player_total_rp_spent\ncg505,120,2704,\"[12,ステージXII,2]\",1274,57,0,2088515,531325");


		const file = MockMulterFile(buffer, "player.csv");

		const { iterable, game, classHandler } = ParseMyPageScraperPlayerCsv(file, {}, logger);

		t.equal(game, "wacca");

		t.strictSame(iterable, [], "Should not have any score data.");

		t.not(classHandler, null);

		// There's no good way to test that the classHandler got a valid
		// MyPagePlayerStage, so we just call it to see.
		t.strictSame(classHandler!("wacca", "Single", 0, {}, logger), {stageUp: WACCA_STAGEUPS.XII});

		t.end();
	});

	t.test("Malformed CSV", (t) => {
		// Missing player_level in record
		const buffer = Buffer.from("player_name,player_level,player_rate,player_stage,player_play_count,player_play_count_versus,player_play_count_coop,player_total_rp_earned,player_total_rp_spent\ncg505,2704,\"[12,ステージXII,2]\",1274,57,0,2088515,531325");

		const file = MockMulterFile(buffer, "player.csv");

		t.throws(
			() => ParseMyPageScraperPlayerCsv(file, {}, logger),
			new ScoreImportFatalError(400, "Failed to parse CSV: Invalid Record Length: columns length is 9, got 8 on line 2")
		);

		t.end();
	});

	t.test("CSV missing player_stage", (t) => {
		// This is the only value we actually care about.
		const buffer = Buffer.from("player_name,player_level,player_rate,player_play_count,player_play_count_versus,player_play_count_coop,player_total_rp_earned,player_total_rp_spent\ncg505,120,2704,1274,57,0,2088515,531325");

		const file = MockMulterFile(buffer, "player.csv");

		t.throws(
			() => ParseMyPageScraperPlayerCsv(file, {}, logger),
			new ScoreImportFatalError(400, "Malformed CSV: no player_stage column.")
		);

		t.end();
	});

	t.test("malformed player_stage array", (t) => {
		// Missing the stage grade (third element)
		const buffer = Buffer.from("player_stage\n\"[12,ステージXII]\"");

		const file = MockMulterFile(buffer, "player.csv");

		t.throws(
			() => ParseMyPageScraperPlayerCsv(file, {}, logger),
			new ScoreImportFatalError(400, "Malformed player_stage entry.")
		);

		t.end();
	});

	t.end();
});
