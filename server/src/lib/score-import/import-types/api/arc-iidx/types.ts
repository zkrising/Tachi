import type { integer } from "tachi-common";

export interface ARCIIDXScore {
	chart_id: string;
	lamp:
		| "ASSIST_CLEAR"
		| "CLEAR"
		| "EASY_CLEAR"
		| "EX_HARD_CLEAR"
		| "FAILED"
		| "FULL_COMBO"
		| "HARD_CLEAR"
		| "NO_PLAY";
	ex_score: integer;
	miss_count: integer | null;
	timestamp: string;
}
