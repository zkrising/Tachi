import type { GPTSupportedVersions, integer } from "tachi-common";

export interface FervidexScore {
	chart: `${"dp" | "sp"}${"a" | "b" | "h" | "l" | "n"}`;

	entry_id: integer;
	chart_sha256?: string;

	// whether or whether not this chart is from 2dxtra
	custom?: boolean;

	pgreat: integer;
	great: integer;
	good: integer;
	bad: integer;
	poor: integer;

	slow: integer;
	fast: integer;
	max_combo?: integer;
	combo_break: integer;

	ex_score: integer;
	clear_type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

	gauge: Array<integer>;
	ghost: Array<integer>;

	dead?: {
		measure?: integer | null;
		note?: integer | null;
	};

	option?: {
		gauge?: "ASSISTED_EASY" | "EASY" | "EX_HARD" | "HARD" | null;
		range?:
			| "HIDDEN_PLUS"
			| "LIFT_SUD_PLUS"
			| "LIFT"
			| "SUD_PLUS_HID_PLUS"
			| "SUDDEN_PLUS"
			| null;
		style?: "MIRROR" | "R_RANDOM" | "RANDOM" | "S_RANDOM" | null;
		style_2p?: "MIRROR" | "R_RANDOM" | "RANDOM" | "S_RANDOM" | null;
		assist?: "ASCR_LEGACY" | "AUTO_SCRATCH" | "FULL_ASSIST" | "LEGACY_NOTE" | null;
	};

	pacemaker: {
		name?: string | null;
		score?: integer | null;

		// too lazy to type this properly (it's a string enum) but we dont use it.
		type?: string | null;
	};

	"2dx-gsm"?: {
		EASY: Array<number | null>;
		NORMAL: Array<number | null>;
		HARD: Array<number | null>;
		EX_HARD: Array<number | null>;
	} | null;
}

export interface FervidexContext {
	version: GPTSupportedVersions["iidx:DP" | "iidx:SP"];
	timeReceived: number;
}
