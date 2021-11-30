import { integer } from "tachi-common";

export interface KsHookSV3CScore {
	appeal_id: integer;
	clear:
		| "CLEAR_PLAYED"
		| "CLEAR_EFFECTIVE"
		| "CLEAR_EXCESSIVE"
		| "CLEAR_ULTIMATE_CHAIN"
		| "CLEAR_PERFECT";
	difficulty: `DIFFICULTY_${"NOVICE" | "ADVANCED" | "EXHAUST" | "INFINITE" | "MAXIMUM"}`;
	early: integer;
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
	late: integer;
	max_chain: integer;
	music_id: integer;

	btn_rate: integer;
	long_rate: integer;
	vol_rate: integer;

	critical: integer;
	near: integer;
	error: integer;

	player_name: string;
	rate: `RATE_${"EFFECTIVE" | "PERMISSIVE" | "EXCESSIVE" | "BLASTIVE"}`;
	score: integer;

	skill_frame: `SKILL_FRAME_${"NONE" | "SILVER" | "GOLD" | "GOLD_HALO"}`;
	skill_level: `SKILL_LEVEL_${
		| "NONE"
		| "01"
		| "02"
		| "03"
		| "04"
		| "05"
		| "06"
		| "07"
		| "08"
		| "09"
		| "10"
		| "11"
		| "12"}`;
	skill_name: integer;
	track_no: integer;
}
