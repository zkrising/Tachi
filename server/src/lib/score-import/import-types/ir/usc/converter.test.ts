import t from "tap";
import db from "../../../../../external/mongo/db";
import { ConverterIRUSC, DeriveLamp, DeriveNoteMod } from "./converter";
import d from "deepmerge";
import { uscChart, uscScore } from "../../../../../test-utils/test-data";
import CreateLogCtx from "../../../../logger/logger";
import ResetDBState from "../../../../../test-utils/resets";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";
import { USCClientScore } from "../../../../../server/router/ir/usc/types";

const logger = CreateLogCtx(__filename);

t.test("#DeriveLamp", (t) => {
	t.equal(DeriveLamp(uscScore, logger), "EXCESSIVE CLEAR");

	t.equal(DeriveLamp(d(uscScore, { options: { gaugeType: 0 }, gauge: 50 }), logger), "FAILED");

	t.equal(DeriveLamp(d(uscScore, { options: { gaugeType: 0 }, gauge: 70 }), logger), "CLEAR");

	t.equal(
		DeriveLamp(d(uscScore, { options: { gaugeType: 1 }, gauge: 0.1 }), logger),
		"EXCESSIVE CLEAR"
	);

	t.equal(DeriveLamp(d(uscScore, { options: { gaugeType: 1 }, gauge: 0 }), logger), "FAILED");

	t.equal(
		DeriveLamp(
			d(uscScore, { score: 10_000_000, options: { gaugeType: 1 }, gauge: 0.1 }),
			logger
		),
		"PERFECT ULTIMATE CHAIN"
	);

	// error: 0 should not take priority over score 10million
	t.equal(
		DeriveLamp(
			d(uscScore, {
				score: 10_000_000,
				options: { gaugeType: 1 },
				gauge: 0.1,
				error: 0,
			}),
			logger
		),
		"PERFECT ULTIMATE CHAIN"
	);

	t.equal(
		DeriveLamp(
			d(uscScore, {
				score: 9_000_000,
				options: { gaugeType: 0 },
				gauge: 15,
				error: 0,
			}),
			logger
		),
		"ULTIMATE CHAIN"
	);

	t.throws(() => DeriveLamp(d(uscScore, { options: { gaugeType: 2 } }), logger));

	t.end();
});

t.test("#DeriveNoteMod", (t) => {
	t.equal(DeriveNoteMod(uscScore), "MIRROR");

	t.equal(DeriveNoteMod(d(uscScore, { options: { random: true } })), "MIR-RAN");

	t.equal(DeriveNoteMod(d(uscScore, { options: { random: false, mirror: false } })), "NORMAL");
	t.equal(DeriveNoteMod(d(uscScore, { options: { random: true, mirror: false } })), "RANDOM");

	t.end();
});

const dm = (p: Partial<USCClientScore>) =>
	ConverterIRUSC(d(uscScore, p), { chart: uscChart }, "ir/usc", logger);

t.test("#ConverterIRUSC", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should convert a score", async (t) => {
		const res = await dm({});

		t.hasStrict(res, {
			song: {
				id: 1,
			},
			chart: {
				chartID: uscChart.chartID,
			},
			dryScore: {},
		});

		t.end();
	});

	t.test("Should reject scores with invalid hit windows", (t) => {
		t.rejects(dm({ windows: { perfect: 0 } } as USCClientScore));
		t.rejects(dm({ windows: { good: 0 } } as USCClientScore));
		t.rejects(dm({ windows: { hold: 0 } } as USCClientScore));
		t.rejects(dm({ windows: { miss: 0 } } as USCClientScore));
		t.rejects(dm({ windows: { slam: 0 } } as USCClientScore));

		t.end();
	});

	t.test("Should reject scores with invalid autoflags", (t) => {
		t.rejects(dm({ options: { autoFlags: 1 } } as USCClientScore));

		t.end();
	});

	t.test("Should throw an InternalFailure on song-chart desync", async (t) => {
		await db.songs.usc.remove({});
		t.rejects(dm({}));

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
