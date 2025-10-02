import { ConverterLR2Hook } from "./converter";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { dmf } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestingLR2HookScore } from "test-utils/test-data";

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
					optional: {
						bp: 56,
						epg: undefined,
						lpg: undefined,
						egr: undefined,
						lgr: undefined,
						egd: undefined,
						lgd: undefined,
						ebd: undefined,
						lbd: undefined,
						epr: undefined,
						lpr: undefined,
						fast: undefined,
						slow: undefined,
					},
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

	t.test("Should use optional and extended properties.", async (t) => {
		const res = await ConverterLR2Hook(
			dmf(TestingLR2HookScore, {
				scoreData: {
					extendedJudgements: {
						epg: 1,
						lpg: 2,
						egr: 3,
						lgr: 4,
						egd: 5,
						lgd: 6,
						ebd: 7,
						lbd: 8,
						epr: 9,
						lpr: 10,
						cb: 11,
						fast: 12,
						slow: 13,
						notesPlayed: TestingLR2HookScore.scoreData.notesPlayed,
					},
				},
			} as any),
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
					optional: {
						bp: 56,
						epg: 1,
						lpg: 2,
						egr: 3,
						lgr: 4,
						egd: 5,
						lgd: 6,
						ebd: 7,
						lbd: 8,
						epr: 9,
						lpr: 10,
						fast: 12,
						slow: 13,
					},
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

	t.test("Should null BP if the score was exited early.", async (t) => {
		const res = await ConverterLR2Hook(
			dmf(TestingLR2HookScore, {
				scoreData: {
					notesPlayed: TestingLR2HookScore.scoreData.notesTotal - 1,
				},
			} as any),
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
					optional: {
						bp: null,
					},
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
					{ ...TestingLR2HookScore, md5: "nonsense_md5" },
					{ timeReceived: 10 },
					"ir/lr2hook",
					logger
				),
			"Should throw a SongOrChartNotFoundError if chart can't be found."
		);

		t.end();
	});

	t.end();
});
