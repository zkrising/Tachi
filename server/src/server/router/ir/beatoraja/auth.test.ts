import t from "tap";
import { ValidateIRClientVersion } from "./auth";
import expMiddlewareMock from "express-request-mock";

t.test("#ValidateIRClientVersion", (t) => {
	t.test("Should reject clients that are not supported", async (t) => {
		const { res } = await expMiddlewareMock(ValidateIRClientVersion, {
			headers: {
				"X-BokutachiIR-Version": "1.2.0",
			},
		});

		const json = res._getJSONData();

		t.equal(res.statusCode, 400);
		t.equal(json.success, false);
		t.match(json.description, /Invalid BokutachiIR client version/u);

		t.end();
	});

	t.test("Should reject no client header", async (t) => {
		const { res } = await expMiddlewareMock(ValidateIRClientVersion, {});

		const json = res._getJSONData();

		t.equal(res.statusCode, 400);
		t.equal(json.success, false);
		t.match(json.description, /Invalid BokutachiIR client version/u);

		t.end();
	});

	t.test("Should accept 2.0.0", async (t) => {
		const { res } = await expMiddlewareMock(ValidateIRClientVersion, {
			headers: {
				"X-BokutachiIR-Version": "2.0.0",
			},
		});

		t.equal(res.statusCode, 200);

		t.end();
	});

	t.end();
});
