/* eslint-disable @typescript-eslint/no-explicit-any */
import deepmerge from "deepmerge";
import { SDVXDans } from "lib/constants/classes";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { TestingKsHookSV3CScore } from "test-utils/test-data";
import { ConvertSkillLevel, ParseKsHookSV3C } from "./parser";

const logger = CreateLogCtx(__filename);

t.test("#ConvertSkillLevel", (t) => {
	t.equal(ConvertSkillLevel("SKILL_LEVEL_01"), SDVXDans.DAN_1);
	t.equal(ConvertSkillLevel("SKILL_LEVEL_02"), SDVXDans.DAN_2);
	t.equal(ConvertSkillLevel("SKILL_LEVEL_03"), SDVXDans.DAN_3);
	t.equal(ConvertSkillLevel("SKILL_LEVEL_04"), SDVXDans.DAN_4);
	t.equal(ConvertSkillLevel("SKILL_LEVEL_05"), SDVXDans.DAN_5);
	t.equal(ConvertSkillLevel("SKILL_LEVEL_06"), SDVXDans.DAN_6);
	t.equal(ConvertSkillLevel("SKILL_LEVEL_07"), SDVXDans.DAN_7);
	t.equal(ConvertSkillLevel("SKILL_LEVEL_08"), SDVXDans.DAN_8);
	t.equal(ConvertSkillLevel("SKILL_LEVEL_09"), SDVXDans.DAN_9);
	t.equal(ConvertSkillLevel("SKILL_LEVEL_10"), SDVXDans.DAN_10);
	t.equal(ConvertSkillLevel("SKILL_LEVEL_11"), SDVXDans.DAN_11);
	t.equal(ConvertSkillLevel("SKILL_LEVEL_12"), SDVXDans.INF);
	t.equal(ConvertSkillLevel("SKILL_LEVEL_NONE"), null);

	t.end();
});

t.test("#ParseKsHookSV3C", (t) => {
	const assertFail = (data: any, message: string) => {
		t.throws(() => ParseKsHookSV3C(data, logger), message);
	};

	const assertSuccess = (data: any, message: string) => {
		try {
			t.doesNotThrow(() => ParseKsHookSV3C(data, logger), message);

			const res = ParseKsHookSV3C(data, logger);

			t.equal(res.game, "sdvx");
			t.type(res.context.timeReceived, "number");
			t.ok(Array.isArray(res.iterable));
			t.type(res.classHandler, "function");
		} catch (err) {
			t.fail(`[${message}] ${err.message}`);
		}
	};

	const dm = (data: any) => deepmerge(TestingKsHookSV3CScore, data);

	assertSuccess(TestingKsHookSV3CScore, "Should parse a valid score.");
	assertSuccess(
		dm({ unexpectedField: "foo" }),
		"Should allow excess keys that we do not recognise."
	);

	assertFail({}, "Should reject an empty object");
	assertFail(dm({ skill_level: "invalid_skill_level" }), "Should reject invalid skill levels.");
	assertFail(dm({ appeal_id: 0.5 }), "Should reject non integer appeal_id.");
	assertFail(dm({ appeal_id: -1 }), "Should reject negative integer appeal_id.");
	assertFail(dm({ clear: "invalid_clear" }), "Should reject invalid clears.");
	assertFail(dm({ difficulty: "invalid_difficulty" }), "Should reject invalid difficulties.");

	assertFail(dm({ early: -1 }), "Should reject negative early counts.");
	assertFail(dm({ late: -1 }), "Should reject negative late counts.");
	assertFail(dm({ early: 1.5 }), "Should reject non-integer early counts.");
	assertFail(dm({ late: 1.5 }), "Should reject non-integer late counts.");

	assertFail(dm({ gauge: -1 }), "Should reject negative gauge values.");
	assertFail(dm({ gauge: 101 }), "Should reject gauge values over 100.");
	assertSuccess(dm({ gauge: 0 }), "Should allow gauge values of 0.");
	assertSuccess(dm({ gauge: 100 }), "Should allow gauge values of 100.");

	assertFail(dm({ grade: "invalid_grade" }), "Should reject invalid grades.");

	assertFail(dm({ max_chain: -1 }), "Should reject negative max_chains.");
	assertFail(dm({ max_chain: 100.5 }), "Should reject non-integer max_chains.");

	assertFail(dm({ btn_rate: -1 }), "Should reject negative btn_rates.");
	assertFail(dm({ btn_rate: 200.1 }), "Should reject btn_rates over 200.");
	assertSuccess(dm({ btn_rate: 0 }), "Should allow btn_rate values of 0.");
	assertSuccess(dm({ btn_rate: 200 }), "Should allow btn_rate values of 200.");
	assertFail(dm({ vol_rate: -1 }), "Should reject negative vol_rates.");
	assertFail(dm({ vol_rate: 200.1 }), "Should reject vol_rates over 200.");
	assertSuccess(dm({ vol_rate: 0 }), "Should allow vol_rate values of 0.");
	assertSuccess(dm({ vol_rate: 200 }), "Should allow vol_rate values of 200.");
	assertFail(dm({ long_rate: -1 }), "Should reject negative long_rates.");
	assertFail(dm({ long_rate: 200.1 }), "Should reject long_rates over 200.");
	assertSuccess(dm({ long_rate: 0 }), "Should allow long_rate values of 0.");
	assertSuccess(dm({ long_rate: 200 }), "Should allow long_rate values of 200.");

	assertFail(dm({ player_name: null }), "Should reject non-string player_names.");
	assertFail(dm({ rate: "invalid_rate" }), "Should reject invalid rates.");

	assertFail(dm({ skill_frame: "invalid_skill_frame" }), "Should reject invalid skill_frames.");
	assertFail(dm({ skill_level: "invalid_skill_level" }), "Should reject invalid skill_levels.");

	assertFail(dm({ track_no: -1 }), "Should reject negative track_no's.");
	assertFail(dm({ track_no: 50.5 }), "Should reject non-int track_no's.");

	t.end();
});
