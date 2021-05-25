import t from "tap";
import { CloseMongoConnection } from "../../../db/db";
import { AnyChartDocument, Difficulties, Lamps, ScoreDocument } from "kamaitachi-common";
import {
    CalculateBPI,
    CalculateCHUNITHMRating,
    CalculateGITADORARating,
    CalculateKESDC,
    CalculateMFCP,
    CalculateVF4,
    CalculateVF5,
    KaidenPercentile,
} from "./game-specific-stats";
import CreateLogCtx from "../../../common/logger";
import { isApproximately } from "../../../test-utils/asserts";
import { DryScore } from "../common/types";

t.test("#CalculateBPI", (t) => {
    t.test("AA BPI tests", (t) => {
        // data accurate as of 14/04/2021
        const WR_AA = 3650;
        const KAVG_AA = 3204;
        const MAX_AA = 1834 * 2;
        const COEF_AA = 1.25945;

        // AA, the song.
        function AA_BPI(yourEx: number) {
            return CalculateBPI(KAVG_AA, WR_AA, yourEx, MAX_AA, COEF_AA);
        }

        t.equal(AA_BPI(KAVG_AA), 0, "A score of KAVG should be exactly 0BPI");
        isApproximately(AA_BPI(3393), 10.02, "A score with 3393 should be approximately 10.02BPI");
        isApproximately(AA_BPI(3481), 20.09, "A score with 3481 should be approximately 20.09BPI");
        isApproximately(AA_BPI(3535), 30.01, "A score with 3535 should be approximately 30.01BPI");
        isApproximately(AA_BPI(3572), 40.18, "A score with 3572 should be approximately 40.18BPI");
        isApproximately(AA_BPI(3597), 50.1, "A score with 3597 should be approximately 50.1BPI");
        isApproximately(AA_BPI(3615), 60.12, "A score with 3615 should be approximately 60.12BPI");
        isApproximately(AA_BPI(3628), 70.11, "A score with 3628 should be approximately 70.11BPI");
        isApproximately(AA_BPI(3638), 80.62, "A score with 3638 should be approximately 80.62BPI");
        isApproximately(AA_BPI(3645), 90.59, "A score with 3645 should be approximately 90.59BPI");
        t.equal(AA_BPI(WR_AA), 100, "A score of WR should be exactly 100BPI");

        isApproximately(AA_BPI(3041), -5, "A score with 3628 should be approximately -5BPI");
        isApproximately(AA_BPI(2886), -9.99, "A score with 3638 should be approximately -9.99BPI");

        t.equal(AA_BPI(0), -15, "Excessively bad (vs kavg) scores should cap at -15BPI");

        isApproximately(AA_BPI(MAX_AA), 244.56, "A score of MAX should be approximately 244.56BPI");

        t.end();
    });

    // This song has both no co-efficient and is an sp11, so it serves
    // as another interesting test.
    t.test("Afterimage d'automne BPI tests", (t) => {
        // data accurate as of 14/04/2021
        const WR_AFT = 2891;
        const KAVG_AFT = 2497;
        const MAX_AFT = 1480 * 2;
        const COEF_AFT = null;

        function AFT_BPI(yourEx: number) {
            return CalculateBPI(KAVG_AFT, WR_AFT, yourEx, MAX_AFT, COEF_AFT);
        }

        t.equal(AFT_BPI(KAVG_AFT), 0, "A score of KAVG should be exactly 0BPI");
        isApproximately(AFT_BPI(2606), 10, "A score with 2606 should be approximately 10BPI");
        isApproximately(AFT_BPI(2675), 20.07, "A score with 2675 should be approximately 20.07BPI");
        isApproximately(AFT_BPI(2727), 30.18, "A score with 2727 should be approximately 30.18BPI");
        isApproximately(AFT_BPI(2767), 40.12, "A score with 2767 should be approximately 40.12BPI");
        isApproximately(AFT_BPI(2799), 50.06, "A score with 2799 should be approximately 50.06BPI");
        isApproximately(AFT_BPI(2826), 60.43, "A score with 2826 should be approximately 60.43BPI");
        isApproximately(AFT_BPI(2847), 70.3, "A score with 2847 should be approximately 70.3BPI");
        isApproximately(AFT_BPI(2865), 80.57, "A score with 2865 should be approximately 80.57BPI");
        isApproximately(AFT_BPI(2879), 90.18, "A score with 2879 should be approximately 90.18BPI");
        t.equal(AFT_BPI(WR_AFT), 100, "A score of WR should be exactly 100BPI");

        isApproximately(AFT_BPI(2423), -4.99, "A score with 2423 should be approximately -4.99BPI");
        isApproximately(
            AFT_BPI(2354),
            -10.04,
            "A score with 2354 should be approximately -10.04BPI"
        );

        t.equal(AFT_BPI(0), -15, "Excessively bad (vs kavg) scores should cap at -15BPI");

        isApproximately(
            AFT_BPI(MAX_AFT),
            431.57,
            "A score of MAX should be approximately 431.57BPI"
        );

        t.end();
    });

    t.end();
});

t.test("#CalculateGITADORARating", (t) => {
    function TestGitadoraRating(percent: number, levelNum: number) {
        return CalculateGITADORARating(
            { scoreData: { percent } } as DryScore,
            { levelNum } as AnyChartDocument
        );
    }

    t.equal(
        TestGitadoraRating(89.48, 3.4),
        60.84,
        "Test GITADORA Rating function aligns with game (1)"
    );

    t.equal(
        TestGitadoraRating(70.76, 5.8),
        82.08,
        "Test GITADORA Rating function aligns with game (2)"
    );

    t.end();
});

// this metric is ground to be removed, possibly.
t.test("#CalculateKESDC", (t) => {
    t.equal(CalculateKESDC(10, 4), 37.18460876390943, "Should perform ESDC on two numbers.");
    t.equal(CalculateKESDC(null, 4), null, "Should return null if kaidenESD is null.");

    t.end();
});

const mockLogger = CreateLogCtx(__filename);

t.test("#CalculateMFCP", (t) => {
    function TestMFCP(
        lamp: Lamps["ddr:SP" | "ddr:DP"],
        levelNum: number,
        difficulty: Difficulties["ddr:DP" | "ddr:SP"]
    ) {
        return CalculateMFCP(
            {
                scoreData: {
                    lamp,
                },
            } as ScoreDocument,
            {
                difficulty,
                levelNum,
            } as AnyChartDocument,
            mockLogger
        );
    }

    t.equal(TestMFCP("FAILED", 10, "EXPERT"), null, "Should return null for non-mfcs");

    t.equal(
        TestMFCP("MARVELOUS FULL COMBO", 10, "BASIC"),
        null,
        "Should reject charts on BASIC difficulty."
    );

    t.equal(
        TestMFCP("MARVELOUS FULL COMBO", 10, "BEGINNER"),
        null,
        "Should reject charts on BEGINNER difficulty."
    );

    t.test("Should return null for charts with level less than 8", (t) => {
        for (let i = 1; i <= 7; i++) {
            t.equal(
                TestMFCP("MARVELOUS FULL COMBO", i, "EXPERT"),
                null,
                `Should return null for charts with level ${i}`
            );
        }

        t.end();
    });

    t.equal(
        TestMFCP("MARVELOUS FULL COMBO", 8, "EXPERT"),
        1,
        "Should return 1 for charts with level 8"
    );
    t.equal(
        TestMFCP("MARVELOUS FULL COMBO", 9, "EXPERT"),
        1,
        "Should return 1 for charts with level 9"
    );
    t.equal(
        TestMFCP("MARVELOUS FULL COMBO", 10, "EXPERT"),
        1,
        "Should return 1 for charts with level 10"
    );

    t.equal(
        TestMFCP("MARVELOUS FULL COMBO", 11, "EXPERT"),
        2,
        "Should return 2 for charts with level 11"
    );
    t.equal(
        TestMFCP("MARVELOUS FULL COMBO", 12, "EXPERT"),
        2,
        "Should return 2 for charts with level 12"
    );

    t.equal(
        TestMFCP("MARVELOUS FULL COMBO", 13, "EXPERT"),
        4,
        "Should return 4 for charts with level 13"
    );

    t.equal(
        TestMFCP("MARVELOUS FULL COMBO", 14, "EXPERT"),
        8,
        "Should return 8 for charts with level 14"
    );

    t.equal(
        TestMFCP("MARVELOUS FULL COMBO", 15, "EXPERT"),
        15,
        "Should return 15 for charts with level 15"
    );

    t.test("Should return 25 for charts with level 16-20", (t) => {
        for (let i = 16; i <= 20; i++) {
            t.equal(
                TestMFCP("MARVELOUS FULL COMBO", i, "EXPERT"),
                25,
                `Should return 25 for charts with level ${i}`
            );
        }
        t.end();
    });

    t.equal(
        TestMFCP("MARVELOUS FULL COMBO", NaN, "EXPERT"),
        null,
        "Invalid level triggers failsafe."
    );

    t.end();
});

t.todo("#CalculateCHUNITHMRating");
t.todo("#CalculateVF5");
t.todo("#CalculateVF4");
t.todo("#KaidenPercentile");

t.teardown(CloseMongoConnection);
