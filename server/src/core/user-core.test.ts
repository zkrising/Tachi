import t from "tap";
import { CloseConnection } from "../db/db";
import { PRUDENCE_PRIVATE_USER, PRUDENCE_PUBLIC_USER } from "../db/schemas";
import prAssert from "../test-utils/prassert";
import {
    GetUserCaseInsensitive,
    GetUserWithID,
    PRIVATEINFO_GetUserCaseInsensitive,
    PRIVATEINFO_GetUserWithID,
    ResolveUser,
} from "./user-core";

t.test("#GetUserCaseInsensitive", (t) => {
    t.test("Should return the user for an exact username", async (t) => {
        let result = await GetUserCaseInsensitive("zkldi");

        t.isNot(result, null, "Should not return null");

        t.is(result!.username, "zkldi", "Should return zkldi");

        prAssert(result, PRUDENCE_PUBLIC_USER, "Should return a conforming PublicUserDocument");

        // @ts-expect-error yeah
        t.is(result.password, undefined, "Should not return password");
        // @ts-expect-error yeah
        t.is(result.email, undefined, "Should not return email");
    });

    t.test("Should return the user for an incorrectly cased username", async (t) => {
        let result = await GetUserCaseInsensitive("ZkLdi");

        t.isNot(result, null, "Should not return null");

        t.is(result!.username, "zkldi", "Should return zkldi");

        prAssert(result, PRUDENCE_PUBLIC_USER, "Should return a conforming PublicUserDocument");

        // @ts-expect-error yeah
        t.is(result.password, undefined, "Should not return password");
        // @ts-expect-error yeah
        t.is(result.email, undefined, "Should not return email");
    });

    t.test("Should not return the user for a username that does not exist", async (t) => {
        let result = await GetUserCaseInsensitive("foobar");

        t.is(result, null, "Should return null");
    });

    t.end();
});

t.test("#GetUserCaseInsensitive", (t) => {
    t.test("Should return the user for an exact username", async (t) => {
        let result = await PRIVATEINFO_GetUserCaseInsensitive("zkldi");

        t.isNot(result, null, "Should not return null");

        t.is(result!.username, "zkldi", "Should return zkldi");

        prAssert(result, PRUDENCE_PRIVATE_USER, "Should return a conforming PrivateUserDocument");
    });

    t.test("Should return the user for an incorrectly cased username", async (t) => {
        let result = await PRIVATEINFO_GetUserCaseInsensitive("ZkLdi");

        t.isNot(result, null, "Should not return null");

        t.is(result!.username, "zkldi", "Should return zkldi");

        prAssert(result, PRUDENCE_PRIVATE_USER, "Should return a conforming PrivateUserDocument");
    });

    t.test("Should not return the user for a username that does not exist", async (t) => {
        let result = await PRIVATEINFO_GetUserCaseInsensitive("foobar");

        t.is(result, null, "Should return null");
    });

    t.end();
});

t.teardown(CloseConnection);
