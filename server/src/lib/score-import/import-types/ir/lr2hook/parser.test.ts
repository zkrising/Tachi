/* eslint-disable @typescript-eslint/no-explicit-any */
import { ParseLR2Hook } from "./parser";
import deepmerge from "deepmerge";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { TestingLR2HookScore } from "test-utils/test-data";
import { ApplyNTimes } from "utils/misc";

const logger = CreateLogCtx(__filename);

t.test("#ParseLR2Hook", (t) => {
	const assertFail = (data: any, message: string) => {
		t.throws(() => ParseLR2Hook(data, logger), message);
	};

	const assertSuccess = (data: any, message: string) => {
		try {
			t.doesNotThrow(() => ParseLR2Hook(data, logger), message);

			const res = ParseLR2Hook(data, logger);

			t.equal(res.game, "bms");
			t.type(res.context.timeReceived, "number");
			t.ok(Array.isArray(res.iterable));
			t.equal(res.classProvider, null);
		} catch (err) {
			t.fail(`[${message}] ${(err as Error).message}`);
		}
	};

	const dm = (data: any) => deepmerge(TestingLR2HookScore, data);
	const dms = (data: any) =>
		deepmerge(
			TestingLR2HookScore,
			{ scoreData: data },
			{
				arrayMerge: (a, b) => b,
			}
		);
	const dmse = (data: any) =>
		deepmerge(
			deepmerge(TestingLR2HookScore, {
				scoreData: {
					extendedJudgements: {
						epg: 0,
						lpg: 0,
						egr: 0,
						lgr: 0,
						egd: 0,
						lgd: 0,
						ebd: 0,
						lbd: 0,
						epr: 0,
						lpr: 0,
						cb: 0,
						fast: 0,
						slow: 0,
						notesPlayed: 0,
					},
				},
			}),
			{ scoreData: data },
			{
				arrayMerge: (a, b) => b,
			}
		);

	assertSuccess(TestingLR2HookScore, "Should parse a valid score.");
	assertSuccess(
		dm({ unexpectedField: "foo" }),
		"Should allow excess keys that we do not recognise."
	);
	assertSuccess(
		dm({ scoreData: { unexpectedField: "foo" } }),
		"Should allow excess keys inside scoreData that we do not recognise."
	);
	assertSuccess(
		dm({ playerData: { unexpectedField: "foo" } }),
		"Should allow excess keys inside playerData that we do not recognise."
	);

	assertFail(
		dm({ playerData: { autoScr: true } }),
		"Should reject scores where autoScr is set to true."
	);
	assertFail(
		dm({ playerData: { random: "H-RAN" } }),
		"Should reject scores where random is set to H-RAN."
	);
	assertFail(
		dm({ playerData: { random: "ALLSCR" } }),
		"Should reject scores where random is set to ALLSCR"
	);

	assertFail({}, "Should reject an empty object");

	for (const key of [
		"pgreat",
		"good",
		"bad",
		"poor",
		"great",
		"maxCombo",
		"exScore",
		"notesTotal",
		"notesPlayed",
	]) {
		assertFail(dms({ [key]: -1 }), `Should reject negative ${key}`);
		assertFail(dms({ [key]: 0.5 }), `Should reject decimal ${key}`);
		assertFail(dms({ [key]: "0" }), `Should reject string ${key}`);
		assertFail(dms({ [key]: null }), `Should reject nonsense ${key}`);
	}

	assertFail(dms({ lamp: "UNKNOWN_LAMP" }), "Should reject unknown lamp.");
	assertFail(dms({ lamp: null }), "Should reject null lamp.");
	assertFail(dms({ lamp: undefined }), "Should reject no lamp.");

	for (const key of [
		"epg",
		"lpg",
		"egr",
		"lgr",
		"egd",
		"lgd",
		"ebd",
		"lbd",
		"epr",
		"lpr",
		"cb",
		"fast",
		"slow",
		"notesPlayed",
	]) {
		assertFail(dmse({ extendedJudgements: { [key]: -1 } }), `Should reject negative ${key}`);
		assertFail(dmse({ extendedJudgements: { [key]: 0.5 } }), `Should reject decimal ${key}`);
		assertFail(dmse({ extendedJudgements: { [key]: "0" } }), `Should reject string ${key}`);
		assertFail(dmse({ extendedJudgements: { [key]: null } }), `Should reject nonsense ${key}`);
	}

	assertFail(
		dms({ hpGraph: ApplyNTimes(999, () => 50) }),
		"Should disallow hp graph with <1000 elements."
	);
	assertFail(dms({ hpGraph: [] }), "Should disallow hp graph with 0 elements.");
	assertFail(
		dms({ hpGraph: ApplyNTimes(1001, () => 50) }),
		"Should disallow hp graph with >1000 elements."
	);
	assertFail(
		dms({ hpGraph: ApplyNTimes(1000, () => 101) }),
		"Should disallow hp graph with elements larger than 100."
	);
	assertFail(
		dms({ hpGraph: ApplyNTimes(1000, () => -1) }),
		"Should disallow hp graph with negative element values."
	);

	t.end();
});
