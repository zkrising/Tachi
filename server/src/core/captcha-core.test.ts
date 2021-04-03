import t from "tap";
import { mockFetch } from "../test-utils/mock-fetch";
import { ValidateCaptcha } from "./captcha-core";

t.test("#ValidateCaptcha", async (t) => {
    t.is(
        await ValidateCaptcha("200", "bar", mockFetch({ status: 200 })),
        true,
        "Validates captcha when status return is 200"
    );

    t.is(
        await ValidateCaptcha("400", "bar", mockFetch({ status: 400 })),
        false,
        "Invalidates captcha when status return is not 200"
    );

    t.end();
});
