import { CreateInviteCode, AddNewInvite, ReinstateInvite, ValidateCaptcha } from "./auth";
import t from "tap";
import db from "../../../../../external/mongo/db";
import ResetDBState from "../../../../../test-utils/reset-db-state";
import { MockBasicFetch } from "../../../../../test-utils/mock-fetch";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";

t.test("#ReinstateInvite", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should change the 'consumed' property of an invite to true.", async (t) => {
        // mock insert
        const inviteDoc = await db.invites.insert({
            code: "foobar",
            consumed: true,
            createdBy: 1,
            createdOn: 1,
        });

        const response = await ReinstateInvite(inviteDoc);

        t.equal(response.nModified, 1, "Should modify one document");

        const invite2 = await db.invites.findOne({
            code: inviteDoc.code, // lol
        });

        t.equal(invite2!.consumed, false, "Should no longer be consumed");

        t.end();
    });

    t.end();
});

t.test("#CreateInviteCode", (t) => {
    t.match(CreateInviteCode(), /^[0-9a-f]{40}$/u, "Invite should be a 40 character hex string.");

    t.end();
});

t.test("#AddNewInvite", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should create a new invite from a given user", async (t) => {
        const userDoc = await db.users.findOne({ id: 1 });

        const result = await AddNewInvite(userDoc!);

        t.equal(result.createdBy, userDoc!.id, "Invite should be created by the requesting user.");
        t.equal(result.consumed, false, "Invite should not be consumed.");

        // was created +/- 6 seconds from now. This is perhaps too lenient, but we're only really testing its just around now ish.
        t.ok(Math.abs(result.createdOn - Date.now()) <= 6000, "Invite was created roughly now.");

        t.match(result.code, /^[0-9a-f]{40}$/u, "Invite code should be a 40 character hex string.");
    });

    t.end();
});

t.test("#ValidateCaptcha", async (t) => {
    t.equal(
        await ValidateCaptcha("200", "bar", MockBasicFetch({ status: 200 })),
        true,
        "Validates captcha when status return is 200"
    );

    t.equal(
        await ValidateCaptcha("400", "bar", MockBasicFetch({ status: 400 })),
        false,
        "Invalidates captcha when status return is not 200"
    );

    t.end();
});

t.teardown(CloseAllConnections);
