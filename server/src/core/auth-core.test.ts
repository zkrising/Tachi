import {
    AddNewUserAPIKey,
    CreateAPIKey,
    CreateInviteCode,
    AddNewInvite,
    ReinstateInvite,
} from "./auth-core";
import t from "tap";
import db, { CloseConnection } from "../db/db";
import { PrivateUserDocument } from "kamaitachi-common";
import prAssert from "../test-utils/prassert";
import Prudence from "prudence";
import ResetDBState from "../test-utils/reset-db-state";

t.test("#CreateAPIKey", (t) => {
    t.match(
        CreateAPIKey(),
        /[0-9a-f]{20}/,
        "Should return a 20 character long lowercase hex string."
    );

    t.end();
});

t.test("#AddNewUserAPIKey", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should insert a new API key into the database", async (t) => {
        let data = await AddNewUserAPIKey({ id: 1 } as PrivateUserDocument);

        t.not(data, null, "Return is not null");

        prAssert(
            data,
            {
                _id: Prudence.any, // lazy, should be isObjID? @todo
                apiKey: Prudence.regex(/[0-9a-f]{20}/),
                assignedTo: Prudence.is(1),
                expireTime: Prudence.is(3176708633264),
                permissions: {
                    selfkey: Prudence.is(true),
                    admin: Prudence.is(false),
                },
            },
            "Data should match a public API key object"
        );

        let inDatabase = await db["public-api-keys"].findOne({
            _id: data._id,
        });

        t.strictSame(data, inDatabase, "Data from database is identical to data returned");

        t.end();
    });

    t.end();
});

t.test("#ReinstateInvite", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should change the 'consumed' property of an invite to true.", async (t) => {
        // mock insert
        let inviteDoc = await db.invites.insert({
            code: "foobar",
            consumed: true,
            createdBy: 1,
            createdOn: 1,
        });

        let response = await ReinstateInvite(inviteDoc);

        // @ts-expect-error Monks' types are WRONG. this is nModified, not modifiedCount
        t.equal(response.nModified, 1, "Should modify one document");

        let invite2 = await db.invites.findOne({
            code: inviteDoc.code, // lol
        });

        t.equal(invite2!.consumed, false, "Should no longer be consumed");

        t.end();
    });

    t.end();
});

t.test("#CreateInviteCode", (t) => {
    t.match(CreateInviteCode(), /^[0-9a-f]{40}$/, "Invite should be a 40 character hex string.");

    t.end();
});

t.test("#AddNewInvite", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should create a new invite from a given user", async (t) => {
        let userDoc = await db.users.findOne({ id: 1 });

        let result = await AddNewInvite(userDoc!);

        t.equal(result.createdBy, userDoc!.id, "Invite should be created by the requesting user.");
        t.equal(result.consumed, false, "Invite should not be consumed.");

        // was created +/- 6 seconds from now. This is perhaps too lenient, but we're only really testing its just around now ish.
        t.ok(Math.abs(result.createdOn - Date.now()) <= 6000, "Invite was created roughly now.");

        t.match(result.code, /^[0-9a-f]{40}$/, "Invite code should be a 40 character hex string.");
    });

    t.end();
});

t.teardown(CloseConnection);
