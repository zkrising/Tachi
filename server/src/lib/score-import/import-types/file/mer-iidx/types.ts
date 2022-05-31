import type { integer } from "tachi-common";

export interface MerScore {
	music_id: integer;
	play_type: "DOUBLE" | "SINGLE";
	diff_type: "ANOTHER" | "BEGINNER" | "HYPER" | "LEGGENDARIA" | "NORMAL";
	score: integer;
	miss_count: integer;
	clear_type:
		| "ASSIST CLEAR"
		| "CLEAR"
		| "EASY CLEAR"
		| "EX HARD CLEAR"
		| "FAILED"
		| "FULLCOMBO CLEAR"
		| "HARD CLEAR"
		| "NO PLAY";
	update_time: string;
}
