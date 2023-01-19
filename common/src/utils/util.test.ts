import { GetGradeDeltas } from "./util";
import { WACCA_GBOUNDARIES } from "../constants/grade-boundaries";
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

	t.end();
});
