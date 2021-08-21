import t from "tap";
import CreateLogCtx from "lib/logger/logger";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { ParseBatchManualFromObject as ParserFn } from "./parser";
import { EscapeStringRegexp } from "utils/misc";
import deepmerge from "deepmerge";
import { CloseAllConnections } from "test-utils/close-connections";
import { BatchManual } from "tachi-common";

const mockErr = (...msg: string[]) =>
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
				"Invalid BATCH-MANUAL (Not an object, recieved boolean.)"
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
				"Invalid BATCH-MANUAL: meta.service | Expected a string with length between 3 and 15. | Received 1 [string]."
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
				"Invalid BATCH-MANUAL: meta.service | Expected a string with length between 3 and 15. | Received 1 [number]."
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
								lamp: "ALL JUSTICE", // not an iidx lamp
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
					"Invalid BATCH-MANUAL: scores[0].lamp | Expected any of NO PLAY, FAILED, ASSIST CLEAR, EASY CLEAR, CLEAR, HARD CLEAR, EX HARD CLEAR, FULL COMBO. | Received ALL JUSTICE [string]."
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
					"Invalid BATCH-MANUAL: scores[0].score | Expected number. | Received 123 [string]."
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
					"Invalid BATCH-MANUAL: scores[0].timeAchieved | Expected a number greater than 1 Trillion - did you pass unix seconds instead of miliseconds? | Received string [string]."
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
					"Invalid BATCH-MANUAL: scores[0].timeAchieved | Expected a number greater than 1 Trillion - did you pass unix seconds instead of miliseconds? | Received 1620768609.637 [number]."
				),
				"Should throw if timeAchieved is less than 10_000_000_000."
			);

			t.end();
		});

		t.test("Invalid Identifier", (t) => {
			// this is not a valid playtype for IIDX
			const fn = () => ParserFn(dm({ identifier: null }), "file/batch-manual", logger);

			t.throws(fn, mockErr("scores[0].identifier | Expected string", "Received null [null]"));

			t.end();
		});

		t.test("Invalid MatchType", (t) => {
			const fn = () =>
				ParserFn(dm({ matchType: "Invalid_MatchType" }), "file/batch-manual", logger);

			t.throws(
				fn,
				mockErr(
					"scores[0].matchType | Expected any of",
					"Received Invalid_MatchType [string]"
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
				mockErr("scores[0].judgements | Key pgreat had an invalid value of 123 [string]")
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

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
