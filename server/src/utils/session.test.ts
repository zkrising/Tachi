import t from "tap";
import db from "external/mongo/db";
import { CloseAllConnections } from "test-utils/close-connections";
import ResetDBState from "test-utils/resets";
import { GetScoresFromSession } from "./session";

t.test("#GetScoresFromSession", async (t) => {
	t.beforeEach(ResetDBState);

	await ResetDBState();

	const exampleSession = await db.sessions.findOne();

	const scores = await GetScoresFromSession(exampleSession!);

	t.equal(
		scores.length,
		exampleSession!.scoreInfo.length,
		"Should return the same amount of scores as the session."
	);

	for (let i = 0; i < exampleSession!.scoreInfo.length; i++) {
		t.equal(
			scores[i].scoreID,
			exampleSession!.scoreInfo[i].scoreID,
			"Should return the scores requested."
		);
	}

	t.end();
});

t.teardown(CloseAllConnections);
