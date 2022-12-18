import { GenericCalculatePercent, GetGradeFromPercent, ValidatePercent } from "./score-utils";
import t from "tap";
import { isApproximately } from "test-utils/asserts";
import { Testing511SPA } from "test-utils/test-data";
import type { ChartDocument, Game } from "tachi-common";

t.test("#GetGradeForPercent", (t) => {
	t.equal(
		GetGradeFromPercent("chunithm", "Single", 101),
		"SSS",
		"Should return SSS for the edge case of chunithms 101%."
	);
	t.equal(
		GetGradeFromPercent("iidx", "SP", 100),
		"MAX",
		"Should return SSS for the edge case of 100% == MAX (iidx SP)."
	);
	t.equal(
		GetGradeFromPercent("iidx", "DP", 100),
		"MAX",
		"Should return SSS for the edge case of 100% == MAX (iidx DP)."
	);
	t.equal(
		GetGradeFromPercent("iidx", "SP", 100 * (1932 / 2484)),
		"AA",
		"Should return AA for the edge case of 77.77...% (iidx SP)."
	);
	t.equal(
		GetGradeFromPercent("iidx", "SP", 100 * (7 / 9)),
		"AA",
		"Should return AA for the edge case of 77.77...% (iidx SP)."
	);
	t.equal(
		GetGradeFromPercent("iidx", "SP", 77.77777777777777),
		"AA",
		"Should return AA for the edge case of 77.77...% (iidx SP)."
	);

	t.equal(
		GetGradeFromPercent("iidx", "SP", 0),
		"F",
		"Should return SSS for the edge case of 0% == F (iidx SP)."
	);
	t.equal(
		GetGradeFromPercent("iidx", "DP", 0),
		"F",
		"Should return SSS for the edge case of 0% == F (iidx DP)."
	);

	t.throws(
		() => GetGradeFromPercent("iidx", "DP", -1),
		"Should throw if percent is unresolvable."
	);

	t.end();
});

t.test("#GenericCalculatePercent", (t) => {
	const f = (game: Game, score: number, equal: number) =>
		isApproximately(t, GenericCalculatePercent(game, score), equal);

	for (const game of ["iidx", "bms", "pms"] as const) {
		isApproximately(t, GenericCalculatePercent(game, 1240, Testing511SPA), 78.88);
		isApproximately(t, GenericCalculatePercent(game, 0, Testing511SPA), 0);
	}

	f("popn", 100_000, 100);
	f("popn", 50_000, 50);
	f("popn", 0, 0);

	f("maimai", 10, 10);
	f("maimai", 101.12, 101.12);

	for (const game of ["usc", "sdvx"] as const) {
		f(game, 10_000_000, 100);
		f(game, 5_000_000, 50);
		f(game, 9_950_000, 99.5);
		f(game, 1_370_000, 13.7);
		f(game, 0, 0);
	}

	for (const game of ["ddr", "museca", "chunithm", "wacca"] as const) {
		f(game, 1_000_000, 100);
		f(game, 500_000, 50);
		f(game, 993_121, 99.3121);
		f(game, 1_000, 0.1);
	}

	t.throws(() => GenericCalculatePercent("unknown_game" as Game, 100), {
		message: /Invalid game/u,
	});
	t.throws(() => GenericCalculatePercent("iidx", 100), {
		message: /No Chart passed/u,
	});

	t.end();
});

t.test("#ValidatePercent", (t) => {
	for (const playtype of ["SP", "DP"] as const) {
		t.doesNotThrow(() => {
			ValidatePercent("iidx", playtype, 90, Testing511SPA);
		});
		t.doesNotThrow(() => {
			ValidatePercent("iidx", playtype, 0, Testing511SPA);
		});
		t.doesNotThrow(() => {
			ValidatePercent("iidx", playtype, 100, Testing511SPA);
		});

		t.throws(() => {
			ValidatePercent("iidx", playtype, -50, Testing511SPA);
		});
		t.throws(() => {
			ValidatePercent("iidx", playtype, 101, Testing511SPA);
		});
	}

	const m = (maxPercent: number) => ({ data: { maxPercent } } as ChartDocument);

	t.doesNotThrow(() => {
		ValidatePercent("maimai", "Single", 90, m(100));
	});
	t.doesNotThrow(() => {
		ValidatePercent("maimai", "Single", 100, m(100));
	});
	t.doesNotThrow(() => {
		ValidatePercent("maimai", "Single", 0, m(100));
	});
	t.doesNotThrow(() => {
		ValidatePercent("maimai", "Single", 110, m(120));
	});
	t.doesNotThrow(() => {
		ValidatePercent("maimai", "Single", 120, m(120));
	});
	t.throws(
		() => {
			ValidatePercent("maimai", "Single", 130, m(120));
		},
		{
			message: /expected a number less than 120/u,
		}
	);

	t.end();
});
