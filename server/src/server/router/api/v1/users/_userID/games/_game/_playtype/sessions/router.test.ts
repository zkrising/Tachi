import t from "tap";
import db from "../../../../../../../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../../../../../../../test-utils/close-connections";
import mockApi from "../../../../../../../../../../test-utils/mock-api";
import ResetDBState from "../../../../../../../../../../test-utils/resets";
import { LoadKTBlackIIDXData } from "../../../../../../../../../../test-utils/test-data";
import { SessionDocument } from "tachi-common";

t.test("GET /api/v1/users/:userID/games/:game/:playtype/sessions", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadKTBlackIIDXData);

	t.test("Should return 400 if no search param is given", async (t) => {
		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/sessions");

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		t.end();
	});

	t.test("Should return 400 if invalid search param is given", async (t) => {
		const res = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/sessions?search=foo&search=bar"
		);

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		// evil eval attempts
		const res2 = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/sessions?search[$where]=process.exit(1)"
		);

		t.equal(res2.statusCode, 400);
		t.equal(res2.body.success, false);

		t.end();
	});

	t.test("Should search a user's sessions.", async (t) => {
		await db.sessions.insert(
			["Epic Session", "Session Of Epic", "Epic Gaming", "something else", "bad session"].map(
				(e) => ({
					userID: 1,
					game: "iidx",
					playtype: "SP",
					name: e,
					desc: "something",
					sessionID: e, // hack to avoid db nonsense
				})
			) as SessionDocument[]
		);

		const res = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/sessions?search=Epic"
		);

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved 3 sessions.",
			body: [],
		});

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/sessions/best", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadKTBlackIIDXData);

	t.test("Should return a user's best 100 sessions.", async (t) => {
		const sessions: SessionDocument[] = [];

		for (let i = 0; i < 200; i++) {
			sessions.push({
				sessionID: i.toString(),
				game: "iidx",
				playtype: "SP",
				userID: 1,
				calculatedData: {
					ktRating: i,
				},
			} as SessionDocument);
		}

		await db.sessions.remove({});
		await db.sessions.insert(sessions);

		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/sessions/best");

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved 100 sessions.",
		});

		t.strictSame(
			res.body.body.map((e: SessionDocument) => e.sessionID),
			sessions
				.slice(100)
				.reverse()
				.map((e) => e.sessionID)
		);

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
