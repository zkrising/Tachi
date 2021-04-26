import { ScoreDocument, SessionDocument } from "kamaitachi-common";

type ScoreCalculatedDataOnly = Pick<ScoreDocument, "calculatedData">;

const RELEVANT_SCORES = 10;

function AverageBest10(numbers: number[]) {
    return (
        numbers
            .sort((a, b) => b - a)
            .slice(0, RELEVANT_SCORES)
            .reduce((a, r) => a + r, 0) / RELEVANT_SCORES
    );
}

export function CreateSessionCalcData(
    scoreCalcData: ScoreCalculatedDataOnly[]
): SessionDocument["calculatedData"] {
    if (scoreCalcData.length < RELEVANT_SCORES) {
        return {
            scorePerf: null,
            lampPerf: null,
            perf: null,
        };
    }

    // @optimisable -- could be done in one loop.
    let scorePerf = AverageBest10(scoreCalcData.map((e) => e.calculatedData.rating));

    let lampPerf = AverageBest10(scoreCalcData.map((e) => e.calculatedData.lampRating));

    let perf =
        scoreCalcData
            .map((e) => Math.max(e.calculatedData.rating, e.calculatedData.lampRating))
            .sort((a, b) => b - a)
            .slice(0, RELEVANT_SCORES)
            .reduce((a, r) => a + r, 0) / RELEVANT_SCORES;

    return {
        scorePerf,
        lampPerf,
        perf,
    };
}
