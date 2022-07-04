import mockApi from "./mock-api";
import ResetDBState from "./resets";
import db from "external/mongo/db";
import t from "tap";
import type { APIPermissions } from "tachi-common";

export function RequireAuthPerms(
	url: string,
	perms: APIPermissions | Array<APIPermissions>,
	method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT" = "GET"
) {
	return t.test(
		`Testing permissions for ${method} ${url} [${
			Array.isArray(perms) ? perms.join(", ") : perms
		}]`,
		async (t) => {
			const m = method.toLowerCase() as Lowercase<typeof method>;

			const res = await mockApi[m](url);

			// 401 if no auth given
			t.equal(res.statusCode, 401);

			await db["api-tokens"].insert({
				identifier: "temp_auth_perms",
				permissions: {},
				token: "temp_auth",
				userID: 1,
				fromAPIClient: null,
			});

			const resAuth = await mockApi[m](url).set("Authorization", "Bearer temp_auth");

			t.equal(resAuth.statusCode, 403);

			const prm = Array.isArray(perms) ? perms : [perms];

			await db["api-tokens"].insert({
				identifier: "temp_auth_perms2",
				permissions: Object.fromEntries(prm.map((e) => [e, true])),
				token: "temp_auth2",
				userID: 1,
				fromAPIClient: null,
			});

			const resAuthed = await mockApi[m](url).set("Authorization", "Bearer temp_auth2");

			t.not(resAuthed.statusCode, 401);
			t.not(resAuthed.statusCode, 403);

			await ResetDBState();

			t.end();
		}
	);
}
