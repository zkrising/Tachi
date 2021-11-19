import deepmerge from "deepmerge";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { GetKTDataJSON, TestingAlbidaADV, TestingSDVXAlbidaSong } from "test-utils/test-data";
import ConvertEamSDVXCSV from "./converter";
import { SDVXEamusementCSVData } from "./types";

const logger = CreateLogCtx(__filename);

const parsedScore = GetKTDataJSON("./eamusement-sdvx-csv/parsed-data.json");

t.test("#ConvertEamSDVXCSV", (t) => {
	t.beforeEach(ResetDBState);

	function conv(g: Partial<SDVXEamusementCSVData> = {}) {
		return ConvertEamSDVXCSV(deepmerge(parsedScore, g), {}, "file/eamusement-sdvx-csv", logger);
	}

	t.test("Should return a dryScore on valid input.", async (t) => {
		const res = await conv();

		t.hasStrict(res, {
			song: TestingSDVXAlbidaSong,
			chart: TestingAlbidaADV,
			dryScore: {
				service: "e-amusement",
				game: "sdvx",
				scoreMeta: {},
				timeAchieved: null,
				comment: null,
				importType: "file/eamusement-sdvx-csv",
				scoreData: {
					score: 9310699,
					lamp: "EXCESSIVE CLEAR",
					// percent: 93.10699, floating point
					grade: "AA",
					judgements: {},
					hitMeta: {},
				},
			},
		});

		t.end();
	});


	t.test("Should reject invalid difficulty name", (t) => {
		t.rejects(() => conv({ difficulty: "INVALID" }), {
			message: /Invalid difficulty of INVALID\./u,
		});

		t.end();
	});

	t.test("Should throw KTDataNotFound on unknown song", (t) => {
		t.rejects(() => conv({ title: "INVALID SONG" }), {
			message: /Could not find song for INVALID SONG\./u,
		});

		t.end();
	});

	t.test("Should throw KTDataNotFound on unknown chart", (t) => {
		t.rejects(() => conv({ difficulty: "VIVID" }), {
			message: /Could not find chart for ALBIDA Powerless Mix \[VVD\]\./u,
		});

		t.end();
	});

	t.test("Should reject incorrect level", (t) => {
		t.rejects(() => conv({ level: "17" }), {
			message: /Should be level 10, but found level 17\./u,
		});

		t.end();
	});

	t.test("Should reject invalid score", (t) => {
		t.rejects(() => conv({ score: "not a number" }), {
			message: /Invalid score of not a number\./u,
		});

		t.rejects(() => conv({ score: "10000001" }), {
			message: /Invalid score of 10000001 \(was greater than 10,000,000\)\./u,
		});

		t.end();
	});

	t.test("Should reject invalid lamp", (t) => {
		t.rejects(() => conv({ lamp: "INVALID" }), {
			message: /Invalid lamp of INVALID\./u,
		});

		t.end();
	});

	t.end();
});
