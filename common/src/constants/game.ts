export enum IIDX_LAMPS {
	NO_PLAY,
	FAILED,
	ASSIST_CLEAR,
	EASY_CLEAR,
	CLEAR,
	HARD_CLEAR,
	EX_HARD_CLEAR,
	FULL_COMBO,
}

export enum CHUNITHM_LAMPS {
	FAILED,
	CLEAR,
	FULL_COMBO,
	ALL_JUSTICE,
	ALL_JUSTICE_CRITICAL,
}

export enum SDVX_LAMPS {
	FAILED,
	CLEAR,
	EXCESSIVE_CLEAR,
	ULTIMATE_CHAIN,
	PERFECT_ULTIMATE_CHAIN,
}

export enum MUSECA_LAMPS {
	FAILED,
	CLEAR,
	CONNECT_ALL,
	PERFECT_CONNECT_ALL,
}

export enum DDR_LAMPS {
	FAILED,
	CLEAR,
	LIFE4,
	FULL_COMBO,
	GREAT_FULL_COMBO,
	PERFECT_FULL_COMBO,
	MARVELOUS_FULL_COMBO,
}

export enum MAIMAI_LAMPS {
	FAILED,
	CLEAR,
	FULL_COMBO,
	ALL_PERFECT,
	ALL_PERFECT_PLUS,
}

export enum GITADORA_LAMPS {
	FAILED,
	CLEAR,
	FULL_COMBO,
	EXCELLENT,
}

export enum IIDX_GRADES {
	F,
	E,
	D,
	C,
	B,
	A,
	AA,
	AAA,
	MAX_MINUS,
	MAX,
}

export enum CHUNITHM_GRADES {
	D,
	C,
	B,
	BB,
	BBB,
	A,
	AA,
	AAA,
	S,
	SS,
	SSS,
}

export enum SDVX_GRADES {
	D,
	C,
	B,
	A,
	A_PLUS,
	AA,
	AA_PLUS,
	AAA,
	AAA_PLUS,
	S,
}

export enum MUSECA_GRADES {
	没,
	拙,
	凡,
	佳,
	良,
	優,
	秀,
	傑,
	傑G,
}

/**
 * Kxxx refers to the starting point of that grade,
 * since they dont translate to english well.
 * K950 means the grade that starts at 950K and goes
 * to 975K.
 */
export enum MUSECA_GRADES_ASCII {
	ZERO,
	K600,
	K700,
	K800,
	K850,
	K900,
	K950,
	K975,
	K1000,
}

export enum DDR_GRADES {
	D,
	D_PLUS,
	C_MINUS,
	C,
	C_PLUS,
	B_MINUS,
	B,
	B_PLUS,
	A_MINUS,
	A,
	A_PLUS,
	AA_MINUS,
	AA,
	AA_PLUS,
	AAA,
}

export enum MAIMAI_GRADES {
	F,
	E,
	D,
	C,
	B,
	A,
	AA,
	AAA,
	S,
	S_PLUS,
	SS,
	SS_PLUS,
	SSS,
	SSS_PLUS,
}

export enum GITADORA_GRADES {
	C,
	B,
	A,
	S,
	SS,
	MAX,
}
