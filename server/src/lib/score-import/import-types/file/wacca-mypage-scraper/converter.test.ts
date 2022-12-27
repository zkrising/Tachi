import ConvertMyPageScraperRecordsCSV from "./converter";
import deepmerge from "deepmerge";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { TestingWaccaPupaExp, TestingWaccaPupaSong } from "test-utils/test-data";
import type { MyPageRecordsParsedPB } from "./types";

const logger = CreateLogCtx(__filename);

const parsedScore: MyPageRecordsParsedPB = {
	// 2085,PUPA,モリモリあつし,4,"[4,8,13+,0]","[0,0,12]","[0,0,996827]","[0,0,2]"
	songId: 2085,
	songTitle: "PUPA",
	diffIndex: 2,
	level: "13+",
	score: 996827,
	lamp: 2,
};

t.test("#ConvertMyPageScraperRecordsCSV", (t) => {
	t.beforeEach(ResetDBState);

	function conv(g: Partial<MyPageRecordsParsedPB> = {}) {
		return ConvertMyPageScraperRecordsCSV(
			deepmerge(parsedScore, g),
			{},
			"file/mypagescraper-records-csv",
			logger
		);
	}

	t.test("Should return a dryScore on valid input.", async (t) => {
		const res = await conv();

		t.strictSame(res, {
			song: TestingWaccaPupaSong,
			chart: TestingWaccaPupaExp,
			dryScore: {
				service: "mypage-scraper",
				game: "wacca",
				scoreMeta: {},
				timeAchieved: null,
				comment: null,
				importType: "file/mypagescraper-records-csv",
				scoreData: {
					score: 996827,
					lamp: "MISSLESS",

					percent: 99.6827, // floating point
					grade: "SSS+",
					judgements: {},
					hitMeta: {},
				},
			},
		});

		t.end();
	});

	t.test("Should reject out of bounds diffIndex", (t) => {
		t.rejects(() => conv({ diffIndex: 4 }), {
			message: /We somehow got an invalid difficulty index 4\./u,
		});

		t.end();
	});

	t.test("Should throw KTDataNotFound on missing song", (t) => {
		t.rejects(() => conv({ songTitle: "INVALID SONG" }), {
			message: /Could not find song for INVALID SONG\./u,
		});

		t.end();
	});

	t.test("Should reject incorrect level", (t) => {
		t.rejects(() => conv({ level: "12" }), {
			message: /PUPA \[EXPERT\] - Should be level 13\+, but found level 12\./u,
		});

		t.end();
	});

	t.end();
});
