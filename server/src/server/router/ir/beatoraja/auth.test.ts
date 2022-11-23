import { ValidateIRClientVersion } from "./auth";
import t from "tap";
import { expressRequestMock } from "test-utils/mock-request";

t.test("#ValidateIRClientVersion", (t) => {
	t.test("Should reject clients that are not supported", async (t) => {
		const { res } = await expressRequestMock(ValidateIRClientVersion, {
			headers: {
				"X-TachiIR-Version": "1.2.0",
			},
		});

		const json = res._getJSONData();

		t.equal(res.statusCode, 400);
		t.equal(json.success, false);
		t.match(json.description, /Invalid X-TachiIR-Version/u);

		t.end();
	});

	t.test("Should reject no client header", async (t) => {
		const { res } = await expressRequestMock(ValidateIRClientVersion, {});

		const json = res._getJSONData();

		t.equal(res.statusCode, 400);
		t.equal(json.success, false);
		t.match(json.description, /Invalid X-TachiIR-Version/u);

		t.end();
	});

	t.test("Should accept 2.0.0", async (t) => {
		const { res } = await expressRequestMock(ValidateIRClientVersion, {
			headers: {
				"X-TachiIR-Version": "v2.0.0",
			},
		});

		t.equal(res.statusCode, 200);

		t.end();
	});

	t.end();
});
