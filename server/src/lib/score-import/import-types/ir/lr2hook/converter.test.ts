import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { TestingLR2HookScore } from "test-utils/test-data";
import { ConverterLR2Hook } from "./converter";

const logger = CreateLogCtx(__filename);

t.test("#ConverterLR2Hook", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should match a score with its song and chart.", async (t) => {
		const res = await ConverterLR2Hook(
			TestingLR2HookScore,
			{ timeReceived: 10 },
			"ir/lr2hook",
			logger
		);

		t.hasStrict(res, {
			song: {
				id: 27339,
			},
			chart: {
				chartID: "88eb6cc5683e2740cbd07f588a5f3db1db8d467b",
				data: {
					hashMD5: TestingLR2HookScore.md5,
				},
			},
			dryScore: {
				scoreData: {
					score: TestingLR2HookScore.scoreData.exScore,
				},
				game: "bms",
				importType: "ir/lr2hook",
				scoreMeta: {
					client: "LR2",
				},
			},
		});

		t.end();
	});

	t.test("Should throw an error if song or chart can't be found.", (t) => {
		t.rejects(
			() =>
				ConverterLR2Hook(
					Object.assign({}, TestingLR2HookScore, { md5: "nonsense_md5" }),
					{ timeReceived: 10 },
					"ir/lr2hook",
					logger
				),
			"Should throw a KTDataNotFoundError if chart can't be found."
		);

		t.end();
	});

	t.end();
});
