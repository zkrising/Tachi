import t from "tap";
import mockApi from "./mock-api";

export function RequireNeutralAuthentication(url: string, method: "GET" | "POST" = "GET") {
    t.test(`Testing authentication for ${method} ${url}.`, async (t) => {
        let res;

        if (method === "GET") {
            res = await mockApi.get(url);
        } else {
            res = await mockApi.post(url);
        }

        t.equal(res.status, 401, "Should return 401 immediately.");
        t.equal(
            res.body.description,
            "You are not authorised to perform this action.",
            "Should return an appropriate error message."
        );

        // CloseAllConnections();

        t.end();
    });
}
