import t from "tap";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";
import ResetDBState from "../../../../../test-utils/resets";
import { GetKTDataJSON, Testing511Song, Testing511SPA } from "../../../../../test-utils/test-data";
import CreateLogCtx from "../../../../logger/logger";
import { ConvertAPIArcIIDX, ResolveARCIIDXLamp } from "./converter";
import { ARCIIDXScore } from "./types";
import deepmerge from "deepmerge";

const logger = CreateLogCtx(__filename);

const arcScore = GetKTDataJSON("./api-arc/iidx-score.json") as ARCIIDXScore;

t.test("#ConvertAPIArcIIDX", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should convert a valid score", async (t) => {
		const res = await ConvertAPIArcIIDX(arcScore, {}, "api/arc-iidx", logger);

		t.hasStrict(res, {
			song: Testing511Song,
			chart: Testing511SPA,
			dryScore: {
				comment: null,
				game: "iidx",
				importType: "api/arc-iidx",
				timeAchieved: 1604784681894,
				service: "ARC IIDX27",
				scoreData: {
					grade: "A",
					score: 1200,
					judgements: {},
					hitMeta: {
						bp: 43,
					},
					lamp: "HARD CLEAR",
				},
				scoreMeta: {},
			},
		});

		t.end();
	});

	t.test("Should throw on an invalid score", (t) => {
		t.rejects(
			() =>
				ConvertAPIArcIIDX(
					deepmerge(arcScore, { ex_score: "foo" }),
					{},
					"api/arc-iidx",
					logger
				),
			{
				message: /Invalid ARC Score:/iu,
			} as any
		);

		t.end();
	});

	t.test("Should throw on no chart", (t) => {
		t.rejects(
			() =>
				ConvertAPIArcIIDX(
					deepmerge(arcScore, { chart_id: "foo" }),
					{},
					"api/arc-iidx",
					logger
				),
			{
				message: /Could not find chart/iu,
			} as any
		);

		t.end();
	});

	t.end();
});

t.test("#ResolveARCIIDXLamp", (t) => {
	t.equal(ResolveARCIIDXLamp("NO_PLAY"), "NO PLAY");
	t.equal(ResolveARCIIDXLamp("FAILED"), "FAILED");
	t.equal(ResolveARCIIDXLamp("ASSIST_CLEAR"), "ASSIST CLEAR");
	t.equal(ResolveARCIIDXLamp("EASY_CLEAR"), "EASY CLEAR");
	t.equal(ResolveARCIIDXLamp("CLEAR"), "CLEAR");
	t.equal(ResolveARCIIDXLamp("HARD_CLEAR"), "HARD CLEAR");
	t.equal(ResolveARCIIDXLamp("EX_HARD_CLEAR"), "EX HARD CLEAR");
	t.equal(ResolveARCIIDXLamp("FULL_COMBO"), "FULL COMBO");

	t.end();
});

t.teardown(CloseAllConnections);
