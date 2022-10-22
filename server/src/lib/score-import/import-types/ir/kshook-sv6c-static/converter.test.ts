import { ConverterKsHookSV6CStatic } from "./converter";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { TestingKsHookSV6CStaticScore } from "test-utils/test-data";

const logger = CreateLogCtx(__filename);

t.test("#ConverterKsHookSV6CStatic", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should match a score with its song and chart.", async (t) => {
		const res = await ConverterKsHookSV6CStatic(
			TestingKsHookSV6CStaticScore,
			{},
			"ir/kshook-sv6c-static",
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
					judgements: {},
					hitMeta: {
						maxCombo: 158,
						exScore: 1334,
					},
				},
				game: "sdvx",
				importType: "ir/kshook-sv6c",
				scoreMeta: {},
			},
		});

		t.end();
	});

	t.test("Should throw an error if song or chart can't be found.", (t) => {
		t.rejects(
			() =>
				ConverterKsHookSV6CStatic(
					{ ...TestingKsHookSV6CStaticScore, music_id: 10000 },
					{},
					"ir/kshook-sv6c",
					logger
				),
			"Should throw a KTDataNotFoundError if chart can't be found."
		);

		t.end();
	});

	t.end();
});
