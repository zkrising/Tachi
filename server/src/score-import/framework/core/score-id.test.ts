import { ScoreDocument } from "kamaitachi-common";
import t from "tap";
import db, { CloseConnection } from "../../../db/db";
import ResetDBState from "../../../test-utils/reset-db-state";
import { Testing511SPA, TestingIIDXSPDryScore } from "../../../test-utils/test-data";
import { CreateScoreID, GetWithScoreID } from "./score-id";

t.beforeEach(ResetDBState);
t.test("#GetWithScoreID", async (t) => {
    let sc = await GetWithScoreID("TESTING_SCORE_ID");

    t.not(sc, null, "Return a score for a valid score id");

    let nl = await GetWithScoreID("INVALID SCORE ID");

    t.equal(nl, null, "Should return null for score IDs it cannot resolve");

    t.end();
});

t.test("#CreateScoreID", (t) => {
    let scoreID = CreateScoreID(1, TestingIIDXSPDryScore, Testing511SPA.chartID);

    t.match(
        scoreID,
        /^R[0-9a-f]{40}/,
        "Should return an R followed by 40 characters of lowercase hex as scoreID."
    );

    t.not(
        scoreID,
        CreateScoreID(2, TestingIIDXSPDryScore, Testing511SPA.chartID),
        "Hash should be affected by userID."
    );

    t.equal(
        scoreID,
        CreateScoreID(1, TestingIIDXSPDryScore, Testing511SPA.chartID),
        "ScoreIDs should be consistently generatable"
    );

    // duplicate score
    let minimalScore = {
        scoreData: {
            score: TestingIIDXSPDryScore.scoreData.score,
            grade: TestingIIDXSPDryScore.scoreData.grade,
            lamp: TestingIIDXSPDryScore.scoreData.lamp,
        },
    };

    t.equal(
        scoreID,
        CreateScoreID(1, minimalScore as ScoreDocument, Testing511SPA.chartID),
        "ScoreIDs should only be affected by score, grade and lamp."
    );

    t.end();
});

t.teardown(CloseConnection);
