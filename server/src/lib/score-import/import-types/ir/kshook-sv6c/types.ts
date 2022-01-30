import { integer } from "tachi-common";

export interface KsHookSV6CScore {
	clear:
		| "CLEAR_PLAYED"
		| "CLEAR_EFFECTIVE"
		| "CLEAR_EXCESSIVE"
		| "CLEAR_ULTIMATE_CHAIN"
		| "CLEAR_PERFECT";
	difficulty: `DIFFICULTY_${"NOVICE" | "ADVANCED" | "EXHAUST" | "INFINITE" | "MAXIMUM"}`;
	gauge: integer;
	grade: `GRADE_${
		| "D"
		| "C"
		| "B"
		| "A"
		| "A_PLUS"
		| "AA"
		| "AA_PLUS"
		| "AAA"
		| "AAA_PLUS"
		| "S"}`;
	max_chain: integer;
	music_id: integer;

	btn_rate: integer;
	long_rate: integer;
	vol_rate: integer;

	critical: integer;
	near: integer;
	error: integer;

	rate: `RATE_${"EFFECTIVE" | "PERMISSIVE" | "EXCESSIVE" | "BLASTIVE"}`;
	score: integer;
	ex_score: integer;

	track_no: integer;
}

export interface KsHookSV6CContext {
	timeReceived: number;
}
