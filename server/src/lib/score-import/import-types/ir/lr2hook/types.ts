import type { integer } from "tachi-common";

export interface LR2HookScore {
	md5: string;
	playerData: {
		autoScr: 0;
		gameMode: unknown;
		random: "MIRROR" | "NORAN" | "RAN" | "S-RAN";
		gauge: "EASY" | "G-ATTACK" | "GROOVE" | "HARD" | "HAZARD" | "P-ATTACK";
	};
	scoreData: {
		pgreat: integer;
		great: integer;
		good: integer;
		bad: integer;
		poor: integer;
		maxCombo: integer;
		exScore: integer;
		moneyScore: integer;
		notesTotal: integer;
		notesPlayed: integer;
		lamp: "EASY" | "FAIL" | "FULL COMBO" | "HARD" | "NO PLAY" | "NORMAL";
		hpGraph: Array<integer>;
	};
}

export interface LR2HookContext {
	timeReceived: number;
}
