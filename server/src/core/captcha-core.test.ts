import t from "tap";
import { MockFetch } from "../test-utils/mock-fetch";
import { ValidateCaptcha } from "./captcha-core";

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
