import { ConverterIRUSC, DeriveLamp, DeriveNoteMod } from "./converter";
import d from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { uscChart, uscScore } from "test-utils/test-data";
import type { USCClientScore } from "server/router/ir/usc/_playtype/types";

const logger = CreateLogCtx(__filename);

t.test("#DeriveLamp", (t) => {
	t.equal(DeriveLamp(uscScore), "EXCESSIVE CLEAR");

	t.equal(DeriveLamp(d(uscScore, { options: { gaugeType: 0 }, gauge: 0.5 })), "FAILED");

	t.equal(DeriveLamp(d(uscScore, { options: { gaugeType: 0 }, gauge: 0.7 })), "CLEAR");

	t.equal(DeriveLamp(d(uscScore, { options: { gaugeType: 2 }, gauge: 1 })), "FAILED");
	t.equal(DeriveLamp(d(uscScore, { options: { gaugeType: 2 }, gauge: 0 })), "FAILED");
	t.equal(
		DeriveLamp(d(uscScore, { options: { gaugeType: 2 }, gauge: 1, score: 10_000_000 })),
		"PERFECT ULTIMATE CHAIN"
	);
	t.equal(
		DeriveLamp(d(uscScore, { options: { gaugeType: 2 }, gauge: 1, error: 0 })),
		"ULTIMATE CHAIN"
	);

	t.equal(DeriveLamp(d(uscScore, { options: { gaugeType: 1 }, gauge: 0.1 })), "EXCESSIVE CLEAR");

	t.equal(DeriveLamp(d(uscScore, { options: { gaugeType: 1 }, gauge: 0 })), "FAILED");

	t.equal(
		DeriveLamp(d(uscScore, { score: 10_000_000, options: { gaugeType: 1 }, gauge: 0.1 })),
		"PERFECT ULTIMATE CHAIN"
	);

	// error: 0 => ultimate chain should not take priority over score 10million
	t.equal(
		DeriveLamp(
			d(uscScore, {
				score: 10_000_000,
				options: { gaugeType: 1 },
				gauge: 0.1,
				error: 0,
			})
		),
		"PERFECT ULTIMATE CHAIN"
	);

	t.equal(
		DeriveLamp(
			d(uscScore, {
				score: 9_000_000,
				options: { gaugeType: 0 },
				gauge: 0.15,
				error: 0,
			})
		),
		"ULTIMATE CHAIN"
	);

	t.throws(() => DeriveLamp(d(uscScore, { options: { gaugeType: 3 } })));

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
	ConverterIRUSC(
		d(uscScore, p),
		{ chartHash: uscChart.data.hashSHA1 as string, playtype: "Controller", timeReceived: 10 },
		"ir/usc",
		logger
	);

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
