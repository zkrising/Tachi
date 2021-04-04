import {
    AddNewUserAPIKey,
    CreateAPIKey,
    CreateBetaKey,
    AddNewBetakey,
    ReinstateBetakey,
} from "./auth-core";
import t from "tap";
import db, { CloseConnection } from "../db";
import { BetaKeyDocument, PrivateUserDocument } from "kamaitachi-common";
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

        t.isNot(data, null, "Return is not null");

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

        let inDatabase = await db.get("public-api-keys").findOne({
            _id: data._id,
        });

        t.strictSame(data, inDatabase, "Data from database is identical to data returned");

        t.end();
    });

    t.end();
});

t.test("#ReinstateBetaKey", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should change the 'consumed' property of a betakey to true.", async (t) => {
        // mock insert
        let betakey = await db.get<BetaKeyDocument>("betakeys").insert({
            betakey: "foobar",
            consumed: true,
            createdBy: 1,
            createdOn: 1,
        });

        let response = await ReinstateBetakey(betakey);

        // @ts-expect-error Monks' types are WRONG. this is nModified, not modifiedCount
        t.is(response.nModified, 1, "Should modify one document");

        let betakey2 = await db.get<BetaKeyDocument>("betakeys").findOne({
            betakey: betakey.betakey, // lol
        });

        t.is(betakey2!.consumed, false, "Should no longer be consumed");

        t.end();
    });

    t.end();
});

t.test("#CreateBetaKey", (t) => {
    t.match(CreateBetaKey(), /^[0-9a-f]{40}$/, "Betakey should be a 40 character hex string.");

    t.end();
});

t.test("#AddNewBetakey", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should create a new beta key for a given user", async (t) => {
        let userDoc = await db.get("users").findOne({ id: 1 });

        let result = await AddNewBetakey(userDoc);

        t.is(result.createdBy, userDoc.id, "Betakey should be created by the requesting user.");
        t.is(result.consumed, false, "Betakey should not be consumed.");

        // was created +/- 6 seconds from now. This is perhaps too lenient, but we're only really testing its just around now ish.
        t.assert(
            Math.abs(result.createdOn - Date.now()) <= 6000,
            "Betakey was created roughly now."
        );

        t.match(
            result.betakey,
            /^[0-9a-f]{40}$/,
            "Betakey should have contents of a 40 character hex string."
        );
    });

    t.end();
});

t.teardown(CloseConnection);
