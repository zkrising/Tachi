import ResetDBState from "./resets";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { ClearTestingRateLimitCache } from "server/middleware/rate-limiter";
import { ALL_PERMISSIONS } from "tachi-common";
import type supertest from "supertest";

const logger = CreateLogCtx(__filename);

export async function CreateFakeAuthCookie(mockApi: supertest.SuperTest<supertest.Test>) {
	await ResetDBState();
	ClearTestingRateLimitCache();

	// possible security issue, ask hazel
	const res = await mockApi.post("/api/v1/auth/login").send({
		username: "test_zkldi",
		"!password": "password",
		captcha: "asdf",
	});

	if (res.status !== 200) {
		logger.crit("Failed to login. Cannot generate auth cookie.");
		throw res.body;
	}

	const headers = res.headers as Record<string, Array<string>>;

	const setCookieHeader: Array<string> | undefined = headers["set-cookie"];

	if (setCookieHeader === undefined) {
		throw new Error(`Failed to login, no Set-Cookie returned in response?`);
	}

	return setCookieHeader;
}

// my local dev env hates this part because of pnpm
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function InsertFakeTokenWithAllPerms(token: string): () => any {
	return async () => {
		await db["api-tokens"].insert({
			userID: 1,
			identifier: "Mock API Token",
			permissions: ALL_PERMISSIONS,
			token,
			fromAPIClient: null,
		});
	};
}
