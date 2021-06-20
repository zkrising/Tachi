import { integer } from "tachi-common";

export interface ARCDDRScore {
	chart_id: string;
	lamp: "MARVELOUS_FC" | "PERFECT_FC" | "GREAT_FC" | "GOOD_FC" | "CLEAR_3LIFE" | "CLEAR" | "FAIL";
	score: integer;
	ex_score: integer;
	max_combo: integer;
	judgments: {
		marvelous: integer;
		perfect: integer;
		great: integer;
		good: integer;
		boo: integer;
		miss: integer;
		ok: integer;
		ng: integer;
	};
	fast: integer;
	slow: integer;
	timestamp: string;
}
