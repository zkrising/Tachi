import Pr from "prudence";
import t from "tap";
import { CloseMongoConnection } from "../../../../db/db";
import CreateLogCtx from "../../../../logger";
import prAssert from "../../../../test-utils/prassert";
import {
    Testing511SPA,
    TestingDoraChart,
    TestingGITADORADoraDryScore,
    TestingIIDXSPDryScore,
} from "../../../../test-utils/test-data";
import { CreateCalculatedData } from "./calculated-data";

const mockLogger = CreateLogCtx("calculated-data.test.ts");

t.test("#CreateCalculatedData", async (t) => {
    let res = await CreateCalculatedData(TestingIIDXSPDryScore, Testing511SPA, mockLogger);

    prAssert(
        res,
        // mock return, we're just checking it returns the right structure, really.
        {
            rating: Pr.equalTo(0),
            lampRating: Pr.equalTo(0),
            ranking: "null",
            outOf: "null",
            gameSpecific: {
                BPI: "?number",
                KESDC: "?number",
                "K%": "?number",
            },
        },
        "Should correctly produce calculatedData"
    );

    let gitadoraRes = await CreateCalculatedData(
        TestingGITADORADoraDryScore,
        TestingDoraChart,
        mockLogger
    );

    prAssert(
        gitadoraRes,
        {
            rating: Pr.isPositiveNonZero,
            lampRating: Pr.equalTo(0),
            ranking: "null",
            outOf: "null",
            gameSpecific: {},
        },
        "Should correctly call rating function overrides for different games"
    );

    t.end();
});

t.teardown(CloseMongoConnection);
