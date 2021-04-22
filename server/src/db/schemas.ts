import deepmerge from "deepmerge";
import { Game, Playtypes } from "kamaitachi-common";
import {
    grades,
    importTypes,
    lamps,
    validHitData,
    validHitMeta,
} from "kamaitachi-common/js/config";
import p, { PrudenceOptions, PrudenceSchema, ValidationFunction, ValidSchemaValue } from "prudence";
import { RevaluedObject } from "../types";
import db from "./db";

// eslint-disable-next-line no-useless-escape
const LAZY_EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const PRUDENCE_PUBLIC_USER: PrudenceSchema = {
    _id: p.any,
    username: p.regex(/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/),
    usernameLowercase: (self, parent) => self === (parent!.username as string).toLowerCase(),
    id: p.isPositiveInteger,
    settings: {
        nsfwSplashes: "boolean",
        invisible: "boolean",
    },
    friends: [p.isPositiveInteger],
    socialMedia: {
        discord: "*?string",
        twitter: "*?string",
        github: "*?string",
        steam: "*?string",
        youtube: "*?string",
        twitch: "*?string",
    },
    about: p.isBoundedString(0, 4000),
    customPfp: "boolean",
    customBanner: "boolean",
    permissions: {
        admin: "*boolean",
    },
    clan: p.nullable(p.isBoundedString(1, 4)),
    lastSeen: p.nullable(p.isPositiveInteger),
};

export const PRUDENCE_PRIVATE_USER = Object.assign(
    {
        password: "string", // could be a tighter fit related to bcrypt?
        email: p.regex(LAZY_EMAIL_REGEX),
    },
    PRUDENCE_PUBLIC_USER
);

export const PRUDENCE_IIDX_BPI_DATA = {
    coef: p.nullable(p.isPositiveNonZero),
    kavg: p.isPositiveNonZeroInteger,
    wr: p.isPositiveNonZeroInteger,
    chartID: "string",
    kesd: p.isPositiveNonZero,
};

export const PRUDENCE_COUNTER = {
    counterName: "string",
    value: p.isPositiveNonZeroInteger, // is nonzero?
};

export const PR_SCORE_GENERIC = {
    service: p.isBoundedString(3, 64),
    game: "string",
    playtype: "string",
    difficulty: "string",
    userID: p.isPositiveNonZeroInteger,
    scoreData: {
        score: p.isPositive,
        percent: p.isBetween(0, 100), // could be overrode!
        lamp: "string",
        grade: "string",
        lampIndex: p.isPositiveInteger,
        gradeIndex: p.isPositiveInteger,
        hitData: {},
        hitMeta: {},
    },
    scoreMeta: {},
    calculatedData: {
        rating: p.isPositive,
        lampRating: p.isPositive,
        gameSpecific: {},
        ranking: p.nullable(p.isPositiveNonZeroInteger),
        outOf: p.nullable(
            p.and(
                p.isPositiveNonZeroInteger,
                (self, parent: Record<string, unknown>) =>
                    (parent.ranking as number) <= (self as number)
            )
        ),
    },
    timeAchieved: p.nullable(p.isPositive),
    songID: p.isInteger,
    chartID: (self: unknown) => typeof self === "string" && self.length === 40,
    highlight: "boolean",
    comment: p.nullable(p.isBoundedString(1, 240)),
    timeAdded: p.isPositive,
    isScorePB: "boolean",
    isLampPB: "boolean",
    scoreID: "string", // temp
    importType: p.nullable(p.isIn(importTypes)),
};

type ScoreSchemas = {
    [G in Game]: {
        [P in Playtypes[G]]: PrudenceSchema;
    };
};

const optionalPositiveInt = p.optional(p.isPositiveInteger);

const nullableAndOptional = (fn: ValidSchemaValue) => p.optional(p.nullable(fn));

const nullableAndOptionalPosInt = nullableAndOptional(p.isPositiveInteger);

const CreateGameScoreData = (game: Game, hitMetaMerge: PrudenceSchema) => ({
    lamp: p.isIn(lamps[game]),
    lampIndex: p.and(
        p.isPositiveInteger,
        (self, parent) => lamps[game][self as number] === parent.lamp
    ),
    grade: p.isIn(grades[game]),
    gradeIndex: p.and(
        p.isPositiveInteger,
        (self, parent) => grades[game][self as number] === parent.grade
    ),
    hitData: Object.fromEntries(validHitData[game].map((e) => [e, optionalPositiveInt])),
    hitMeta: deepmerge(
        {
            fast: nullableAndOptionalPosInt,
            slow: nullableAndOptionalPosInt,
            maxCombo: nullableAndOptionalPosInt,
        },
        hitMetaMerge
    ),
    esd: p.nullable(p.isPositive),
});

const PR_SCORE_IIDX_SP: PrudenceSchema = CreatePRScore(
    "iidx",
    "SP",
    {
        bp: nullableAndOptional(p.isPositiveInteger),
        gauge: nullableAndOptional(p.isBetween(0, 100)),
        gaugeHistory: p.optional([nullableAndOptional(p.isBetween(0, 100))]),
        comboBreak: optionalPositiveInt,
        deadMeasure: nullableAndOptional(p.isPositiveInteger),
        deadNote: nullableAndOptional(p.isPositiveInteger),
    },
    {
        random: nullableAndOptional(p.isIn(["NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR"])),
        gauge: nullableAndOptional(p.isIn(["ASSISTED EASY", "EASY", "NORMAL", "HARD", "EX-HARD"])),
        assist: nullableAndOptional(
            p.isIn(["NO ASSIST", "AUTO SCRATCH", "LEGACY NOTE", "ASCR + LEGACY"])
        ),
        range: nullableAndOptional(
            p.isIn(["NONE", "SUDDEN+", "HIDDEN+", "SUD+ HID+", "LIFT", "LIFT SUD+"])
        ),
        pacemaker: "*?string", // lazy
        pacemakerName: "*?string",
        pacemakerTarget: nullableAndOptional(p.isPositiveInteger),
    },
    {
        BPI: "?number",
        "K%": p.nullable(p.isBetween(0, 100)),
    }
);

const PR_SCORE_BMS_7K: PrudenceSchema = CreatePRScore(
    "bms",
    "7K",
    {
        gauge: nullableAndOptional(p.isBetween(0, 100)),
        bp: nullableAndOptionalPosInt,
        diedAt: nullableAndOptionalPosInt,
        lpr: nullableAndOptionalPosInt,
        lbd: nullableAndOptionalPosInt,
        lgd: nullableAndOptionalPosInt,
        lgr: nullableAndOptionalPosInt,
        lpg: nullableAndOptionalPosInt,
        epr: nullableAndOptionalPosInt,
        ebd: nullableAndOptionalPosInt,
        egd: nullableAndOptionalPosInt,
        egr: nullableAndOptionalPosInt,
        epg: nullableAndOptionalPosInt,
    },
    {
        random: nullableAndOptional(p.isIn(["NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR"])),
        inputDevice: nullableAndOptional(p.isIn(["KEYBOARD", "BM_CONTROLLER", "MIDI"])),
    }
);

function CreatePRScore<G extends Game>(
    game: G,
    playtype: Playtypes[G],
    mergeHitMeta: PrudenceSchema = {},
    mergeScoreMeta: PrudenceSchema = {},
    mergeGameSpecific: PrudenceSchema = {}
) {
    return deepmerge(PR_SCORE_GENERIC, {
        game: p.equalTo(game),
        playtype: p.equalTo(playtype),
        scoreData: CreateGameScoreData(game, mergeHitMeta),
        scoreMeta: mergeScoreMeta,
        calculatedData: {
            gameSpecific: mergeGameSpecific,
        },
    });
}

function DoublePlayTwinRandomTuple(self: unknown) {
    if (!Array.isArray(self)) {
        return "Expected an array.";
    }

    if (self.length !== 2) {
        return "Expected exactly 2 elements.";
    }

    let ls = p.isIn(["NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR"])(self[0]);

    if (ls !== true) {
        return ls;
    }

    let rs = p.isIn(["NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR"])(self[1]);

    return rs;
}

export const PRUDENCE_SCORE_SCHEMAS: ScoreSchemas = {
    iidx: {
        SP: PR_SCORE_IIDX_SP,
        DP: deepmerge(PR_SCORE_IIDX_SP, {
            playtype: p.equalTo("DP"),
            scoreMeta: {
                random: nullableAndOptional(DoublePlayTwinRandomTuple),
            },
            calculatedData: {
                gameSpecific: {
                    "K%": "undefined", // remove with override
                },
            },
        }),
    },
    sdvx: {
        Single: CreatePRScore(
            "sdvx",
            "Single",
            {
                gauge: p.optional(p.isBetween(0, 100)),
                btnRate: p.optional(p.isBetween(0, 100)),
                holdRate: p.optional(p.isBetween(0, 100)),
                laserRate: p.optional(p.isBetween(0, 100)),
            },
            {},
            {
                VF4: p.nullable(p.isPositiveInteger),
                VF5: p.nullable(p.isBetween(0, 0.5)), // hack
            }
        ),
    },
    bms: {
        "7K": PR_SCORE_BMS_7K,
        "14K": deepmerge(PR_SCORE_BMS_7K, {
            playtype: p.equalTo("14K"),
            scoreMeta: {
                random: p.optional(DoublePlayTwinRandomTuple),
            },
        }),
        "5K": deepmerge(PR_SCORE_BMS_7K, {
            playtype: p.equalTo("5K"),
            scoreMeta: {},
        }),
    },
    chunithm: {
        Single: deepmerge(CreatePRScore("chunithm", "Single"), {
            scoreData: { percent: p.isBetween(0, 101) },
        }),
    },
    ddr: {
        SP: CreatePRScore(
            "ddr",
            "SP",
            {},
            {},
            {
                MFCP: p.nullable(p.isBoundedInteger(1, 25)),
            }
        ),
        DP: CreatePRScore(
            "ddr",
            "DP",
            {},
            {},
            {
                MFCP: p.nullable(p.isBoundedInteger(1, 25)),
            }
        ),
    },
    gitadora: {
        Gita: CreatePRScore("gitadora", "Gita"),
        Dora: CreatePRScore("gitadora", "Dora"),
    },
    jubeat: {
        Single: CreatePRScore("jubeat", "Single"),
    },
    maimai: {
        Single: deepmerge(CreatePRScore("maimai", "Single"), {
            scoreData: { percent: p.isBetween(0, 150) },
        }),
    },
    museca: {
        Single: CreatePRScore("museca", "Single"),
    },
    popn: {
        "9B": CreatePRScore("popn", "9B", { gauge: p.optional(p.isBetween(0, 100)) }),
    },
    usc: {
        Single: CreatePRScore("usc", "Single", { gauge: p.optional(p.isBetween(0, 100)) }),
    },
};

/**
 * Schemas that are "static", i.e. the content of the document
 * does not depend on fields in the document (such as score docs)
 * being different depending on the score.game field.
 */
export const STATIC_SCHEMAS: Partial<RevaluedObject<typeof db, PrudenceSchema>> = {
    users: PRUDENCE_PRIVATE_USER,
    "iidx-bpi-data": PRUDENCE_IIDX_BPI_DATA,
    counters: PRUDENCE_COUNTER,
};
