/* eslint-disable @typescript-eslint/no-explicit-any */
import t from "tap";
import { GetMilisecondsSince } from "../../../../common/hrtime";
import { CloseMongoConnection } from "../../../../db/db";
import CreateLogCtx from "../../../../logger";
import { MockMulterFile } from "../../../../test-utils/mock-multer";
import ResetDBState from "../../../../test-utils/reset-db-state";
import { GetKTDataBuffer } from "../../../../test-utils/test-data";
import { ParseSolidStateXML } from "./parser";

const logger = CreateLogCtx("parser.test.ts");

t.test("#ParseSolidStateXML", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should parse simple, valid S3 XML", (t) => {
        const res = ParseSolidStateXML(
            MockMulterFile(GetKTDataBuffer("./s3/valid.xml"), "valid.xml"),
            {},
            logger
        );

        t.hasStrict(
            res.iterable,
            [
                {
                    id: 187,
                    diff: 7,
                    songname: "GAMBOL",
                    styles: "3rd",
                    exscore: 100,
                    scorebreakdown: {
                        justgreats: 25,
                        greats: 50,
                        good: 0,
                        bad: 0,
                        poor: 4,
                    },
                    mods: {
                        hardeasy: "H",
                    },
                    cleartype: "cleared",
                    date: "2010-10-19 04:54:22",
                },
                {
                    id: 187,
                    diff: "L7",
                    songname: "GAMBOL",
                    styles: "3rd",
                    exscore: 100,
                    scorebreakdown: {
                        justgreats: 25,
                        greats: 50,
                        good: 0,
                        bad: 0,
                        poor: 4,
                    },
                    mods: {},
                    cleartype: "perfect",
                    date: "2010-10-19 04:54:22",
                },
            ] as any,
            "Should return the right scores in the iterable."
        );
        t.equal(res.game, "iidx", "Should return IIDX as the game.");
        t.equal(res.classHandler, null, "Should return no class handler.");
        t.strictSame(res.context, {}, "Should return no context.");

        t.end();
    });

    t.test("Should parse S3 XML with a single score", (t) => {
        const res = ParseSolidStateXML(
            MockMulterFile(GetKTDataBuffer("./s3/one-score.xml"), "one-score.xml"),
            {},
            logger
        );

        t.hasStrict(
            res.iterable,
            [
                {
                    id: 187,
                    diff: 7,
                    songname: "GAMBOL",
                    styles: "3rd",
                    exscore: 100,
                    scorebreakdown: {
                        justgreats: 50,
                        greats: 50,
                        good: 0,
                        bad: 0,
                        poor: 4,
                    },
                    mods: {},
                    cleartype: "perfect",
                    date: "2010-10-19 04:54:22",
                },
            ] as any,
            "Should return the right score in the iterable."
        );
        t.equal(res.game, "iidx", "Should return IIDX as the game.");
        t.equal(res.classHandler, null, "Should return no class handler.");
        t.strictSame(res.context, {}, "Should return no context.");

        t.end();
    });

    t.test("Should reject S3 XML with no scores", (t) => {
        t.throws(
            () =>
                ParseSolidStateXML(
                    MockMulterFile(GetKTDataBuffer("./s3/no-score-data.xml"), "no-score-data.xml"),

                    {},
                    logger
                ),
            { message: /Invalid S3 XML/u } as any
        );

        t.end();
    });

    t.test("Should reject invalid lamps", (t) => {
        t.throws(
            () =>
                ParseSolidStateXML(
                    MockMulterFile(GetKTDataBuffer("./s3/invalid-lamp.xml"), "invalid-lamp.xml"),
                    {},
                    logger
                ),
            { message: /Invalid S3 XML.*cleartype.*BAD LAMP/u } as any
        );

        t.end();
    });

    t.test("Should reject malicious mods", (t) => {
        t.throws(
            () =>
                ParseSolidStateXML(
                    MockMulterFile(
                        GetKTDataBuffer("./s3/malicious-mods.xml"),
                        "malicious-mods.xml"
                    ),
                    {},
                    logger
                ),
            { message: /Invalid S3 XML.*object.*1/u } as any
        );

        t.end();
    });

    t.test("Should reject malicious scorebreakdown", (t) => {
        t.throws(
            () =>
                ParseSolidStateXML(
                    MockMulterFile(
                        GetKTDataBuffer("./s3/malicious-scorebreakdown.xml"),
                        "malicious-scorebreakdown.xml"
                    ),
                    {},
                    logger
                ),
            { message: /Invalid S3 XML.*object.*1/u } as any
        );

        t.end();
    });

    t.test("Should reject invalid exscore", (t) => {
        t.throws(
            () =>
                ParseSolidStateXML(
                    MockMulterFile(
                        GetKTDataBuffer("./s3/invalid-exscore.xml"),
                        "invalid-exscore.xml"
                    ),
                    {},
                    logger
                ),
            { message: /Invalid S3 XML.*exscore.*positive integer.*-1/u } as any
        );

        t.end();
    });

    t.test("Should reject billion laughs", (t) => {
        const time = process.hrtime.bigint();

        t.throws(
            () =>
                ParseSolidStateXML(
                    MockMulterFile(
                        GetKTDataBuffer("./s3/danger/billion-laughs.xml"),
                        "billion-laughs.xml"
                    ),
                    {},
                    logger
                ),
            { message: /Invalid S3 XML/u } as any
        );

        const end = GetMilisecondsSince(time);

        t.ok(end < 10_000, "Should take less than 10 seconds");

        t.end();
    });

    t.test("Should not expand specifically crafted billion laughs", (t) => {
        const time = process.hrtime.bigint();

        const res = ParseSolidStateXML(
            MockMulterFile(
                GetKTDataBuffer("./s3/danger/specific-blaugh.xml"),
                "specific-blaugh.xml"
            ),
            {},
            logger
        );

        // @ts-expect-error shush
        t.equal(res.iterable[0].songname, "&lol9;", "Should not expand billion laughs.");

        const end = GetMilisecondsSince(time);

        t.ok(end < 10_000, "Should take less than 10 seconds");

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
