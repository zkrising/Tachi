import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";
import ResetDBState from "test-utils/resets";
import { GetKTDataJSON } from "test-utils/test-data";
import CreateLogCtx from "lib/logger/logger";
import { ParseFervidexStatic } from "./parser";

const logger = CreateLogCtx(__filename);

t.test("#ParseFervidexStatic", (t) => {
	t.beforeEach(ResetDBState);

	const ferStatic = GetKTDataJSON("./fervidex-static/base.json");

	t.test("Should parse static data from body", (t) => {
		const res = ParseFervidexStatic(ferStatic, { model: "LDJ:J:B:A:2020092900" }, logger);

		t.strictSame(res.iterable, [
			{
				song_id: 1000,
				chart: "spa",
				clear_type: 4,
				ex_score: 1180,
				miss_count: 40,
			},
			{
				song_id: 1000,
				chart: "spn",
				clear_type: 7,
				ex_score: 158,
				miss_count: 0,
			},
			{
				song_id: 1001,
				chart: "dph",
				clear_type: 3,
				ex_score: 15,
				miss_count: 1,
			},
		]);

		t.hasStrict(res, {
			context: { version: "27" },
			game: "iidx",
		});

		t.end();
	});

	t.test("Should throw an error if no body.scores is present", (t) => {
		t.throws(
			() => ParseFervidexStatic({}, { model: "LDJ:J:B:A:2020092900" }, logger),
			"Invalid body.scores"
		);

		t.end();
	});

	t.test("Should throw an error if songID or its value is nonsense", (t) => {
		t.throws(
			() =>
				ParseFervidexStatic(
					{ scores: { nonsenseKey: {} } },
					{ model: "LDJ:J:B:A:2020092900" },
					logger
				),
			"Invalid songID nonsenseKey"
		);

		t.throws(
			() =>
				ParseFervidexStatic(
					{ scores: { 1000: null } },
					{ model: "LDJ:J:B:A:2020092900" },
					logger
				),
			"Invalid score with songID 1000"
		);

		t.end();
	});

	t.test("Should throw an error if songID has no score", (t) => {
		t.throws(
			() =>
				ParseFervidexStatic(
					{ scores: { 1000: { spn: null } } },
					{ model: "LDJ:J:B:A:2020092900" },
					logger
				),
			"Invalid score with songID 1000"
		);

		t.throws(
			() =>
				ParseFervidexStatic(
					{ scores: { 1000: { spn: undefined } } },
					{ model: "LDJ:J:B:A:2020092900" },
					logger
				),
			"Invalid score with songID 1000"
		);

		t.throws(
			() =>
				ParseFervidexStatic(
					{ scores: { 1000: { spn: "foo" } } },
					{ model: "LDJ:J:B:A:2020092900" },
					logger
				),
			"Invalid score with songID 1000"
		);

		t.end();
	});

	t.test("Should throw an error if the score->chart document is invalid", (t) => {
		t.throws(
			() =>
				ParseFervidexStatic(
					{
						scores: {
							1000: { spn: { ex_score: -1, miss_count: null, clear_type: 0 } },
						},
					},
					{ model: "LDJ:J:B:A:2020092900" },
					logger
				),
			"Invalid score with songID 1000 at chart spn"
		);

		t.throws(
			() =>
				ParseFervidexStatic(
					{
						scores: {
							1000: { spn: { ex_score: 1000, miss_count: "foo", clear_type: 0 } },
						},
					},
					{ model: "LDJ:J:B:A:2020092900" },
					logger
				),
			"Invalid score with songID 1000 at chart spn"
		);

		t.throws(
			() =>
				ParseFervidexStatic(
					{
						scores: {
							1000: { spn: { ex_score: 1000, miss_count: null, clear_type: -1 } },
						},
					},
					{ model: "LDJ:J:B:A:2020092900" },
					logger
				),
			"Invalid score with songID 1000 at chart spn"
		);

		t.end();
	});

	t.test("Should throw an error if the chart name is invalid", (t) => {
		t.throws(
			() =>
				ParseFervidexStatic(
					{
						scores: {
							1000: { spx: { ex_score: 1000, miss_count: null, clear_type: 0 } },
						},
					},
					{ model: "LDJ:J:B:A:2020092900" },
					logger
				),
			"Invalid chart spx"
		);

		t.end();
	});

	t.end();
});
