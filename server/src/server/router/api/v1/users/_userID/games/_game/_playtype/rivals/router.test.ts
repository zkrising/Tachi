import db from "external/mongo/db";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import { mkFakeGameSettings, mkFakeUser } from "test-utils/misc";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { FakeOtherUser } from "test-utils/test-data";
import type { PublicUserDocument } from "tachi-common";

const SetupRivals = async () => {
	await db.users.insert([FakeOtherUser, mkFakeUser(3), mkFakeUser(4)]);
	await db["game-settings"].insert([
		mkFakeGameSettings(2, "iidx", "SP"),
		mkFakeGameSettings(3, "iidx", "SP"),
	]);

	await db["game-settings"].update(
		{
			userID: 1,
		},
		{
			$set: {
				rivals: [2, 3],
			},
		}
	);
};

t.test("GET /api/v1/users/:userID/games/:game/:playtype/rivals", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(SetupRivals);

	t.test("Should return the userdocs of your rivals.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/rivals");

		t.equal(res.statusCode, 200);

		t.strictSame(
			res.body.body.map((e: PublicUserDocument) => e.id),
			[2, 3],
			"Should have the users rivals and no more."
		);

		t.end();
	});

	t.test("Should panic if your rival doesn't exist.", async (t) => {
		await db.users.remove({ id: 3 });

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/rivals");

		t.equal(res.statusCode, 500);

		t.end();
	});

	t.end();
});

t.test("PUT /api/v1/users/:userID/games/:game/:playtype/rivals", async (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(SetupRivals);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should replace the users rivals.", async (t) => {
		const res = await mockApi
			.put("/api/v1/users/1/games/iidx/SP/rivals")
			.set("Cookie", cookie)
			.send({
				rivalIDs: [2],
			});

		t.equal(res.statusCode, 200);

		const dbRes = await db["game-settings"].findOne({
			userID: 1,
			game: "iidx",
			playtype: "SP",
		});

		t.strictSame(dbRes?.rivals, [2]);

		t.end();
	});

	t.test("Should return 400 if the user tries to rival themselves.", async (t) => {
		const res = await mockApi
			.put("/api/v1/users/1/games/iidx/SP/rivals")
			.set("Cookie", cookie)
			.send({
				rivalIDs: [1],
			});

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Should return 400 if the user tries to rival > 5 people.", async (t) => {
		await db.users.insert([mkFakeUser(5), mkFakeUser(6)]);

		const res = await mockApi
			.put("/api/v1/users/1/games/iidx/SP/rivals")
			.set("Cookie", cookie)
			.send({
				rivalIDs: [2, 3, 4, 5, 6],
			});

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Should return 400 if the user tries to rival someone who doesn't exist.", async (t) => {
		const res = await mockApi
			.put("/api/v1/users/1/games/iidx/SP/rivals")
			.set("Cookie", cookie)
			.send({
				rivalIDs: [5],
			});

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test(
		"Should return 400 if the user tries to rival someone who exists but hasn't played the GPT.",
		async (t) => {
			await db.users.insert(mkFakeUser(5));

			const res = await mockApi
				.put("/api/v1/users/1/games/iidx/SP/rivals")
				.set("Cookie", cookie)
				.send({
					rivalIDs: [5],
				});

			t.equal(res.statusCode, 400);

			t.end();
		}
	);

	t.test("Should return 401 if user has no auth.", async (t) => {
		const res = await mockApi.put("/api/v1/users/1/games/iidx/SP/rivals").send({
			rivalIDs: [2],
		});

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/rivals/challengers", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(SetupRivals);

	t.test("Should return all of the users that rival this UGPT.", async (t) => {
		await db.users.insert(mkFakeUser(5));

		await db["game-settings"].remove({ userID: 3 });
		await db["game-settings"].remove({ userID: 4 });

		await db["game-settings"].insert([
			mkFakeGameSettings(2, "chunithm", "Single", { rivals: [1] }),
			mkFakeGameSettings(3, "iidx", "SP", { rivals: [1, 3] }),
			mkFakeGameSettings(4, "iidx", "SP", { rivals: [1, 3, 5] }),
			mkFakeGameSettings(5, "iidx", "SP", { rivals: [1, 4] }),
		]);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/rivals/challengers");

		t.equal(res.statusCode, 200);

		t.hasStrict(
			res.body.body.map((e: PublicUserDocument) => e.id),
			[3, 4, 5]
		);

		t.end();
	});

	t.end();
});
