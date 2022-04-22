import db from "external/mongo/db";
import { DatabaseSchemas } from "external/mongo/schemas";
import { PublicUserDocument } from "tachi-common";
import t from "tap";
import { mkFakeUser } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { FormatUserDoc, GetUserCaseInsensitive, GetUsersWithIDs } from "./user";

t.test("#GetUserCaseInsensitive", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the user for an exact username", async (t) => {
		const result = await GetUserCaseInsensitive("test_zkldi");

		t.not(result, null, "Should not return null");

		t.equal(result!.username, "test_zkldi", "Should return test_zkldi");

		t.ok(DatabaseSchemas.users(result), "Should return a conforming PublicUserDocument");

		// @ts-expect-error yeah
		t.equal(result.password, undefined, "Should not return password");
		// @ts-expect-error yeah
		t.equal(result.email, undefined, "Should not return email");
	});

	t.test("Should return the user for an incorrectly cased username", async (t) => {
		const result = await GetUserCaseInsensitive("tesT_ZkLdi");

		t.not(result, null, "Should not return null");

		t.equal(result!.username, "test_zkldi", "Should return test_zkldi");

		t.ok(DatabaseSchemas.users(result), "Should return a conforming PublicUserDocument");

		// @ts-expect-error yeah
		t.equal(result.password, undefined, "Should not return password");
		// @ts-expect-error yeah
		t.equal(result.email, undefined, "Should not return email");
	});

	t.test("Should not return the user for a username that does not exist", async (t) => {
		const result = await GetUserCaseInsensitive("foobar");

		t.equal(result, null, "Should return null");
	});

	t.end();
});

t.test("#GetUsersWithIDs", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(() => db.users.insert([mkFakeUser(2), mkFakeUser(3), mkFakeUser(4)]));

	t.test("Should return users with these IDs.", async (t) => {
		const res = await GetUsersWithIDs([2, 3]);

		const expected = [mkFakeUser(2), mkFakeUser(3)];

		for (const e of expected) {
			// workaround for monk mutating our state. I know this is bad.
			// I'll fix it at some point.
			delete e._id;
		}

		t.strictSame(res, expected, "Should return the user documents at these IDs.");

		t.end();
	});

	t.test("Shouldn't reject for duplicate userIDs", async (t) => {
		try {
			const res = await GetUsersWithIDs([1, 2, 1]);

			t.hasStrict(
				res.map((e) => e.id),
				[1, 2],
				"Should have the requested user IDs."
			);
			t.pass();
		} catch (e) {
			const err = e as Error;

			t.fail(err.message);
		}

		t.end();
	});

	t.test("Shouldn't reject for userID length mismatch", (t) => {
		t.rejects(() => GetUsersWithIDs([1, 2, 1, 5]));

		t.end();
	});

	t.end();
});

t.test("#FormatUserDoc", (t) => {
	t.equal(
		FormatUserDoc({ username: "zkldi", id: 123 } as PublicUserDocument),
		"zkldi (#123)",
		"Should format a user document into username #id format."
	);

	t.end();
});
