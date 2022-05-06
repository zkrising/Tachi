import type { GPTSupportedVersions, integer } from "tachi-common";

export interface FervidexStaticScore {
	clear_type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
	ex_score: integer;
	miss_count: integer | null; // bp, not cbrk
	chart: `${"dp" | "sp"}${"a" | "b" | "h" | "l" | "n"}`;
	song_id: integer;
}

export interface FervidexStaticContext {
	version: GPTSupportedVersions["iidx:DP" | "iidx:SP"];
}
