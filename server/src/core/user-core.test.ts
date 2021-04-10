import t from "tap";
import prAssert from "../test-utils/prassert";
import { GetUserCaseInsensitive } from "./user-core";

t.test("#GetUserCaseInsensitive", async (t) => {
    t.test("Should return the user for an exact username", async (t) => {
        let result = await GetUserCaseInsensitive("zkldi");

        t.isNot(result, null, "Should not return null");

        prAssert(result,)
    })

    
    t.end()
});