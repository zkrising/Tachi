import t from "tap";
import expMiddlewareMock from "express-request-mock";
import prValidate from "./prudence-validate";
import Prudence from "prudence";

t.test("#PrudenceMiddleware", (t) => {
    const mw = prValidate({ foo: Prudence.regex(/^baz$/) }, { foo: "example error message" });

    t.test("Should return 400 on invalid prudence validation", async (t) => {
        let { res } = await expMiddlewareMock(mw, {
            query: {
                foo: "bar",
            },
        });

        t.is(res.statusCode, 400, "Status code should be 400");

        const json = res._getJSONData();
        t.is(
            json.description,
            "example error message (Received bar)",
            "Should return error message"
        );

        t.end();
    });

    t.test("Should return 'nothing' instead of undefined for missing fields", async (t) => {
        let { res } = await expMiddlewareMock(mw, {
            query: {},
        });

        t.is(res.statusCode, 400, "Status code should be 400");

        const json = res._getJSONData();
        t.is(
            json.description,
            "example error message (Received nothing)",
            "Should return error message with recieved nothing"
        );

        t.end();
    });

    t.test("Should allow valid prudence data.", async (t) => {
        let { res } = await expMiddlewareMock(mw, {
            query: {
                foo: "baz",
            },
        });

        t.is(res.statusCode, 200, "Should stay as 200");

        // no body -- not returned.
        t.is(res._isJSON(), false, "Should not have any data set");

        t.end();
    });

    t.test("Should allow valid bodies on non-GET requests", async (t) => {
        let { res } = await expMiddlewareMock(mw, {
            method: "POST",
            body: {
                foo: "baz",
            },
        });

        t.is(res.statusCode, 200, "Should stay as 200");

        // no body -- not returned.
        t.is(res._isJSON(), false, "Should not have any data set");

        t.end();
    });

    t.test("Should return 400 on invalid prudence validation for non-GET requests", async (t) => {
        let { res } = await expMiddlewareMock(mw, {
            method: "POST",
            body: {
                foo: "bar",
            },
        });

        t.is(res.statusCode, 400, "Status code should be 400");

        const json = res._getJSONData();
        t.is(
            json.description,
            "example error message (Received bar)",
            "Should return error message"
        );

        t.end();
    });

    t.end();
});
