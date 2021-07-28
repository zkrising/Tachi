import t from "tap";
import mockApi from "./mock-api";
import { APIPermissions } from "tachi-common";
import db from "external/mongo/db";
import ResetDBState from "./resets";

export function RequireAuthPerms(
	url: string,
	perms: APIPermissions | APIPermissions[],
	method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET"
) {
	t.test(`Testing permissions for ${method} ${url} [${perms}]`, async (t) => {
		const m = method.toLowerCase() as Lowercase<typeof method>;

		const res = await mockApi[m](url);

		// 401 if no auth given
		t.equal(res.statusCode, 401);

		await db["api-tokens"].insert({
			identifier: "temp_auth_perms",
			permissions: {},
			token: "temp_auth",
			userID: 1,
		});

		const resAuth = await mockApi[m](url).set("Authorization", "Bearer temp_auth");

		t.equal(resAuth.statusCode, 403);

		const prm = Array.isArray(perms) ? perms : [perms];

		await db["api-tokens"].insert({
			identifier: "temp_auth_perms2",
			permissions: Object.fromEntries(prm.map((e) => [e, true])),
			token: "temp_auth2",
			userID: 1,
		});

		const resAuthed = await mockApi[m](url).set("Authorization", "Bearer temp_auth2");

		t.not(resAuthed.statusCode, 401);
		t.not(resAuthed.statusCode, 403);

		await ResetDBState();

		t.end();
	});
}
