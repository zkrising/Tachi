import t from "tap";
import { PRUDENCE_PUBLIC_USER } from "external/mongo/schemas";
import { prAssert } from "test-utils/asserts";
import { GetUserCaseInsensitive, FormatUserDoc } from "./user";
import { PublicUserDocument } from "tachi-common";

import ResetDBState from "test-utils/resets";

t.test("#GetUserCaseInsensitive", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the user for an exact username", async (t) => {
		const result = await GetUserCaseInsensitive("test_zkldi");

		t.not(result, null, "Should not return null");

		t.equal(result!.username, "test_zkldi", "Should return test_zkldi");

		prAssert(result, PRUDENCE_PUBLIC_USER, "Should return a conforming PublicUserDocument");

		// @ts-expect-error yeah
		t.equal(result.password, undefined, "Should not return password");
		// @ts-expect-error yeah
		t.equal(result.email, undefined, "Should not return email");
	});

	t.test("Should return the user for an incorrectly cased username", async (t) => {
		const result = await GetUserCaseInsensitive("tesT_ZkLdi");

		t.not(result, null, "Should not return null");

		t.equal(result!.username, "test_zkldi", "Should return test_zkldi");

		prAssert(result, PRUDENCE_PUBLIC_USER, "Should return a conforming PublicUserDocument");

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

t.test("#FormatUserDoc", (t) => {
	t.equal(
		FormatUserDoc({ username: "zkldi", id: 123 } as PublicUserDocument),
		"zkldi (#123)",
		"Should format a user document into username #id format."
	);

	t.end();
});
