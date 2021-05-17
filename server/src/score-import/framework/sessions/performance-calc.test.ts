import t from "tap";
import { CreateSessionCalcData } from "./performance-calc";

function ratingwrap(ratings: [number, number][]) {
    return ratings.map((e) => ({
        calculatedData: {
            rating: e[0],
            lampRating: e[1],
            gameSpecific: {},
        },
    }));
}

function avgbest10(arr: number[]) {
    return (
        arr
            .sort((a, b) => b - a)
            .slice(0, 10)
            .reduce((a, r) => a + r, 0) / 10
    );
}

t.test("#CreateSessionCalcData", (t) => {
    t.test("Should return null if less than 10 scores", (t) => {
        let res = CreateSessionCalcData(ratingwrap([[1, 2]]));

        t.strictSame(res, { scorePerf: null, lampPerf: null, perf: null });

        t.end();
    });

    t.test("Should calculate session performance", (t) => {
        let { lampPerf, perf, scorePerf } = CreateSessionCalcData(
            ratingwrap([
                [1, 1],
                [2, 2],
                [3, 4],
                [4, 4],
                [6, 1],
                [1, 6],
                [1, 1],
                [2, 2],
                [3, 4],
                [4, 4],
                [6, 1],
                [1, 6],
            ])
        );

        t.equal(
            lampPerf,
            avgbest10([1, 2, 4, 4, 1, 6, 1, 2, 4, 4, 1, 6]),
            "Should correctly calculate lamp performance"
        );

        t.equal(
            scorePerf,
            avgbest10([1, 2, 3, 4, 6, 1, 1, 2, 3, 4, 6, 1]),
            "Should correctly calculate score performance"
        );

        t.equal(
            perf,
            // its the larger of either
            avgbest10([1, 2, 4, 4, 6, 6, 1, 2, 4, 4, 6, 6]),
            "Should correctly calculate performance"
        );

        t.end();
    });

    t.end();
});
