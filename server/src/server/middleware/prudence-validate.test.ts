import prValidate from "./prudence-validate";
import Prudence from "prudence";
import t from "tap";
import { expressRequestMock } from "test-utils/mock-request";

t.test("#PrudenceMiddleware", (t) => {
	const mw = prValidate({ foo: Prudence.regex(/^baz$/u) }, { foo: "example error message" });

	t.test("Should return 400 on invalid prudence validation", async (t) => {
		const { res } = await expressRequestMock(mw, {
			query: {
				foo: "bar",
			},
		});

		t.equal(res.statusCode, 400, "Status code should be 400");

		const json = res._getJSONData();

		t.equal(
			json.description,
			"[foo] example error message (Received bar)",
			"Should return error message"
		);

		t.end();
	});

	t.test("Should return 'nothing' instead of undefined for missing fields", async (t) => {
		const { res } = await expressRequestMock(mw, {
			query: {},
		});

		t.equal(res.statusCode, 400, "Status code should be 400");

		const json = res._getJSONData();

		t.equal(
			json.description,
			"[foo] example error message (Received nothing (undefined))",
			"Should return error message with received nothing"
		);

		t.end();
	});

	t.test("Should allow valid prudence data.", async (t) => {
		const { res } = await expressRequestMock(mw, {
			query: {
				foo: "baz",
			},
		});

		t.equal(res.statusCode, 200, "Should stay as 200");

		// no body -- not returned.
		t.equal(res._isJSON(), false, "Should not have any data set");

		t.end();
	});

	t.test("Should allow valid bodies on non-GET requests", async (t) => {
		const { res } = await expressRequestMock(mw, {
			method: "POST",
			body: {
				foo: "baz",
			},
		});

		t.equal(res.statusCode, 200, "Should stay as 200");

		// no body -- not returned.
		t.equal(res._isJSON(), false, "Should not have any data set");

		t.end();
	});

	t.test("Should return 400 on invalid prudence validation for non-GET requests", async (t) => {
		const { res } = await expressRequestMock(mw, {
			method: "POST",
			body: {
				foo: "bar",
			},
		});

		t.equal(res.statusCode, 400, "Status code should be 400");

		const json = res._getJSONData();

		t.equal(
			json.description,
			"[foo] example error message (Received bar)",
			"Should return error message"
		);

		t.end();
	});

	const mwWithPassword = prValidate(
		{ "!password": "string" },
		{ "!password": "invalid password" }
	);

	t.test(
		"Should not return the contents of the error message if the field starts with !",
		async (t) => {
			const { res } = await expressRequestMock(mwWithPassword, {
				query: {
					"!password": 123,
				},
			});

			t.equal(res.statusCode, 400, "Status code should be 400");

			const json = res._getJSONData();

			t.equal(
				json.description,
				"[!password] invalid password (Received ****)",
				"Should return obscured error message"
			);

			t.end();
		}
	);

	t.test(
		"Should not return the contents of the error message if the field starts with ! and is undefined.",
		async (t) => {
			const { res } = await expressRequestMock(mwWithPassword, {
				query: {
					"!password": undefined,
				},
			});

			t.equal(res.statusCode, 400, "Status code should be 400");

			const json = res._getJSONData();

			t.equal(
				json.description,
				"[!password] invalid password (Received nothing (undefined))",
				"Should indicate if no data was sent in obscured error message"
			);

			t.end();
		}
	);

	t.end();
});
