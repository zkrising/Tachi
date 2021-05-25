/* eslint-disable @typescript-eslint/no-explicit-any */
import t from "tap";
import { CloseMongoConnection } from "../../../../external/mongo/db";
import CreateLogCtx from "../../../../logger/logger";
import ResetDBState from "../../../../test-utils/reset-db-state";
import {
    GetKTDataJSON,
    LoadKTBlackIIDXData,
    Testing511Song,
    Testing511SPA,
} from "../../../../test-utils/test-data";
import { ConvertFileS3, ParseDifficulty, ResolveS3Lamp } from "./converter";
import { S3Score } from "./types";
import deepmerge from "deepmerge";

const logger = CreateLogCtx(__filename);

function cfile(data: S3Score) {
    return ConvertFileS3(data, {}, "file/solid-state-squad", logger);
}

t.test("#ConvertFileS3", (t) => {
    t.beforeEach(ResetDBState);
    t.beforeEach(() => {
        delete BaseS3Score._id; // just incase
    });

    function mfile(merge: Partial<S3Score>) {
        return cfile(deepmerge(BaseS3Score, merge));
    }

    const dryScore = {
        game: "iidx",
        comment: null,
        importType: "file/solid-state-squad",
        service: "Solid State Squad",
        scoreData: {
            // percent: 6.36, -- fpa
            grade: "F",
            score: 100,
            lamp: "FULL COMBO",
            hitData: {
                pgreat: 25,
                great: 50,
                good: 0,
                bad: 0,
                poor: 4,
            },
            hitMeta: {},
        },
        scoreMeta: {},
        timeAchieved: 1287460462000,
    };

    const BaseS3Score = GetKTDataJSON("./s3/s3score.json");

    t.test("Should import a valid S3 score", async (t) => {
        const res = await cfile(BaseS3Score);

        t.hasStrict(
            res,
            {
                chart: Testing511SPA,
                song: Testing511Song,
                dryScore,
            } as any,
            "Should correctly return the song, chart and DryScore."
        );

        t.end();
    });

    t.test("Should support comments in S3 scores", async (t) => {
        const res = await mfile({ comment: "FOO BAR" });

        t.hasStrict(
            res,
            {
                chart: Testing511SPA,
                song: Testing511Song,
                dryScore: deepmerge(dryScore, { comment: "FOO BAR" }),
            } as any,
            "Should correctly return the song, chart and DryScore."
        );

        t.end();
    });

    t.test("Should find song case-insensitively", async (t) => {
        await LoadKTBlackIIDXData();

        const res = await mfile({ songname: "aBSolUte", diff: 7 });

        t.hasStrict(
            res,
            {
                chart: { songID: 97, difficulty: "HYPER", playtype: "SP" },
                song: { title: "ABSOLUTE" },
                // dryScore, dont care
            } as any,
            "Should correctly return the song, chart and DryScore."
        );

        t.end();
    });

    t.test("Should reject invalid styles in S3 scores", (t) => {
        t.rejects(mfile({ styles: "3rd,4th,INVALID" }), {
            message: /Song has invalid style INVALID/u,
        } as any);

        t.end();
    });

    t.test("Should throw ktdatanf if no song", (t) => {
        t.rejects(mfile({ songname: "INVALID SONG TITLE" }), {
            message: /Could not find song with title INVALID SONG TITLE/u,
        } as any);

        t.end();
    });

    t.test("Should throw ktdatanf if no song", (t) => {
        t.rejects(mfile({ diff: "B" }), {
            message: /Could not find chart 5\.1\.1\. \(SP LEGGENDARIA/u,
        } as any);

        t.end();
    });

    t.test("Should throw a skipscore if the song is 5key", (t) => {
        t.rejects(mfile({ diff: 5 }), {
            message: /5KEY scores are not supported/u,
        } as any);

        t.end();
    });

    t.test("Should throw an invalidscore if the difficulty is invalid", (t) => {
        t.rejects(mfile({ diff: "INVALID" as any }), {
            message: /Invalid difficulty INVALID/u,
        } as any);

        t.end();
    });

    t.test("Should throw an invalidscore if the hardeasy is invalid", (t) => {
        t.rejects(mfile({ mods: { hardeasy: "INVALID" } as any, cleartype: "cleared" }), {
            message: /Invalid cleartype of 'cleared' with hardeasy of INVALID/u,
        } as any);

        t.end();
    });

    t.test("Should throw an invalidscore if the cleartype is invalid", (t) => {
        t.rejects(mfile({ cleartype: "INVALID" as any }), {
            message: /Invalid cleartype of INVALID/u,
        } as any);

        t.end();
    });

    t.test("Should throw an invalidscore if the exscore is greater than MAX", (t) => {
        t.rejects(mfile({ exscore: 10000 }), {
            message: /Invalid percent of 636/u,
        } as any);

        t.end();
    });

    t.test("Should throw an invalidscore if the date is invalid.", (t) => {
        t.rejects(mfile({ date: "INVALID" }), {
            message: /Invalid\/Unparsable score timestamp of INVALID/u,
        } as any);

        t.end();
    });

    t.end();
});

t.test("#ParseDifficulty", (t) => {
    t.beforeEach(ResetDBState);

    t.strictSame(ParseDifficulty("L7"), { playtype: "SP", difficulty: "NORMAL" });
    t.strictSame(ParseDifficulty(7), { playtype: "SP", difficulty: "HYPER" });
    t.strictSame(ParseDifficulty("A"), { playtype: "SP", difficulty: "ANOTHER" });
    t.strictSame(ParseDifficulty("B"), { playtype: "SP", difficulty: "LEGGENDARIA" });
    t.strictSame(ParseDifficulty("L14"), { playtype: "DP", difficulty: "NORMAL" });
    t.strictSame(ParseDifficulty(14), { playtype: "DP", difficulty: "HYPER" });
    t.strictSame(ParseDifficulty("A14"), { playtype: "DP", difficulty: "ANOTHER" });
    t.strictSame(ParseDifficulty("B14"), { playtype: "DP", difficulty: "LEGGENDARIA" });
    t.throws(() => ParseDifficulty(5));

    t.end();
});

t.test("#ResolveS3Lamp", (t) => {
    t.beforeEach(ResetDBState);

    t.equal(ResolveS3Lamp({ cleartype: "played" } as S3Score, logger), "FAILED");
    t.equal(ResolveS3Lamp({ cleartype: "cleared", mods: {} } as S3Score, logger), "CLEAR");
    t.equal(
        ResolveS3Lamp({ cleartype: "cleared", mods: { hardeasy: "E" } } as S3Score, logger),
        "EASY CLEAR"
    );
    t.equal(
        ResolveS3Lamp({ cleartype: "cleared", mods: { hardeasy: "H" } } as S3Score, logger),
        "HARD CLEAR"
    );
    t.equal(ResolveS3Lamp({ cleartype: "combo" } as S3Score, logger), "FULL COMBO");
    t.equal(ResolveS3Lamp({ cleartype: "comboed" } as S3Score, logger), "FULL COMBO");
    t.equal(ResolveS3Lamp({ cleartype: "perfect" } as S3Score, logger), "FULL COMBO");
    t.equal(ResolveS3Lamp({ cleartype: "perfected" } as S3Score, logger), "FULL COMBO");

    t.throws(() => ResolveS3Lamp({ cleartype: "invalid" } as any, logger));
    t.throws(() =>
        ResolveS3Lamp({ cleartype: "cleared", mods: { hardeasy: "invalid" } } as any, logger)
    );

    t.end();
});

t.teardown(CloseMongoConnection);
