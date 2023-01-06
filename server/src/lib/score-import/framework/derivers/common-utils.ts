import { InternalFailure } from "../common/converter-failures";
import type { GradeBoundary } from "tachi-common";

/**
 * Util for getting a games' grade for a given score.
 */
export function GetGrade<G extends string>(grades: Array<GradeBoundary<G>>, score: number): G {
	// sort grades going downwards in their boundaries.
	const descendingGrades = grades.slice(0).sort((a, b) => b.lowerBound - a.lowerBound);

	for (const { name, lowerBound } of descendingGrades) {
		if (score >= lowerBound) {
			return name;
		}
	}

	throw new InternalFailure(`Could not resolve grade for score ${score}.`);
}
