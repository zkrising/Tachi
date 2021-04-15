import Pr, { PrudenceOptions, PrudenceSchema } from "prudence";
import { RevaluedObject } from "../types";
import db from "./db";

// eslint-disable-next-line no-useless-escape
const LAZY_EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const PRUDENCE_PUBLIC_USER: PrudenceSchema = {
    _id: Pr.any,
    username: Pr.regex(/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/),
    usernameLowercase: (self, parent) => self === (parent!.username as string).toLowerCase(),
    id: Pr.isPositiveInteger,
    settings: {
        nsfwSplashes: "boolean",
        invisible: "boolean",
    },
    friends: [Pr.isPositiveInteger],
    socialMedia: {
        discord: "*string",
        twitter: "*string",
        github: "*string",
        steam: "*string",
        youtube: "*string",
        twitch: "*string",
    },
    about: Pr.isBoundedString(0, 4000),
    customPfp: "boolean",
    customBanner: "boolean",
    permissions: {
        admin: "*boolean",
    },
    clan: Pr.nullable(Pr.isBoundedString(1, 4)),
    lastSeen: Pr.nullable(Pr.isPositiveInteger),
};

export const PRUDENCE_PRIVATE_USER = Object.assign(
    {
        password: "string", // could be a tighter fit related to bcrypt?
        email: Pr.regex(LAZY_EMAIL_REGEX),
    },
    PRUDENCE_PUBLIC_USER
);

export const PRUDENCE_IIDX_BPI_DATA = {
    coef: Pr.nullable(Pr.isPositiveNonZero),
    kavg: Pr.isPositiveNonZeroInteger,
    wr: Pr.isPositiveNonZeroInteger,
    chartID: "string",
    kesd: Pr.isPositiveNonZero,
};

export const PRUDENCE_COUNTER = {
    counterName: "string",
    value: Pr.isPositiveNonZeroInteger, // is nonzero?
};

export const PRUDENCE_GENERIC_SCORE = {
    service: Pr.isBoundedString(3, 64),
    game: "string",
    playtype: "string",
    difficulty: "string",
    userID: Pr.isPositiveNonZeroInteger,
    scoreData: {
        score: Pr.isPositive,
        percent: Pr.isBetween(0, 100), // should be overrode!
        lamp: "string",
        grade: "string",
        lampIndex: Pr.isPositiveInteger,
        gradeIndex: Pr.isPositiveInteger,
        hitData: {},
        hitMeta: {},
    },
    scoreMeta: {},
    calculatedData: {
        rating: Pr.isPositive,
        lampRating: Pr.isPositive,
        gameSpecific: {},
        ranking: Pr.nullable(Pr.isPositiveNonZeroInteger),
        outOf: Pr.and(
            Pr.isPositiveNonZeroInteger,
            (self, parent: Record<string, unknown>) =>
                (parent.ranking as number) <= (self as number)
        ),
    },
    timeAchieved: Pr.nullable(Pr.isPositive),
    songID: Pr.isInteger,
    chartID: (self: unknown) => typeof self === "string" && self.length === 40,
    highlight: "boolean",
    comment: Pr.nullable(Pr.isBoundedString(1, 240)),
    timeAdded: Pr.isPositive,
    isScorePB: "boolean",
    isLampPB: "boolean",
    scoreID: "string" // temp
    importType: Pr.isIn()
};

export const SCHEMAS: RevaluedObject<typeof db, PrudenceSchema> = {
    users: PRUDENCE_PRIVATE_USER,
    "iidx-bpi-data": PRUDENCE_IIDX_BPI_DATA,
    counters: PRUDENCE_COUNTER,
    scores: {},
};
