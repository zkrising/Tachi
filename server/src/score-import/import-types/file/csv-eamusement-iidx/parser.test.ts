import t from "tap";
import CreateLogCtx from "../../../../logger";
import ScoreImportFatalError from "../../../framework/common/score-import-error";
import ParseEamusementCSV, { NaiveCSVParse, ResolveHeaders } from "./parser";
import { CloseMongoConnection } from "../../../../db/db";
import {
    TestingIIDXEamusementCSV26,
    TestingIIDXEamusementCSV27,
} from "../../../../test-utils/test-data";

const logger = CreateLogCtx("parser.test.ts");

t.test("#ParseEamusementCSV", (t) => {
    t.test("Valid Rootage-Type CSV", (t) => {
        let { iterableData, hasBeginnerAndLegg, version } = NaiveCSVParse(
            TestingIIDXEamusementCSV26,
            logger
        );

        t.equal(iterableData.length, 839, "Should return exactly 839 datapoints.");
        t.equal(hasBeginnerAndLegg, false, "Should not mark as a HV csv.");
        t.equal(version, "23", "Should correctly assert that the version of this CSV is copula.");

        t.end();
    });

    t.test("Valid HV CSV", (t) => {
        let { iterableData, hasBeginnerAndLegg, version } = NaiveCSVParse(
            TestingIIDXEamusementCSV27,
            logger
        );

        t.equal(iterableData.length, 1257, "Should return exactly 1257 datapoints.");
        t.equal(hasBeginnerAndLegg, true, "Should mark as a HV csv.");
        t.equal(
            version,
            "27",
            "Should correctly assert that the version of this CSV is HEROIC VERSE."
        );

        t.end();
    });

    t.test("Malicious Headers", (t) => {
        // these headers are valid, because we don't check the contents
        // only that it has the right amt of headers
        let headerStr = `${"a,".repeat(26)}a`;

        let TooShort = Buffer.from(`${headerStr}\n${"a,".repeat(3)}a`);

        t.throws(
            () => NaiveCSVParse(TooShort, logger),
            new ScoreImportFatalError(400, "Row 1 has an invalid amount of cells (4, expected 27)")
        );

        let TooLong = Buffer.from(`${headerStr}\n${"a,".repeat(50)}a`);

        t.throws(
            () => NaiveCSVParse(TooLong, logger),
            new ScoreImportFatalError(400, "Row 1 has an invalid amount of cells (51, expected 27)")
        );

        t.end();
    });

    t.test("Misshaped Rows", (t) => {
        let LongHeaders = Buffer.from(`${"a".repeat(1000)},a`);

        t.throws(
            () => NaiveCSVParse(LongHeaders, logger),
            new ScoreImportFatalError(400, "Headers were longer than 1000 characters long.")
        );

        let TooManyHeaders = Buffer.from(`${"a,".repeat(50)}a`);

        t.throws(
            () => NaiveCSVParse(TooManyHeaders, logger),
            new ScoreImportFatalError(400, "Too many CSV headers.")
        );

        t.end();
    });

    t.test("Version Inference", (t) => {
        let headerStr = `${"a,".repeat(26)}a`;

        let row = `GARBAGE VERSION,foo bar,${"a,".repeat(24)}a`;

        let InvalidVersions = Buffer.from(`${headerStr}\n${row}`);

        t.throws(
            () => NaiveCSVParse(InvalidVersions, logger),
            new ScoreImportFatalError(
                400,
                "Invalid/Unsupported Eamusement Version Name GARBAGE VERSION."
            )
        );

        let row27th = `HEROIC VERSE,foo bar,${"a,".repeat(24)}a`;
        let row17th = `SIRIUS,foo bar,${"a,".repeat(24)}a`;

        let { version } = NaiveCSVParse(
            Buffer.from([headerStr, row27th, row17th].join("\n")),
            logger
        );

        t.equal(version, "27", "Should pick the largest version from the list of scores.");

        ({ version } = NaiveCSVParse(
            Buffer.from([headerStr, row17th, row27th].join("\n")),
            logger
        ));

        // this is technically allowing invalid eam-csv, but, who cares?
        t.equal(
            version,
            "27",
            "Should pick largest version regardless of order scores are recieved in."
        );

        t.end();
    });

    t.end();
});

t.test("#ResolveHeader", (t) => {
    t.test("Rootage-type Headers", (t) => {
        let { hasBeginnerAndLegg } = ResolveHeaders(
            [
                "バージョン",
                "タイトル",
                "ジャンル",
                "アーティスト",
                "プレー回数",
                "NORMAL 難易度",
                "NORMAL EXスコア",
                "NORMAL PGreat",
                "NORMAL Great",
                "NORMAL ミスカウント",
                "NORMAL クリアタイプ",
                "NORMAL DJ LEVEL",
                "HYPER 難易度",
                "HYPER EXスコア",
                "HYPER PGreat",
                "HYPER Great",
                "HYPER ミスカウント",
                "HYPER クリアタイプ",
                "HYPER DJ LEVEL",
                "ANOTHER 難易度",
                "ANOTHER EXスコア",
                "ANOTHER PGreat",
                "ANOTHER Great",
                "ANOTHER ミスカウント",
                "ANOTHER クリアタイプ",
                "ANOTHER DJ LEVEL",
                "最終プレー日時",
            ],
            logger
        );

        t.equal(hasBeginnerAndLegg, false, "Should return false for hasBeginnerAndLegg");

        t.end();
    });

    t.test("HV-type Headers", (t) => {
        let { hasBeginnerAndLegg } = ResolveHeaders(
            [
                "バージョン",
                "タイトル",
                "ジャンル",
                "アーティスト",
                "プレー回数",
                "BEGINNER 難易度",
                "BEGINNER スコア",
                "BEGINNER PGreat",
                "BEGINNER Great",
                "BEGINNER ミスカウント",
                "BEGINNER クリアタイプ",
                "BEGINNER DJ LEVEL",
                "NORMAL 難易度",
                "NORMAL スコア",
                "NORMAL PGreat",
                "NORMAL Great",
                "NORMAL ミスカウント",
                "NORMAL クリアタイプ",
                "NORMAL DJ LEVEL",
                "HYPER 難易度",
                "HYPER スコア",
                "HYPER PGreat",
                "HYPER Great",
                "HYPER ミスカウント",
                "HYPER クリアタイプ",
                "HYPER DJ LEVEL",
                "ANOTHER 難易度",
                "ANOTHER スコア",
                "ANOTHER PGreat",
                "ANOTHER Great",
                "ANOTHER ミスカウント",
                "ANOTHER クリアタイプ",
                "ANOTHER DJ LEVEL",
                "LEGGENDARIA 難易度",
                "LEGGENDARIA スコア",
                "LEGGENDARIA PGreat",
                "LEGGENDARIA Great",
                "LEGGENDARIA ミスカウント",
                "LEGGENDARIA クリアタイプ",
                "LEGGENDARIA DJ LEVEL",
                "最終プレー日時",
            ],
            logger
        );

        t.equal(hasBeginnerAndLegg, true, "Should return true for hasBeginnerAndLegg");

        t.end();
    });

    t.test("No headers", (t) => {
        t.throws(
            () => ResolveHeaders([], logger),
            new ScoreImportFatalError(
                400,
                "Invalid CSV provided. CSV does not have the correct amount of headers."
            ),
            "Should throw an error on no headers."
        );

        t.end();
    });

    t.test("Too Many Headers", (t) => {
        t.throws(
            () => ResolveHeaders(Array(1000), logger),
            new ScoreImportFatalError(
                400,
                "Invalid CSV provided. CSV does not have the correct amount of headers."
            ),
            "Should throw an error on no headers."
        );

        t.end();
    });

    t.end();
});

t.test("#ParseEamusementCSV", (t) => {
    function MockMulterFile(buffer: Buffer, originalname: string) {
        return {
            originalname,
            buffer,
        } as Express.Multer.File;
    }

    t.test("Playtype Tests", (t) => {
        let validSPFile = MockMulterFile(TestingIIDXEamusementCSV27, "iidx_27_sp.csv");

        t.throws(
            () => ParseEamusementCSV(validSPFile, {}, logger),
            new ScoreImportFatalError(400, "Invalid playtype of Nothing given.")
        );

        let { context } = ParseEamusementCSV(validSPFile, { playtype: "SP" }, logger);

        t.equal(context.playtype, "SP", "Should correctly assert SP for a body of SP.");

        let mockDPFile = MockMulterFile(TestingIIDXEamusementCSV27, "iidx_27_dp.csv");

        ({ context } = ParseEamusementCSV(mockDPFile, { playtype: "DP" }, logger));

        t.equal(context.playtype, "DP", "Should correctly assert DP for a body of DP.");

        t.throws(
            () => ParseEamusementCSV(validSPFile, { playtype: "DP" }, logger),
            new ScoreImportFatalError(
                400,
                "Safety Triggered: Filename contained 'SP', but was marked as a DP import. Are you *absolutely* sure this is right?"
            ),
            "Should trigger safety if playtype asserted goes against filename."
        );

        ({ context } = ParseEamusementCSV(
            mockDPFile,
            { playtype: "DP", assertPlaytypeCorrect: true },
            logger
        ));

        t.equal(
            context.playtype,
            "DP",
            "Should ignore weird filenames if assertPlaytypeCorrect is passed."
        );

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
