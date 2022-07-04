export enum IIDX_LAMPS {
	NO_PLAY = 0,
	FAILED = 1,
	ASSIST_CLEAR = 2,
	EASY_CLEAR = 3,
	CLEAR = 4,
	HARD_CLEAR = 5,
	EX_HARD_CLEAR = 6,
	FULL_COMBO = 7,
}

export enum CHUNITHM_LAMPS {
	FAILED = 0,
	CLEAR = 1,
	FULL_COMBO = 2,
	ALL_JUSTICE = 3,
	ALL_JUSTICE_CRITICAL = 4,
}

export enum SDVX_LAMPS {
	FAILED = 0,
	CLEAR = 1,
	EXCESSIVE_CLEAR = 2,
	ULTIMATE_CHAIN = 3,
	PERFECT_ULTIMATE_CHAIN = 4,
}

export enum MUSECA_LAMPS {
	FAILED = 0,
	CLEAR = 1,
	CONNECT_ALL = 2,
	PERFECT_CONNECT_ALL = 3,
}

export enum DDR_LAMPS {
	FAILED = 0,
	CLEAR = 1,
	LIFE4 = 2,
	FULL_COMBO = 3,
	GREAT_FULL_COMBO = 4,
	PERFECT_FULL_COMBO = 5,
	MARVELOUS_FULL_COMBO = 6,
}

export enum MAIMAI_LAMPS {
	FAILED = 0,
	CLEAR = 1,
	FULL_COMBO = 2,
	ALL_PERFECT = 3,
	ALL_PERFECT_PLUS = 4,
}

export enum GITADORA_LAMPS {
	FAILED = 0,
	CLEAR = 1,
	FULL_COMBO = 2,
	EXCELLENT = 3,
}

export enum IIDX_GRADES {
	F = 0,
	E = 1,
	D = 2,
	C = 3,
	B = 4,
	A = 5,
	AA = 6,
	AAA = 7,
	MAX_MINUS = 8,
	MAX = 9,
}

export enum CHUNITHM_GRADES {
	D = 0,
	C = 1,
	B = 2,
	BB = 3,
	BBB = 4,
	A = 5,
	AA = 6,
	AAA = 7,
	S = 8,
	SS = 9,
	SSS = 10,
}

export enum SDVX_GRADES {
	D = 0,
	C = 1,
	B = 2,
	A = 3,
	A_PLUS = 4,
	AA = 5,
	AA_PLUS = 6,
	AAA = 7,
	AAA_PLUS = 8,
	S = 9,
}

export enum MUSECA_GRADES {
	没 = 0,
	拙 = 1,
	凡 = 2,
	佳 = 3,
	良 = 4,
	優 = 5,
	秀 = 6,
	傑 = 7,
	傑G = 8,
}

/**
 * Kxxx refers to the starting point of that grade,
 * since they dont translate to english well.
 * K950 means the grade that starts at 950K and goes
 * to 975K.
 */
export enum MUSECA_GRADES_ASCII {
	ZERO = 0,
	K600 = 1,
	K700 = 2,
	K800 = 3,
	K850 = 4,
	K900 = 5,
	K950 = 6,
	K975 = 7,
	K1000 = 8,
}

export enum DDR_GRADES {
	D = 0,
	D_PLUS = 1,
	C_MINUS = 2,
	C = 3,
	C_PLUS = 4,
	B_MINUS = 5,
	B = 6,
	B_PLUS = 7,
	A_MINUS = 8,
	A = 9,
	A_PLUS = 10,
	AA_MINUS = 11,
	AA = 12,
	AA_PLUS = 13,
	AAA = 14,
}

export enum MAIMAI_GRADES {
	F = 0,
	E = 1,
	D = 2,
	C = 3,
	B = 4,
	A = 5,
	AA = 6,
	AAA = 7,
	S = 8,
	S_PLUS = 9,
	SS = 10,
	SS_PLUS = 11,
	SSS = 12,
	SSS_PLUS = 13,
}

export enum GITADORA_GRADES {
	C = 0,
	B = 1,
	A = 2,
	S = 3,
	SS = 4,
	MAX = 5,
}
