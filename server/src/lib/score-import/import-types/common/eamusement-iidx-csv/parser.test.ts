import GenericParseEamIIDXCSV, { IIDXCSVParse, ResolveHeaders } from "./parser";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { MockMulterFile } from "test-utils/mock-multer";
import { TestingIIDXEamusementCSV26, TestingIIDXEamusementCSV27 } from "test-utils/test-data";

const logger = CreateLogCtx(__filename);

t.test("#ParseEamusementCSV", (t) => {
	t.test("Valid Rootage-Type CSV", (t) => {
		const { iterableData, hasBeginnerAndLegg, version } = IIDXCSVParse(
			TestingIIDXEamusementCSV26,
			"SP",
			logger
		);

		t.equal(iterableData.length, 456, "Should return exactly 456 datapoints.");
		t.equal(hasBeginnerAndLegg, false, "Should not mark as a HV csv.");
		t.equal(version, "26", "Should correctly assert that the version of this CSV is ROOTAGE.");

		t.end();
	});

	t.test("Valid HV CSV", (t) => {
		const { iterableData, hasBeginnerAndLegg, version } = IIDXCSVParse(
			TestingIIDXEamusementCSV27,
			"SP",
			logger
		);

		t.equal(iterableData.length, 6285, "Should return exactly 6285 datapoints.");
		t.equal(hasBeginnerAndLegg, true, "Should mark as a HV csv.");
		t.equal(
			version,
			"27",
			"Should correctly assert that the version of this CSV is HEROIC VERSE."
		);

		t.end();
	});

	t.test("Broken CSV", (t) => {
		// This is mostly tested in the unit tests for NaiveCSVParse (the general one),
		// but we make sure that the CSVParseErrors are converted to ScoreImportFatalErrors
		const buffer = Buffer.from(`${"a,".repeat(26)}a\n${"a,".repeat(3)}a`);

		t.throws(
			() => IIDXCSVParse(buffer, "SP", logger),
			new ScoreImportFatalError(400, "Row 1 has an invalid amount of cells (4, expected 27)")
		);

		t.end();
	});

	t.test("Version Inference", (t) => {
		const headerStr = `${"a,".repeat(26)}a`;

		const row = `GARBAGE VERSION,foo bar,${"a,".repeat(24)}a`;

		const InvalidVersions = Buffer.from(`${headerStr}\n${row}`);

		t.throws(
			() => IIDXCSVParse(InvalidVersions, "SP", logger),
			new ScoreImportFatalError(
				400,
				"Invalid/Unsupported Eamusement Version Name GARBAGE VERSION."
			)
		);

		const row27th = `HEROIC VERSE,foo bar,${"a,".repeat(24)}a`;
		const row17th = `SIRIUS,foo bar,${"a,".repeat(24)}a`;

		let { version } = IIDXCSVParse(
			Buffer.from([headerStr, row27th, row17th].join("\n")),
			"SP",
			logger
		);

		t.equal(version, "27", "Should pick the largest version from the list of scores.");

		({ version } = IIDXCSVParse(
			Buffer.from([headerStr, row17th, row27th].join("\n")),
			"SP",
			logger
		));

		// this is technically allowing invalid eam-csv, but, who cares?
		t.equal(
			version,
			"27",
			"Should pick largest version regardless of order scores are received in."
		);

		t.end();
	});

	t.end();
});

t.test("#ResolveHeader", (t) => {
	t.test("Rootage-type Headers", (t) => {
		const { hasBeginnerAndLegg } = ResolveHeaders(
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
		const { hasBeginnerAndLegg } = ResolveHeaders(
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
	t.test("Playtype Tests", (t) => {
		const validSPFile = MockMulterFile(TestingIIDXEamusementCSV27, "iidx_27_sp.csv");

		t.throws(
			() => GenericParseEamIIDXCSV(validSPFile, {}, "e-amusement", logger),
			new ScoreImportFatalError(400, "Invalid playtype of undefined given.")
		);

		let { context } = GenericParseEamIIDXCSV(
			validSPFile,
			{ playtype: "SP" },
			"e-amusement",
			logger
		);

		t.equal(context.playtype, "SP", "Should correctly assert SP for a body of SP.");

		const mockDPFile = MockMulterFile(TestingIIDXEamusementCSV27, "iidx_27_dp.csv");

		({ context } = GenericParseEamIIDXCSV(
			mockDPFile,
			{ playtype: "DP" },
			"e-amusement",
			logger
		));

		t.equal(context.playtype, "DP", "Should correctly assert DP for a body of DP.");

		t.throws(
			() => GenericParseEamIIDXCSV(validSPFile, { playtype: "DP" }, "e-amusement", logger),
			new ScoreImportFatalError(
				400,
				"Safety Triggered: Filename contained 'SP', but was marked as a DP import. Are you *absolutely* sure this is right?"
			),
			"Should trigger safety if playtype asserted goes against filename."
		);

		({ context } = GenericParseEamIIDXCSV(
			mockDPFile,
			{ playtype: "DP", assertPlaytypeCorrect: true },
			"e-amusement",
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
