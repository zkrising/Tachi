import t from "tap";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";
import ResetDBState from "../../../../../test-utils/resets";
import {
	GetKTDataJSON,
	TestingAlbidaADV,
	TestingSDVXAlbidaSong,
} from "../../../../../test-utils/test-data";
import CreateLogCtx from "../../../../logger/logger";
import { ConvertAPIArcSDVX, ResolveARCSDVXLamp } from "./converter";
import { ARCSDVXScore } from "./types";
import deepmerge from "deepmerge";

const logger = CreateLogCtx(__filename);

const arcScore = GetKTDataJSON("./api-arc/sdvx-score.json") as ARCSDVXScore;

t.test("#ConvertAPIArcSDVX", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should convert a valid score", async (t) => {
		const res = await ConvertAPIArcSDVX(arcScore, {}, "api/arc-sdvx", logger);

		t.hasStrict(res, {
			song: TestingSDVXAlbidaSong,
			chart: TestingAlbidaADV,
			dryScore: {
				comment: null,
				game: "sdvx",
				importType: "api/arc-sdvx",
				timeAchieved: 1567685885077,
				service: "ARC SDVX V",
				scoreData: {
					grade: "AA",
					percent: 93.125,
					score: 9312500,
					hitData: {
						critical: 946,
						near: 45,
						miss: 49,
					},
					hitMeta: {
						btnRate: 89.5,
						holdRate: 92.5,
						laserRate: 96.5,
						maxCombo: 184,
					},
					lamp: "CLEAR",
				},
				scoreMeta: {},
			},
		});

		t.end();
	});

	t.test("Should throw on an invalid score", (t) => {
		t.rejects(
			() =>
				ConvertAPIArcSDVX(
					deepmerge(arcScore, { score: "foo" }),
					{},
					"api/arc-sdvx",
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
				ConvertAPIArcSDVX(
					deepmerge(arcScore, { chart_id: "foo" }),
					{},
					"api/arc-sdvx",
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

t.test("#ResolveARCSDVXLamp", (t) => {
	t.equal(ResolveARCSDVXLamp("PLAY"), "FAILED");
	t.equal(ResolveARCSDVXLamp("CLEAR"), "CLEAR");
	t.equal(ResolveARCSDVXLamp("HC"), "EXCESSIVE CLEAR");
	t.equal(ResolveARCSDVXLamp("UC"), "ULTIMATE CHAIN");
	t.equal(ResolveARCSDVXLamp("PUC"), "PERFECT ULTIMATE CHAIN");

	t.end();
});

t.teardown(CloseAllConnections);
