import deepmerge from "deepmerge";
import db from "external/mongo/db";
import { ONE_MINUTE } from "lib/constants/time";
import { ChangeRootLogLevel, GetLogLevel } from "lib/logger/logger";
import { Environment, ServerConfig } from "lib/setup/config";
import { UserAuthLevels } from "tachi-common";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { TestingIIDXSPScore } from "test-utils/test-data";
import { Sleep } from "utils/misc";
import type { ScoreDocument } from "tachi-common";

const LOG_LEVEL = Environment.logLevel;

t.test("POST /api/v1/admin/change-log-level", async (t) => {
	t.beforeEach(async () => {
		ChangeRootLogLevel(LOG_LEVEL);
		await db.users.update({ id: 1 }, { $set: { authLevel: UserAuthLevels.ADMIN } });
	});

	const auth = await CreateFakeAuthCookie(mockApi);

	t.test("Should require an admin authlevel", async (t) => {
		await db.users.update({ id: 1 }, { $set: { authLevel: UserAuthLevels.USER } });

		const res = await mockApi.post("/api/v1/admin/change-log-level").set("Cookie", auth).send({
			noReset: true,
			logLevel: "crit",
		});

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Should change the log level on the server.", async (t) => {
		const res = await mockApi.post("/api/v1/admin/change-log-level").set("Cookie", auth).send({
			noReset: true,
			logLevel: "crit",
		});

		t.equal(res.statusCode, 200);
		t.equal(GetLogLevel(), "crit");

		t.end();
	});

	t.test("Should reject invalid log levels", async (t) => {
		const res = await mockApi.post("/api/v1/admin/change-log-level").set("Cookie", auth).send({
			noReset: true,
			logLevel: "invalid",
		});

		t.equal(res.statusCode, 400);
		t.equal(GetLogLevel(), LOG_LEVEL);

		t.end();
	});

	t.test("Should set a timer that lasts duration minutes.", async (t) => {
		const res = await mockApi.post("/api/v1/admin/change-log-level").set("Cookie", auth).send({
			duration: 0.05,
			logLevel: "warn",
		});

		t.equal(res.statusCode, 200);
		t.equal(GetLogLevel(), "warn");

		// wait a bit
		await Sleep(ONE_MINUTE * 0.06);

		t.equal(GetLogLevel(), LOG_LEVEL);

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/admin/delete-score", async (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db.users.update({ id: 1 }, { $set: { authLevel: UserAuthLevels.ADMIN } });
	});

	const auth = await CreateFakeAuthCookie(mockApi);

	t.test("Should require an admin authlevel", async (t) => {
		await db.users.update({ id: 1 }, { $set: { authLevel: UserAuthLevels.USER } });

		const res = await mockApi
			.post("/api/v1/admin/delete-score")
			.set({
				Cookie: auth,
			})
			.send({
				scoreID: "deleteme",
			});

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Should delete another user's score.", async (t) => {
		await db.scores.insert(
			deepmerge<ScoreDocument>(TestingIIDXSPScore, {
				scoreID: "deleteme",
			})
		);

		const res = await mockApi
			.post("/api/v1/admin/delete-score")
			.set({
				Cookie: auth,
			})
			.send({
				scoreID: "deleteme",
			});

		t.equal(res.statusCode, 200);

		const dbScore = await db.scores.findOne({ scoreID: "deleteme" });

		t.equal(dbScore, null, "Should remove the score from the database.");

		t.end();
	});

	t.end();
});
