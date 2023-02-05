import { GetGradeDeltas } from "./util";
import { IIDXLIKE_GBOUNDARIES, WACCA_GBOUNDARIES } from "../constants/grade-boundaries";
import t from "tap";

t.test("#GetGradeDeltas", (t) => {
	t.strictSame(
		GetGradeDeltas(WACCA_GBOUNDARIES, "S", 921_013),
		{
			lower: "S+21K",
			upper: "(S+)-9K",
			closer: "upper",
		},
		"Should correctly calculate grade boundaries."
	);

	t.strictSame(
		GetGradeDeltas(WACCA_GBOUNDARIES, "S", 901_013),
		{
			lower: "S+1K",
			upper: "(S+)-29K",
			closer: "lower",
		},
		"Should correctly calculate grade boundaries."
	);

	t.strictSame(
		GetGradeDeltas(WACCA_GBOUNDARIES, "S", 901_013, (n) => n.toString()),
		{
			lower: "S+1013",
			upper: "(S+)-28987",
			closer: "lower",
		},
		"Should apply the num format function."
	);

	t.strictSame(
		GetGradeDeltas(IIDXLIKE_GBOUNDARIES, "MAX-", 99.47, (deltaPercent) => {
			const max = 2090;

			const v = (deltaPercent / 100) * max;

			return Math.round(v).toFixed(0);
		}),
		{
			lower: "(MAX-)+105",
			upper: "MAX-11",
			closer: "upper",
		},
		"i hate iidx"
	);

	t.end();
});
