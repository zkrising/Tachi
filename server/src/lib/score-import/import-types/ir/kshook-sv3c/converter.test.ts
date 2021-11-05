import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { TestingKsHookSV3CScore } from "test-utils/test-data";
import { ConverterIRKsHookSV3C } from "./converter";

const logger = CreateLogCtx(__filename);

t.test("#ConverterIRKsHookSV3C", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should match a score with its song and chart.", async (t) => {
		const res = await ConverterIRKsHookSV3C(
			TestingKsHookSV3CScore,
			{},
			"ir/kshook-sv3c",
			logger
		);

		t.hasStrict(res, {
			song: {
				id: 1,
			},
			chart: {
				data: {
					inGameID: 1,
				},
				difficulty: "ADV",
			},
			dryScore: {
				scoreData: {
					score: 9_579_365,
					grade: "AA+",
					lamp: "EXCESSIVE CLEAR",
					judgements: {
						critical: 1184,
						near: 46,
						miss: 30,
					},
					hitMeta: {
						slow: 10,
						fast: 36,
						maxCombo: 158,
					},
				},
				game: "sdvx",
				importType: "ir/kshook-sv3c",
				scoreMeta: {},
			},
		});

		t.end();
	});

	t.test("Should throw an error if song or chart can't be found.", (t) => {
		t.rejects(
			() =>
				ConverterIRKsHookSV3C(
					Object.assign({}, TestingKsHookSV3CScore, { music_id: 10000 }),
					{},
					"ir/kshook-sv3c",
					logger
				),
			"Should throw a KTDataNotFoundError if chart can't be found."
		);

		t.end();
	});

	t.end();
});
