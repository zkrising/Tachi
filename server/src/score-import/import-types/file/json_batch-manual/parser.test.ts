import t from "tap";
import { CloseMongoConnection } from "../../../../db/db";
import CreateLogCtx from "../../../../logger";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import ParserFn from "./parser";

const fileify = (obj: any) =>
    ({
        buffer: Buffer.from(JSON.stringify(obj)),
        filename: "fileify.json",
    } as Express.Multer.File);

const logger = CreateLogCtx("parser.test.ts");

t.test("#ParserFn", (t) => {
    t.test("Non-Object", (t) => {
        t.throws(
            () => ParserFn(fileify(false), {}, logger),
            new ScoreImportFatalError(
                400,
                "Invalid BATCH-MANUAL (Not an object, recieved boolean.)"
            ),
            "Should throw an error."
        );

        t.end();
    });

    t.test("No Header", (t) => {
        t.throws(
            () => ParserFn(fileify({ body: [] }), {}, logger),
            new ScoreImportFatalError(
                400,
                "Could not retrieve head.game - is this valid BATCH-MANUAL?"
            ),
            "Should throw an error."
        );

        t.end();
    });

    t.test("No Game", (t) => {
        t.throws(
            () => ParserFn(fileify({ body: [], head: { service: "foo" } }), {}, logger),
            new ScoreImportFatalError(
                400,
                "Could not retrieve head.game - is this valid BATCH-MANUAL?"
            ),
            "Should throw an error."
        );

        t.end();
    });

    t.test("Invalid Game", (t) => {
        t.throws(
            () =>
                ParserFn(
                    fileify({ body: [], head: { service: "foo", game: "invalid_game" } }),
                    {},
                    logger
                ),
            new ScoreImportFatalError(
                400,
                "Invalid game invalid_game - expected any of iidx, museca, maimai, jubeat, popn, sdvx, ddr, bms, chunithm, gitadora, usc"
            ),
            "Should throw an error."
        );

        t.throws(
            () => ParserFn(fileify({ body: [], head: { service: "foo", game: 123 } }), {}, logger),
            new ScoreImportFatalError(
                400,
                "Invalid game 123 - expected any of iidx, museca, maimai, jubeat, popn, sdvx, ddr, bms, chunithm, gitadora, usc"
            ),
            "Should throw an error."
        );

        t.end();
    });

    t.test("Invalid Service", (t) => {
        t.throws(
            () => ParserFn(fileify({ body: [], head: { service: "1", game: "iidx" } }), {}, logger),
            new ScoreImportFatalError(
                400,
                "Invalid BATCH-MANUAL (head.service | Expected a string with length between 3 and 15. | Received 1)"
            ),
            "Should throw an error."
        );

        t.throws(
            () => ParserFn(fileify({ body: [], head: { service: 1, game: "iidx" } }), {}, logger),
            new ScoreImportFatalError(
                400,
                "Invalid BATCH-MANUAL (head.service | Expected a string with length between 3 and 15. | Received 1)"
            ),
            "Should throw an error."
        );

        t.end();
    });

    t.test("Valid Empty BATCH-MANUAL", (t) => {
        let res = ParserFn(
            fileify({ body: [], head: { service: "foo", game: "iidx" } }),
            {},
            logger
        );

        t.hasStrict(res, {
            // @ts-expect-error asdf
            game: "iidx",
            context: {
                // @ts-expect-error asdf
                service: "foo",
                game: "iidx",
                version: null,
            },
            // @ts-expect-error asdf
            iterable: [],
        });

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
