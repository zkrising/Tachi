import deepmerge from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import { KaiAuthDocument } from "tachi-common";
import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";
import { MockJSONFetch } from "test-utils/mock-fetch";
import ResetDBState from "test-utils/resets";
import { CreateKaiReauthFunction } from "./reauth";

const logger = CreateLogCtx(__filename);

const authDoc: KaiAuthDocument = {
	refreshToken: "REFRESH_TOKEN",
	service: "FLO",
	token: "foobar",
	userID: 1,
};

t.test("#CreateKaiReauthFunction", (t) => {
	t.beforeEach(ResetDBState);
	// eslint-disable-next-line no-return-await
	t.beforeEach(async () => await db["kai-auth-tokens"].remove({}));

	if (!ServerConfig.FLO_OAUTH2_INFO) {
		throw new Error(
			`Panic in test - No dummy FLO_OAUTH2_INFO configured, and the test depends on some dummy data here.`
		);
	}

	t.test("Should create a working reauthentication for the service.", async (t) => {
		const mockFetch = MockJSONFetch({
			[`${ServerConfig.FLO_API_URL}/oauth/token?refresh_token=${
				authDoc.refreshToken
			}&grant_type=refresh_token&client_secret=${
				ServerConfig.FLO_OAUTH2_INFO!.CLIENT_SECRET
			}&client_id=${ServerConfig.FLO_OAUTH2_INFO!.CLIENT_ID}`]: {
				refresh_token: "NEW_REFRESH_TOKEN",
				access_token: "NEW_ACCESS_TOKEN",
			},
		});

		await db["kai-auth-tokens"].insert(deepmerge(authDoc, {}));

		const reauthFn = CreateKaiReauthFunction("FLO", authDoc, logger, mockFetch);

		t.equal(reauthFn.length, 0, "Should return a function with arity 0.");

		const data = await reauthFn();

		t.equal(data, "NEW_ACCESS_TOKEN");

		const dbChange = await db["kai-auth-tokens"].findOne({
			userID: 1,
			service: "FLO",
		});

		// should also update the db
		t.equal(dbChange?.refreshToken, "NEW_REFRESH_TOKEN");
		t.equal(dbChange?.token, "NEW_ACCESS_TOKEN");

		t.end();
	});

	t.test("Should throw on fetch error.", async (t) => {
		// will fail
		const mockFetch = MockJSONFetch({});

		await db["kai-auth-tokens"].insert(deepmerge(authDoc, {}));

		const reauthFn = CreateKaiReauthFunction("FLO", authDoc, logger, mockFetch);

		t.rejects(() => reauthFn(), {
			message: "An error has occured while attempting reauthentication.",
		});

		const dbChange = await db["kai-auth-tokens"].findOne({
			userID: 1,
			service: "FLO",
		});

		t.equal(
			dbChange?.refreshToken,
			authDoc.refreshToken,
			"DB should not be changed for refreshToken."
		);
		t.equal(dbChange?.token, authDoc.token, "DB should not be changed for token.");

		t.end();
	});

	t.test("Should throw on invalid JSON response", async (t) => {
		const mockFetch = MockJSONFetch({
			[`${ServerConfig.FLO_API_URL}/oauth/token?refresh_token=${
				authDoc.refreshToken
			}&grant_type=refresh_token&client_secret=${
				ServerConfig.FLO_OAUTH2_INFO!.CLIENT_SECRET
			}&client_id=${ServerConfig.FLO_OAUTH2_INFO!.CLIENT_ID}`]: {
				// missing refresh_token
				access_token: "NEW_ACCESS_TOKEN",
			},
		});

		await db["kai-auth-tokens"].insert(deepmerge(authDoc, {}));

		const reauthFn = CreateKaiReauthFunction("FLO", authDoc, logger, mockFetch);

		t.rejects(() => reauthFn(), {
			message: "An error has occured while attempting reauthentication.",
		});

		const dbChange = await db["kai-auth-tokens"].findOne({
			userID: 1,
			service: "FLO",
		});

		t.equal(
			dbChange?.refreshToken,
			authDoc.refreshToken,
			"DB should not be changed for refreshToken."
		);
		t.equal(dbChange?.token, authDoc.token, "DB should not be changed for token.");

		t.end();
	});

	t.end();
});
