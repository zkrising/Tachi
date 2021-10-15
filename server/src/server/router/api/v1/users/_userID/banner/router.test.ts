import t from "tap";
import db from "external/mongo/db";
import { CDNStoreOrOverwrite } from "lib/cdn/cdn";
import { GetProfileBannerURL } from "lib/cdn/url-format";

import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { GetKTDataBuffer } from "test-utils/test-data";

t.test("GET /api/v1/users/:userID/banner", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the default profile banner if user has no custom banner", async (t) => {
		await CDNStoreOrOverwrite("/users/default/banner", "test");
		const res = await mockApi.get("/api/v1/users/1/banner").redirects(1);

		t.equal(res.body.toString(), "test");

		t.end();
	});

	t.test("Should return a custom profile banner if one is set", async (t) => {
		await CDNStoreOrOverwrite(GetProfileBannerURL(1), "foo");
		await db.users.update({ id: 1 }, { $set: { customBanner: true } });
		const res = await mockApi.get("/api/v1/users/1/banner").redirects(1);

		t.equal(res.body.toString(), "foo");

		t.end();
	});

	t.end();
});

t.test("PUT /api/v1/users/:userID/banner", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should set a profile banner if user has no custom banner", async (t) => {
		const img = GetKTDataBuffer("/images/acorn.png");

		const res = await mockApi
			.put("/api/v1/users/1/banner")
			.set("Authorization", "Bearer fake_api_token")
			.attach("banner", img, "file.jpg");

		t.equal(res.statusCode, 200);

		const get = await mockApi.get(res.body.body.get).redirects(1);

		t.strictSame(img, get.body, "Profile banner should be stored.");

		t.end();
	});

	t.test("Should set a profile banner if user has custom banner", async (t) => {
		await db.users.update({ id: 1 }, { $set: { customBanner: true } });

		const img = GetKTDataBuffer("/images/acorn.png");

		const res = await mockApi
			.put("/api/v1/users/1/banner")
			.set("Authorization", "Bearer fake_api_token")
			.attach("banner", img, "file.jpg");

		t.equal(res.statusCode, 200);

		const get = await mockApi.get(res.body.body.get).redirects(1);

		t.strictSame(img, get.body, "Profile banner should be stored.");

		t.end();
	});

	t.end();
});
