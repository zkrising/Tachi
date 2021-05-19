import {
    AddNewUserAPIKey,
    CreateAPIKey,
    CreateInviteCode,
    AddNewInvite,
    ReinstateInvite,
    ValidateCaptcha,
} from "./auth";
import t from "tap";
import db, { CloseMongoConnection } from "../db/db";
import { PrivateUserDocument } from "kamaitachi-common";
import { prAssert } from "../test-utils/asserts";
import Prudence from "prudence";
import ResetDBState from "../test-utils/reset-db-state";
import { MockFetch } from "../test-utils/mock-fetch";

t.test("#CreateAPIKey", (t) => {
    t.match(
        CreateAPIKey(),
        /[0-9a-f]{20}/u,
        "Should return a 20 character long lowercase hex string."
    );

    t.end();
});

t.test("#AddNewUserAPIKey", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should insert a new API key into the database", async (t) => {
        const data = await AddNewUserAPIKey({ id: 1 } as PrivateUserDocument);

        t.not(data, null, "Return is not null");

        prAssert(
            data,
            {
                _id: Prudence.any, // lazy
                apiKey: Prudence.regex(/[0-9a-f]{20}/u),
                assignedTo: Prudence.is(1),
                expireTime: Prudence.is(3176708633264),
                permissions: {
                    selfkey: Prudence.is(true),
                    admin: Prudence.is(false),
                },
            },
            "Data should match a public API key object"
        );

        const inDatabase = await db["public-api-keys"].findOne({
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
        await ValidateCaptcha("200", "bar", MockFetch({ status: 200 })),
        true,
        "Validates captcha when status return is 200"
    );

    t.equal(
        await ValidateCaptcha("400", "bar", MockFetch({ status: 400 })),
        false,
        "Invalidates captcha when status return is not 200"
    );

    t.end();
});

t.teardown(CloseMongoConnection);
