import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";
import ResetDBState from "test-utils/resets";
import mockApi from "test-utils/mock-api";
import db from "external/mongo/db";
import { ScoreDocument, PBScoreDocument } from "tachi-common";

t.test("GET /ir/beatoraja/charts/:chartSHA256/scores", (t) => {
	t.beforeEach(ResetDBState);

	const GAZER_SHA256 = "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d";
	const GAZER_CHARTID = "88eb6cc5683e2740cbd07f588a5f3db1db8d467b";

	t.test("Should return PB scores on a chart", async (t) => {
		await db["personal-bests"].insert({
			composedFrom: {
				lampPB: "mock_lampPB",
			},
			scoreData: {
				lampIndex: 4,
				score: 1234,
				hitMeta: {},
			},
			scoreMeta: {},
			chartID: GAZER_CHARTID,
			userID: 1,
		} as unknown as PBScoreDocument); // very lazy fake scores

		await db.scores.insert({
			scoreID: "mock_lampPB",
			scoreMeta: {
				inputDevice: "BM_CONTROLLER",
				random: "MIRROR",
			},
		} as ScoreDocument);

		const res = await mockApi
			.get(`/ir/beatoraja/charts/${GAZER_SHA256}/scores`)
			.set("X-BokutachiIR-Version", "2.0.0");

		t.equal(res.status, 200);

		t.end();
	});

	t.test("Should return 404 if chart doesnt exist", async (t) => {
		const res = await mockApi
			.get(`/ir/beatoraja/charts/INVALID/scores`)
			.set("X-BokutachiIR-Version", "2.0.0");

		t.equal(res.status, 404);

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
