import type { integer } from "tachi-common";

export interface LR2HookScore {
	md5: string;
	playerData: {
		autoScr: 0;
		gameMode: unknown;
		random: "MIRROR" | "NORAN" | "RAN" | "S-RAN";
		gauge: "EASY" | "G-ATTACK" | "GROOVE" | "HARD" | "HAZARD" | "P-ATTACK";
		rseed: integer | undefined;
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
		extendedJudgements:
			| {
					epg: integer;
					lpg: integer;
					egr: integer;
					lgr: integer;
					egd: integer;
					lgd: integer;
					ebd: integer;
					lbd: integer;
					epr: integer;
					lpr: integer;
					cb: integer;
					fast: integer;
					slow: integer;
					notesPlayed: integer;
			  }
			| null
			| undefined;
		extendedHpGraphs:
			| {
					groove: Array<integer>;
					hard: Array<integer>;
					hazard: Array<integer>;
					easy: Array<integer>;
					pattack: Array<integer>;
					gattack: Array<integer>;
			  }
			| null
			| undefined;
	};
}

export interface LR2HookContext {
	timeReceived: number;
}
