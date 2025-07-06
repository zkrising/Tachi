import { ConvertAPIKaiSDVX, ConvertDifficulty, ConvertVersion, ResolveKaiLamp } from "./converter";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { TestingAlbidaADV, TestingSDVXAlbidaSong } from "test-utils/test-data";

const logger = CreateLogCtx(__filename);

const sdvxScore = {
	sdvx_id: 32157055,
	music_id: 1,
	music_difficulty: 1,

	// exg
	played_version: 6,

	clear_type: 2,
	max_chain: 179,
	score: 9310699,
	critical: 1754,
	near: 112,
	error: 78,
	early: 70,
	late: 42,
	gauge_type: 0,
	gauge_rate: 90.01,
	timestamp: "2020-08-30T13:08:11Z",
	_id: 127108,
};

t.test("#ConvertAPIKaiSDVX", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return a dryScore on valid input.", async (t) => {
		const res = await ConvertAPIKaiSDVX(sdvxScore, { service: "FLO" }, "api/flo-sdvx", logger);

		t.hasStrict(res, {
			song: TestingSDVXAlbidaSong,
			chart: TestingAlbidaADV,
			dryScore: {
				comment: null,
				game: "sdvx",
				importType: "api/flo-sdvx",
				timeAchieved: 1598792891000,
				service: "FLO",
				scoreData: {
					score: 9310699,
					lamp: "CLEAR",
					judgements: {
						critical: 1754,
						near: 112,
						miss: 78,
					},
					optional: {
						fast: 70,
						slow: 42,
						gauge: 90.01,
						maxCombo: 179,
					},
				},
				scoreMeta: {},
			},
		});

		t.end();
	});

	t.test("Should throw SongOrChartNotFound on unknown chart", (t) => {
		t.rejects(
			() =>
				ConvertAPIKaiSDVX(
					deepmerge(sdvxScore, { music_id: 0 }),
					{ service: "FLO" },
					"api/flo-sdvx",
					logger
				),
			{
				message: /Could not find chart with songID 0 \(ADV - Version exceed\)/u,
			}
		);

		t.end();
	});

	t.test("Should throw InvalidScoreFailure on invalid score", (t) => {
		t.rejects(
			() =>
				ConvertAPIKaiSDVX(
					deepmerge(sdvxScore, { music_id: "foo" }),
					{ service: "FLO" },
					"api/flo-sdvx",
					logger
				),
			{
				message:
					/Error: music_id.*Expected a positive integer.* received foo \[type: string\]/iu,
			}
		);

		t.end();
	});

	t.test("Should throw InternalFailure on song-chart desync", async (t) => {
		await db.songs.sdvx.remove({});

		t.rejects(() => ConvertAPIKaiSDVX(sdvxScore, { service: "FLO" }, "api/flo-sdvx", logger), {
			message: /Song-Chart desync/u,
		});

		t.end();
	});

	t.end();
});

t.test("#ConvertDifficulty", (t) => {
	t.equal(ConvertDifficulty(0), "NOV");
	t.equal(ConvertDifficulty(1), "ADV");
	t.equal(ConvertDifficulty(2), "EXH");
	t.equal(ConvertDifficulty(3), "ANY_INF");
	t.equal(ConvertDifficulty(4), "MXM");
	t.throws(() => ConvertDifficulty(5));

	t.end();
});

t.test("#ConvertVersion", (t) => {
	t.equal(ConvertVersion(1), "booth");
	t.equal(ConvertVersion(2), "inf");
	t.equal(ConvertVersion(3), "gw");
	t.equal(ConvertVersion(4), "heaven");
	t.equal(ConvertVersion(5), "vivid");
	t.equal(ConvertVersion(6), "exceed");
	t.throws(() => ConvertVersion(7));
	t.throws(() => ConvertVersion(0));

	t.end();
});

t.test("#ResolveKaiLamp", (t) => {
	t.equal(ResolveKaiLamp(1), "FAILED");
	t.equal(ResolveKaiLamp(2), "CLEAR");
	t.equal(ResolveKaiLamp(3), "EXCESSIVE CLEAR");
	t.equal(ResolveKaiLamp(4), "ULTIMATE CHAIN");
	t.equal(ResolveKaiLamp(5), "PERFECT ULTIMATE CHAIN");
	t.equal(ResolveKaiLamp(6), "MAXXIVE CLEAR");
	t.throws(() => ResolveKaiLamp(7));
	t.throws(() => ResolveKaiLamp(0));

	t.end();
});
