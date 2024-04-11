import { ValidateScore } from "./validate-score";
import { ONE_DAY } from "lib/constants/time";
import t from "tap";
import { Testing511SPA, TestingIIDXSPScore } from "test-utils/test-data";

t.test("#ValidateScore", (t) => {
	t.test("Should reject scores in the future", (t) => {
		t.throws(
			() => {
				ValidateScore(
					{ ...TestingIIDXSPScore, timeAchieved: Date.now() + ONE_DAY * 2 },
					Testing511SPA
				);
			},
			{
				message: "Invalid timestamp: score happens in the future.",
			}
		);

		t.end();
	});

	t.end();
});
