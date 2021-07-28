import t from "tap";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import ResetDBState from "test-utils/resets";
import {
	GetKTDataJSON,
	LoadTachiIIDXData,
	Testing511Song,
	Testing511SPA,
} from "test-utils/test-data";
import { ConvertFileMerIIDX } from "./converter";
import deepmerge from "deepmerge";
import { MerScore } from "./types";
import { CloseAllConnections } from "test-utils/close-connections";

const logger = CreateLogCtx(__filename);

t.test("#ConvertFileMerIIDX", (t) => {
	t.beforeEach(ResetDBState);

	function merc(g: Partial<MerScore> = {}) {
		return ConvertFileMerIIDX(deepmerge(MerScore, g), {}, "file/mer-iidx", logger);
	}

	const MerScore = GetKTDataJSON("./mer/merscore.json");

	t.test("Valid Conversion", async (t) => {
		const res = await ConvertFileMerIIDX(MerScore, {}, "file/mer-iidx", logger);

		t.hasStrict(
			res,
			{
				song: Testing511Song,
				chart: Testing511SPA,
				dryScore: {
					game: "iidx",
					comment: null,
					importType: "file/mer-iidx",
					service: "MER",
					scoreData: {
						score: 1000,
						// percent: 63.61, approximately, fpa impossible.
						grade: "B",
						lamp: "CLEAR",
						judgements: {},
						hitMeta: {
							bp: 21,
						},
					},
					scoreMeta: {},
					timeAchieved: 1616537722000,
				},
			},
			"Should return the converted dry score."
		);

		t.end();
	});

	t.test("Valid DP Conversion", async (t) => {
		await LoadTachiIIDXData();
		const res = await merc({ play_type: "DOUBLE" });

		t.hasStrict(
			res,
			{
				song: { id: 1 },
				chart: { playtype: "DP", data: { inGameID: 1000 } },
				dryScore: {
					game: "iidx",
					comment: null,
					importType: "file/mer-iidx",
					service: "MER",
					scoreData: {
						score: 1000,
						// percent: 63.61, approximately, fpa impossible.
						grade: "B",
						lamp: "CLEAR",
						judgements: {},
						hitMeta: {
							bp: 21,
						},
					},
					scoreMeta: {},
					timeAchieved: 1616537722000,
				},
			},
			"Should return the converted dry score."
		);

		t.end();
	});

	t.test("Invalid Chart", (t) => {
		t.rejects(() => merc({ diff_type: "LEGGENDARIA" }), {
			message: /Could not find chart with musicID 1000 \(SP LEGGENDARIA/u,
		});

		t.end();
	});

	t.test("Invalid Song", (t) => {
		t.rejects(() => merc({ music_id: 0 }), {
			message: /Could not find chart with musicID 0/u,
		});

		t.end();
	});

	t.test("Should log severe on Song-Chart Desync", async (t) => {
		await db.songs.iidx.remove({});

		t.rejects(() => merc(), {
			message: /Song-Chart Desync on songID 1/u,
		});

		t.end();
	});

	t.test("Invalid Percent", (t) => {
		t.rejects(() => merc({ score: 9999 }), {
			message: /Invalid percent/u,
		});

		t.end();
	});

	t.test("Invalid Date", (t) => {
		t.rejects(() => merc({ update_time: "INVALID" }), {
			message: /Invalid\/Unparsable score timestamp of INVALID/u,
		});

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
