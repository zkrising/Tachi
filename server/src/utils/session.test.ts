import { GetScoresFromSession } from "./session";
import db from "external/mongo/db";
import t from "tap";
import ResetDBState from "test-utils/resets";

t.test("#GetScoresFromSession", async (t) => {
	t.beforeEach(ResetDBState);

	await ResetDBState();

	const exampleSession = await db.sessions.findOne();

	const scores = await GetScoresFromSession(exampleSession!);

	t.equal(
		scores.length,
		exampleSession!.scoreIDs.length,
		"Should return the same amount of scores as the session."
	);

	for (let i = 0; i < exampleSession!.scoreIDs.length; i++) {
		t.equal(
			scores[i]!.scoreID,
			exampleSession!.scoreIDs[i]!.scoreID,
			"Should return the scores requested."
		);
	}

	t.end();
});
