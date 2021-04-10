import { RequireLoggedIn } from "./require-logged-in";
import expMiddlewareMock from "express-request-mock";
import t from "tap";

t.test("#RequireLoggedIn", (t) => {
    t.test("Should reject users that are not logged in.", async (t) => {
        const { res } = await expMiddlewareMock(RequireLoggedIn, {
            session: {
                ktchi: null,
            },
        });

        t.is(res.statusCode, 401, "Should return 401");

        let json = res._getJSONData();

        t.deepEqual(json, {
            success: false,
            description: "You are not authorised to perform this action.",
        });
    });

    t.end();
});
