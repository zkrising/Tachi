import t from "tap";
import { CloseMongoConnection } from "../db/db";
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
        let result = await GetUserCaseInsensitive("test_zkldi");

        t.not(result, null, "Should not return null");

        t.equal(result!.username, "test_zkldi", "Should return test_zkldi");

        prAssert(result, PRUDENCE_PUBLIC_USER, "Should return a conforming PublicUserDocument");

        // @ts-expect-error yeah
        t.equal(result.password, undefined, "Should not return password");
        // @ts-expect-error yeah
        t.equal(result.email, undefined, "Should not return email");
    });

    t.test("Should return the user for an incorrectly cased username", async (t) => {
        let result = await GetUserCaseInsensitive("tesT_ZkLdi");

        t.not(result, null, "Should not return null");

        t.equal(result!.username, "test_zkldi", "Should return test_zkldi");

        prAssert(result, PRUDENCE_PUBLIC_USER, "Should return a conforming PublicUserDocument");

        // @ts-expect-error yeah
        t.equal(result.password, undefined, "Should not return password");
        // @ts-expect-error yeah
        t.equal(result.email, undefined, "Should not return email");
    });

    t.test("Should not return the user for a username that does not exist", async (t) => {
        let result = await GetUserCaseInsensitive("foobar");

        t.equal(result, null, "Should return null");
    });

    t.end();
});

t.test("#PRIVATEINFO_GetUserCaseInsensitive", (t) => {
    t.test("Should return the user for an exact username", async (t) => {
        let result = await PRIVATEINFO_GetUserCaseInsensitive("test_zkldi");

        t.not(result, null, "Should not return null");

        t.equal(result!.username, "test_zkldi", "Should return test_rzkldi");

        prAssert(result, PRUDENCE_PRIVATE_USER, "Should return a conforming PrivateUserDocument");
    });

    t.test("Should return the user for an incorrectly cased username", async (t) => {
        let result = await PRIVATEINFO_GetUserCaseInsensitive("tesT_ZkLdi");

        t.not(result, null, "Should not return null");

        t.equal(result!.username, "test_zkldi", "Should return test_zkldi");

        prAssert(result, PRUDENCE_PRIVATE_USER, "Should return a conforming PrivateUserDocument");
    });

    t.test("Should not return the user for a username that does not exist", async (t) => {
        let result = await PRIVATEINFO_GetUserCaseInsensitive("foobar");

        t.equal(result, null, "Should return null");
    });

    t.end();
});

t.teardown(CloseMongoConnection);
