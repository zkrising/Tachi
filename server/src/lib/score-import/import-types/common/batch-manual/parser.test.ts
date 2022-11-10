import { ParseBatchManualFromObject as ParserFn } from "./parser";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import deepmerge from "deepmerge";
import CreateLogCtx from "lib/logger/logger";
import { IIDX_DANS } from "tachi-common";
import t from "tap";
import { EscapeStringRegexp } from "utils/misc";
import type { BatchManual } from "tachi-common";

const mockErr = (...msg: Array<string>) =>
	({
		statusCode: 400,
		message: new RegExp(msg.map((e) => `${EscapeStringRegexp(e)}.*`).join(""), "u"),
		name: "Error",
	} as unknown as ScoreImportFatalError);

const logger = CreateLogCtx(__filename);

const baseBatchManual = {
	scores: [],
	meta: { service: "foo", game: "iidx", playtype: "SP" },
};

const baseBatchManualScore = {
	score: 1000,
	lamp: "HARD CLEAR",
	matchType: "tachiSongID",
	identifier: "123",
	difficulty: "ANOTHER",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dm(sc: any) {
	return deepmerge(
		baseBatchManual,
		{ scores: [deepmerge(baseBatchManualScore, sc)] },
		{ arrayMerge: (r, c) => c }
	);
}

t.test("#ParserFn", (t) => {
	t.test("Non-Object", (t) => {
		t.throws(
			() => ParserFn(false, "file/batch-manual", logger),
			new ScoreImportFatalError(
				400,
				"Invalid BATCH-MANUAL (Not an object, received boolean.)"
			),
			"Should throw an error."
		);

		t.end();
	});

	t.test("No Header", (t) => {
		t.throws(
			() => ParserFn({ scores: [] }, "file/batch-manual", logger),
			new ScoreImportFatalError(
				400,
				"Could not retrieve meta.game - is this valid BATCH-MANUAL?"
			),
			"Should throw an error."
		);

		t.end();
	});

	t.test("No Game", (t) => {
		t.throws(
			() =>
				ParserFn(
					{ scores: [], meta: { service: "foo", playtype: "SP" } },
					"file/batch-manual",
					logger
				),
			new ScoreImportFatalError(
				400,
				"Could not retrieve meta.game - is this valid BATCH-MANUAL?"
			),
			"Should throw an error."
		);

		t.end();
	});

	t.test("No Playtype", (t) => {
		t.throws(
			() =>
				ParserFn(
					{ scores: [], meta: { service: "foo", game: "iidx" } },
					"file/batch-manual",
					logger
				),
			new ScoreImportFatalError(
				400,
				"Could not retrieve meta.playtype - is this valid BATCH-MANUAL?"
			),
			"Should throw an error."
		);

		t.end();
	});

	t.test("Invalid Game", (t) => {
		t.throws(
			() =>
				ParserFn(
					{ scores: [], meta: { service: "foo", game: "invalid_game", playtype: "SP" } },
					"file/batch-manual",
					logger
				),
			"Should throw an error."
		);

		t.throws(
			() =>
				ParserFn(
					{ scores: [], meta: { service: "foo", game: 123, playtype: "SP" } },
					"file/batch-manual",
					logger
				),
			"Should throw an error."
		);

		t.end();
	});

	t.test("Invalid Service", (t) => {
		t.throws(
			() =>
				ParserFn(
					{ scores: [], meta: { service: "1", game: "iidx", playtype: "SP" } },
					"file/batch-manual",
					logger
				),
			new ScoreImportFatalError(
				400,
				"Invalid BATCH-MANUAL: meta.service | Expected a string with length between 3 and 60. | Received 1 [type: string]."
			),
			"Should throw an error."
		);

		t.throws(
			() =>
				ParserFn(
					{ scores: [], meta: { service: 1, game: "iidx", playtype: "SP" } },
					"file/batch-manual",
					logger
				),
			new ScoreImportFatalError(
				400,
				"Invalid BATCH-MANUAL: meta.service | Expected a string with length between 3 and 60. | Received 1 [type: number]."
			),
			"Should throw an error."
		);

		t.end();
	});

	t.test("Valid Empty BATCH-MANUAL", (t) => {
		const res = ParserFn(
			{ scores: [], meta: { service: "foo", game: "iidx", playtype: "SP" } },
			"file/batch-manual",
			logger
		);

		t.hasStrict(res, {
			game: "iidx",
			context: {
				service: "foo",
				game: "iidx",
				version: null,
			},
			iterable: [],
		});

		t.end();
	});

	t.test("Valid BATCH-MANUAL", (t) => {
		t.test("Basic BATCH-MANUAL", (t) => {
			const res = ParserFn(
				{
					scores: [
						{
							score: 1000,
							lamp: "HARD CLEAR",
							matchType: "tachiSongID",
							identifier: "123",
							difficulty: "ANOTHER",
						},
						{
							score: 1000,
							lamp: "HARD CLEAR",
							matchType: "tachiSongID",
							identifier: "123",
							difficulty: "HYPER",
						},
						{
							score: 1000,
							lamp: "HARD CLEAR",
							matchType: "songTitle",
							identifier: "5.1.1.",
						},
						{
							score: 1000,
							lamp: "HARD CLEAR",
							matchType: "songTitle",
							identifier: "5.1.1.",
						},
					],
					meta: { service: "foo", game: "iidx", playtype: "SP" },
				} as BatchManual,
				"file/batch-manual",
				logger
			);

			t.hasStrict(res, {
				game: "iidx",
				context: {
					service: "foo",
					game: "iidx",
					playtype: "SP",
					version: null,
				},
				iterable: [
					{
						score: 1000,
						lamp: "HARD CLEAR",
						matchType: "tachiSongID",
						identifier: "123",
						difficulty: "ANOTHER",
					},
					{
						score: 1000,
						lamp: "HARD CLEAR",
						matchType: "tachiSongID",
						identifier: "123",
						difficulty: "HYPER",
					},
					{
						score: 1000,
						lamp: "HARD CLEAR",
						matchType: "songTitle",
						identifier: "5.1.1.",
					},
					{
						score: 1000,
						lamp: "HARD CLEAR",
						matchType: "songTitle",
						identifier: "5.1.1.",
					},
				],
			});

			t.end();
		});

		t.test("Valid HitMeta", (t) => {
			const res = ParserFn(
				dm({ hitMeta: { bp: 10, gauge: 100, gaugeHistory: null, comboBreak: 7 } }),
				"file/batch-manual",
				logger
			);

			t.hasStrict(res, {
				game: "iidx",
				context: {
					service: "foo",
					game: "iidx",
					playtype: "SP",
					version: null,
				},
				iterable: [
					{
						score: 1000,
						lamp: "HARD CLEAR",
						matchType: "tachiSongID",
						identifier: "123",
						difficulty: "ANOTHER",
						hitMeta: {
							bp: 10,
							gauge: 100,
							gaugeHistory: null,
							comboBreak: 7,
						},
					},
				],
			});

			t.end();
		});

		t.test("Valid judgements", (t) => {
			const res = ParserFn(
				dm({ judgements: { pgreat: 1, great: null, bad: 0 } }),
				"file/batch-manual",
				logger
			);

			t.hasStrict(res, {
				game: "iidx",
				context: {
					service: "foo",
					game: "iidx",
					playtype: "SP",
					version: null,
				},
				iterable: [
					{
						score: 1000,
						lamp: "HARD CLEAR",
						matchType: "tachiSongID",
						identifier: "123",
						difficulty: "ANOTHER",
						judgements: {
							pgreat: 1,
							great: null,
							bad: 0,
						},
					},
				],
			});

			t.end();
		});

		t.test("With class", (t) => {
			const res = ParserFn(
				{
					meta: baseBatchManual.meta,
					scores: [baseBatchManualScore],
					classes: { dan: "KAIDEN" },
				} as BatchManual,
				"file/batch-manual",
				logger
			);

			t.not(res.classHandler, null);

			t.strictSame(res.classHandler!("iidx", "SP", 1, {}, logger), { dan: IIDX_DANS.KAIDEN });

			t.end();
		});

		t.test("With class set to null.", (t) => {
			const res = ParserFn(
				{
					meta: baseBatchManual.meta,
					scores: [baseBatchManualScore],
					classes: null,
				} as BatchManual,
				"file/batch-manual",
				logger
			);

			t.equal(res.classHandler, null);

			t.end();
		});

		t.end();
	});

	t.test("Invalid BATCH-MANUAL", (t) => {
		t.test("Invalid Lamp For Game", (t) => {
			const fn = () =>
				ParserFn(
					{
						scores: [
							{
								score: 1000,

								// not an iidx lamp
								lamp: "ALL JUSTICE",
								matchType: "tachiSongID",
								identifier: "123",
								difficulty: "ANOTHER",
							},
						],
						meta: { service: "foo", game: "iidx", playtype: "SP" },
					},
					"file/batch-manual",
					logger
				);

			t.throws(
				fn,
				new ScoreImportFatalError(
					400,
					"Invalid BATCH-MANUAL: scores[0].lamp | Expected any of NO PLAY, FAILED, ASSIST CLEAR, EASY CLEAR, CLEAR, HARD CLEAR, EX HARD CLEAR, FULL COMBO. | Received ALL JUSTICE [type: string]."
				)
			);

			t.end();
		});

		t.test("Non-numeric score", (t) => {
			const fn = () => ParserFn(dm({ score: "123" }), "file/batch-manual", logger);

			t.throws(
				fn,
				new ScoreImportFatalError(
					400,
					"Invalid BATCH-MANUAL: scores[0].score | Expected a positive integer. | Received 123 [type: string]."
				)
			);

			t.end();
		});

		t.test("Invalid timeAchieved", (t) => {
			const fn = () => ParserFn(dm({ timeAchieved: "string" }), "file/batch-manual", logger);

			t.throws(
				fn,
				new ScoreImportFatalError(
					400,
					"Invalid BATCH-MANUAL: scores[0].timeAchieved | Expected a number greater than 1 Trillion - did you pass unix seconds instead of milliseconds? | Received string [type: string]."
				)
			);

			const fn2 = () =>
				ParserFn(
					dm({ timeAchieved: 1_620_768_609_637 / 1000 }),
					"file/batch-manual",
					logger
				);

			t.throws(
				fn2,
				new ScoreImportFatalError(
					400,
					"Invalid BATCH-MANUAL: scores[0].timeAchieved | Expected a number greater than 1 Trillion - did you pass unix seconds instead of milliseconds? | Received 1620768609.637 [type: number]."
				),
				"Should throw if timeAchieved is less than 10_000_000_000."
			);

			t.end();
		});

		t.test("TimeAchieved of 0 should be legal.", (t) => {
			const res = ParserFn(dm({ timeAchieved: 0 }), "file/batch-manual", logger);

			t.hasStrict(res, {
				game: "iidx",
				context: {
					service: "foo",
					game: "iidx",
					playtype: "SP",
					version: null,
				},
				iterable: [
					{
						score: 1000,
						lamp: "HARD CLEAR",
						matchType: "tachiSongID",
						identifier: "123",
						difficulty: "ANOTHER",
						timeAchieved: 0,
					},
				],
			});

			t.end();
		});

		t.test("Invalid Identifier", (t) => {
			// this is not a valid playtype for IIDX
			const fn = () => ParserFn(dm({ identifier: null }), "file/batch-manual", logger);

			t.throws(
				fn,
				mockErr("scores[0].identifier | Expected string", "Received null [type: null]")
			);

			t.end();
		});

		t.test("Invalid MatchType", (t) => {
			const fn = () =>
				ParserFn(dm({ matchType: "Invalid_MatchType" }), "file/batch-manual", logger);

			t.throws(
				fn,
				mockErr(
					"scores[0].matchType | Expected any of",
					"Received Invalid_MatchType [type: string]"
				)
			);

			t.end();
		});

		t.test("Invalid judgements", (t) => {
			const fn = () =>
				ParserFn(dm({ judgements: { not_key: 123 } }), "file/batch-manual", logger);

			t.throws(fn, mockErr("scores[0].judgements | Invalid Key not_key"));

			const fn2 = () =>
				ParserFn(dm({ judgements: { pgreat: "123" } }), "file/batch-manual", logger);

			t.throws(
				fn2,
				mockErr(
					"scores[0].judgements | Key pgreat had an invalid value of 123 [type: string]"
				)
			);

			t.end();
		});

		t.test("Invalid HitMeta", (t) => {
			const fn = () =>
				ParserFn(dm({ hitMeta: { not_key: 123 } }), "file/batch-manual", logger);

			t.throws(fn, mockErr("scores[0].hitMeta | Unexpected"));

			const fn2 = () => ParserFn(dm({ hitMeta: { bp: -1 } }), "file/batch-manual", logger);

			t.throws(fn2, mockErr("scores[0].hitMeta.bp | Expected a positive integer"));

			t.end();
		});

		t.test("Invalid class", (t) => {
			// Out of bounds. (18 is kaiden)

			t.test("Should throw if class is out of bounds.", (t) => {
				t.throws(
					() =>
						ParserFn(
							{
								meta: baseBatchManual.meta,
								scores: [baseBatchManualScore],
								classes: { dan: "UNKNOWN" },
							} as BatchManual,
							"file/batch-manual",
							logger
						),
					mockErr(
						"Invalid BATCH-MANUAL: classes.dan | Expected any of KYU_7, KYU_6, KYU_5, KYU_4, KYU_3, KYU_2, KYU_1, DAN_1, DAN_2, DAN_3, DAN_4, DAN_5, DAN_6, DAN_7, DAN_8, DAN_9, DAN_10, CHUUDEN, KAIDEN. | Received UNKNOWN [type: string]"
					)
				);

				t.end();
			});

			t.test("Should throw if dans for different games are passed.", (t) => {
				t.throws(
					() =>
						ParserFn(
							{
								meta: baseBatchManual.meta,
								scores: [baseBatchManualScore],
								classes: { stageUp: "XII" },
							} as BatchManual,
							"file/batch-manual",
							logger
						),
					mockErr("classes | Unexpected properties inside object: stageUp")
				);

				t.end();
			});

			t.test("Should throw if dan is a non-string.", (t) => {
				t.throws(
					() =>
						ParserFn(
							{
								meta: baseBatchManual.meta,
								scores: [baseBatchManualScore],
								classes: { dan: 9 },
							} as unknown as BatchManual,
							"file/batch-manual",
							logger
						),
					mockErr(
						"Invalid BATCH-MANUAL: classes.dan | Expected any of KYU_7, KYU_6, KYU_5, KYU_4, KYU_3, KYU_2, KYU_1, DAN_1, DAN_2, DAN_3, DAN_4, DAN_5, DAN_6, DAN_7, DAN_8, DAN_9, DAN_10, CHUUDEN, KAIDEN. | Received 9 [type: number]."
					)
				);

				t.end();
			});

			t.test("Should throw if unknown classes are present.", (t) => {
				t.throws(
					() =>
						ParserFn(
							{
								meta: baseBatchManual.meta,
								scores: [baseBatchManualScore],
								classes: { dan: "DAN_9", unknownDan: "FIRST" },
							} as unknown,
							"file/batch-manual",
							logger
						),
					mockErr("classes | Unexpected properties inside object: unknownDan.")
				);

				// should also throw if classes from a valid game and invalid game
				// are passed.
				t.throws(
					() =>
						ParserFn(
							{
								meta: baseBatchManual.meta,
								scores: [baseBatchManualScore],
								classes: { dan: "KAIDEN", stageUp: "XII" },
							} as unknown,
							"file/batch-manual",
							logger
						),
					mockErr(
						"Invalid BATCH-MANUAL: classes | Unexpected properties inside object: stageUp."
					)
				);

				t.end();
			});

			t.end();
		});

		t.end();
	});

	t.end();
});
