import { ConvertAPIKaiIIDX } from "./converter";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { LoadTachiIIDXData, Testing511Song, Testing511SPA } from "test-utils/test-data";

const logger = CreateLogCtx(__filename);

const iidxScore = {
	chart_id: 3848,
	music_id: 1000,
	music_difficulty: 2,
	play_style: "SINGLE",
	difficulty: "ANOTHER",
	iidx_id: 35247879,
	version_played: 26,
	lamp: 5,
	ex_score: 1570,
	grade: "AA",
	miss_count: 24,
	fast_count: null,
	slow_count: null,
	timestamp: "2020-10-31T19:10:50Z",
	_id: 189232,
};

t.test("#ConvertAPIKaiIIDX", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return a dryScore on valid input.", async (t) => {
		const res = await ConvertAPIKaiIIDX(iidxScore, { service: "FLO" }, "api/flo-iidx", logger);

		t.hasStrict(res, {
			song: Testing511Song,
			chart: Testing511SPA,
			dryScore: {
				comment: null,
				game: "iidx",
				importType: "api/flo-iidx",
				timeAchieved: 1604171450000,
				service: "FLO",
				scoreData: {
					grade: "MAX-",

					// percent: 99.87277353689568 floating point,
					score: 1570,
					lamp: "HARD CLEAR",
					judgements: {},
					hitMeta: {
						fast: null,
						slow: null,
						bp: 24,
					},
				},
				scoreMeta: {},
			},
		});

		t.end();
	});

	t.test("Should convert a legacy leggendaria songID.", async (t) => {
		await LoadTachiIIDXData();

		const res = await ConvertAPIKaiIIDX(
			deepmerge(iidxScore, { music_id: 24101 }),
			{ service: "FLO" },
			"api/flo-iidx",
			logger
		);

		t.hasStrict(res, {
			song: {
				title: "冬椿 ft. Kanae Asaba",
			},
			chart: {
				difficulty: "LEGGENDARIA",
				data: {
					inGameID: 24011,
				},
			},
			dryScore: {
				comment: null,
				game: "iidx",
				importType: "api/flo-iidx",
				timeAchieved: 1604171450000,
				service: "FLO",
				scoreData: {
					grade: "C",
					score: 1570,
					lamp: "HARD CLEAR",
					judgements: {},
					hitMeta: {
						fast: null,
						slow: null,
						bp: 24,
					},
				},
				scoreMeta: {},
			},
		});

		t.end();
	});

	t.test("Should throw KTDataNotFound on unknown chart", (t) => {
		t.rejects(
			() =>
				ConvertAPIKaiIIDX(
					deepmerge(iidxScore, { music_id: 0 }),
					{ service: "FLO" },
					"api/flo-iidx",
					logger
				),
			{
				message: /Could not find chart with songID 0 \(SP ANOTHER - Version 26\)/u,
			}
		);

		t.end();
	});

	t.test("Should throw InvalidScoreFailure on invalid score", (t) => {
		t.rejects(
			() =>
				ConvertAPIKaiIIDX(
					deepmerge(iidxScore, { music_id: "foo" }),
					{ service: "FLO" },
					"api/flo-iidx",
					logger
				),
			{
				message: /Error: music_id.*Expected a positive integer.* received foo \[string\]/iu,
			}
		);

		t.end();
	});

	t.test("Should throw InternalFailure on song-chart desync", async (t) => {
		await db.songs.iidx.remove({});

		t.rejects(() => ConvertAPIKaiIIDX(iidxScore, { service: "FLO" }, "api/flo-iidx", logger), {
			message: /Song-Chart desync/u,
		});

		t.end();
	});

	t.end();
});
