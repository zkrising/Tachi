import { GetTotalAllowedInvites } from "./invites";
import { ONE_MONTH } from "lib/constants/time";
import { ServerConfig } from "lib/setup/config";
import t from "tap";
import { mkFakeUser } from "test-utils/misc";

t.test("#GetTotalAllowedInvites", (t) => {
	t.test("Should give the user more invites each month", (t) => {
		t.equal(
			GetTotalAllowedInvites(mkFakeUser(1, { joinDate: Date.now() })),
			0,
			"Should return 0 for a non-alpha/beta tester user who joined today."
		);

		t.equal(
			GetTotalAllowedInvites(mkFakeUser(1, { joinDate: Date.now(), badges: ["beta"] })),
			ServerConfig.INVITE_CODE_CONFIG?.BETA_USER_BONUS,
			"Should return BETA_USER_BONUS for a beta tester user who joined today."
		);
		t.equal(
			GetTotalAllowedInvites(mkFakeUser(1, { joinDate: Date.now(), badges: ["alpha"] })),
			ServerConfig.INVITE_CODE_CONFIG?.BETA_USER_BONUS,
			"Should return BETA_USER_BONUS for a alpha tester user who joined today."
		);

		t.equal(
			GetTotalAllowedInvites(mkFakeUser(1, { joinDate: Date.now() - ONE_MONTH })),
			ServerConfig.INVITE_CODE_CONFIG?.BATCH_SIZE,
			"Should return BATCH_SIZE for a user who joined a month ago."
		);

		t.equal(
			GetTotalAllowedInvites(mkFakeUser(1, { joinDate: Date.now() - ONE_MONTH * 2 })),
			(ServerConfig.INVITE_CODE_CONFIG?.BATCH_SIZE ?? 0) * 2,
			"Should return 2 * BATCH_SIZE for a user who joined two months ago."
		);

		t.end();
	});

	t.end();
});
