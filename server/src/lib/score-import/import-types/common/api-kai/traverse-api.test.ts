import t from "tap";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";
import { agta } from "../../../../../test-utils/misc";
import { MockJSONFetch } from "../../../../../test-utils/mock-fetch";
import ResetDBState from "../../../../../test-utils/reset-db-state";
import CreateLogCtx from "../../../../logger/logger";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { TraverseKaiAPI } from "./traverse-api";

const logger = CreateLogCtx(__filename);

const fakeAuth = "bar";

t.test("#TraverseKaiAPI", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should traverse the API", async (t) => {
        const mockKaiAPI = MockJSONFetch({
            "http://url.com/sub": {
                _links: {
                    _next: "http://url.com/sub?page=2",
                },
                _items: [1, 2, 3, 4],
            },
            "http://url.com/sub?page=2": {
                _links: {
                    _next: null,
                },
                _items: [5, 6],
            },
        });

        const res = TraverseKaiAPI("http://url.com", "/sub", fakeAuth, logger, mockKaiAPI);

        const elements = await agta(res);

        t.strictSame(elements, [1, 2, 3, 4, 5, 6]);

        t.end();
    });

    t.test("Should throw on attempted SSRF", (t) => {
        const mockKaiAPI = MockJSONFetch({
            "http://url.com/sub": {
                _links: {
                    _next: "http://evil.com/sub?page=2",
                },
                _items: [1, 2, 3, 4],
            },
            "http://url.com/sub?page=2": {
                _links: {
                    _next: null,
                },
                _items: [5, 6],
            },
        });
        const res = TraverseKaiAPI("http://url.com", "/sub", fakeAuth, logger, mockKaiAPI);

        t.rejects(
            () => agta(res),
            new ScoreImportFatalError(500, `http://url.com returned invalid data.`)
        );

        t.end();
    });

    t.test("Should throw on invalid response JSON", (t) => {
        const mockKaiAPI = () => ({ json: null } as any);
        const res = TraverseKaiAPI("http://url.com", "/sub", fakeAuth, logger, mockKaiAPI);

        t.rejects(() => agta(res));

        t.end();
    });

    t.test("Should throw on request failure", (t) => {
        const mockKaiAPI = () => {
            throw new Error("Fake Request timeout...");
        };
        const res = TraverseKaiAPI("http://url.com", "/sub", fakeAuth, logger, mockKaiAPI);

        t.rejects(() => agta(res));

        t.end();
    });

    t.test("Should throw on invalid _links", (t) => {
        const mockKaiAPI = MockJSONFetch({
            "http://url.com/sub": {
                _links: null,
            },
        });

        const res = TraverseKaiAPI("http://url.com", "/sub", fakeAuth, logger, mockKaiAPI);

        t.rejects(() => agta(res));

        const mockKaiAPI2 = MockJSONFetch({
            "http://url.com/sub": {
                _links: "foo",
            },
        });

        const res2 = TraverseKaiAPI("http://url.com", "/sub", fakeAuth, logger, mockKaiAPI2);

        t.rejects(() => agta(res2));

        t.end();
    });

    t.test("Should throw on invalid _links._next", (t) => {
        const mockKaiAPI = MockJSONFetch({
            "http://url.com/sub": {
                _links: {},
            },
        });

        const res = TraverseKaiAPI("http://url.com", "/sub", fakeAuth, logger, mockKaiAPI);

        t.rejects(() => agta(res));

        const mockKaiAPI2 = MockJSONFetch({
            "http://url.com/sub": {
                _links: {
                    _next: {},
                },
            },
        });

        const res2 = TraverseKaiAPI("http://url.com", "/sub", fakeAuth, logger, mockKaiAPI2);

        t.rejects(() => agta(res2));

        t.end();
    });

    t.test("Should throw on invalid _items", (t) => {
        const mockKaiAPI = MockJSONFetch({
            "http://url.com/sub": {
                _links: {
                    _next: null,
                },
                _items: {},
            },
        });

        const res = TraverseKaiAPI("http://url.com", "/sub", fakeAuth, logger, mockKaiAPI);

        t.rejects(() => agta(res));

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
