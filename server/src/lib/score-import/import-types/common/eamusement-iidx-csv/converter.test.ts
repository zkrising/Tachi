import t from "tap";
import db from "../../../../../external/mongo/db";
import CreateLogCtx from "../../../../logger/logger";
import ResetDBState from "../../../../../test-utils/reset-db-state";
import ConvertEamIIDXCSV from "./converter";
import p from "prudence";
import { prAssert } from "../../../../../test-utils/asserts";
import deepmerge from "deepmerge";
import { EamusementScoreData } from "./types";
import {
    ConverterFailure,
    InvalidScoreFailure,
    KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";

const logger = CreateLogCtx(__filename);

const chartID511 = "c2311194e3897ddb5745b1760d2c0141f933e683";

const DryScorePrudence = {
    service: p.equalTo("e-amusement"),
    game: p.equalTo("iidx"),
    comment: "null",
    importType: p.equalTo("file/eamusement-iidx-csv"),
    timeAchieved: p.equalTo(Date.parse("Tue, 27 Apr 2021 21:35:35 GMT")),
    scoreMeta: {},
    scoreData: {
        grade: p.equalTo("F"),
        lamp: p.equalTo("HARD CLEAR"),
        score: p.equalTo(192),
        percent: p.aprx(12.21),
        hitData: {
            pgreat: p.equalTo(75),
            great: p.equalTo(42),
        },
        hitMeta: {
            bp: p.equalTo(12),
        },
    },
};

const valid511Score = {
    bp: "12",
    difficulty: "ANOTHER" as const, // lol
    exscore: "192",
    great: "42",
    pgreat: "75",
    lamp: "HARD CLEAR",
    level: "10",
};

const converterContext = {
    playtype: "SP" as const,
    hasBeginnerAndLegg: false,
    importVersion: "27",
    service: "e-amusement",
};

const data = {
    scores: [valid511Score],
    timestamp: "Tue, 27 Apr 2021 21:35:35 GMT",
    title: "5.1.1",
};

t.todo("#ConverterFn", async (t) => {
    t.beforeEach(ResetDBState);

    t.end();
});

t.teardown(CloseAllConnections);
