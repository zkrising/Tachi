import { integer } from "tachi-common";

export interface LR2HookScore {
	md5: string;
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
		lamp: "NO PLAY" | "FAIL" | "EASY" | "NORMAL" | "HARD" | "FULL COMBO";
		hpGraph: integer[];
	};
}

export interface LR2HookContext {
	timeReceived: number;
}
