import { CreateScoreID, GetWithScoreID } from "./score-id";
import t from "tap";
import { dmf } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { Testing511SPA, TestingIIDXSPDryScore } from "test-utils/test-data";
import type { DryScoreData } from "../common/types";

t.test("#GetWithScoreID", async (t) => {
	await ResetDBState();

	const sc = await GetWithScoreID("TESTING_SCORE_ID");

	t.not(sc, null, "Return a score for a valid score id");

	const nl = await GetWithScoreID("INVALID SCORE ID");

	t.equal(nl, null, "Should return null for score IDs it cannot resolve");

	t.end();
});

t.test("#CreateScoreID", (t) => {
	const scoreID = CreateScoreID("iidx:SP", 1, TestingIIDXSPDryScore, Testing511SPA.chartID);

	t.match(
		scoreID,
		/^T[0-9a-f]{40}/u,
		"Should return an T followed by 40 characters of lowercase hex as scoreID."
	);

	t.not(
		scoreID,
		CreateScoreID("iidx:SP", 2, TestingIIDXSPDryScore, Testing511SPA.chartID),
		"Hash should be affected by userID."
	);

	t.equal(
		scoreID,
		CreateScoreID("iidx:SP", 1, TestingIIDXSPDryScore, Testing511SPA.chartID),
		"ScoreIDs should be consistently generatable"
	);

	t.equal(
		scoreID,
		CreateScoreID(
			"iidx:SP",
			1,
			dmf(TestingIIDXSPDryScore, {
				scoreData: {
					optional: {
						bp: 293,
					},
					judgements: {
						bad: 129,
					},
				} as DryScoreData<"iidx:SP">,
			}),
			Testing511SPA.chartID
		),
		"ScoreIDs should only be affected by score metrics."
	);

	t.not(
		scoreID,
		CreateScoreID(
			"iidx:SP",
			1,
			dmf(TestingIIDXSPDryScore, {
				scoreData: {
					score: 0,
				} as DryScoreData<"iidx:SP">,
			}),
			Testing511SPA.chartID
		),
		"ScoreIDs should not produce the same value if a provided metric is different."
	);

	t.end();
});
