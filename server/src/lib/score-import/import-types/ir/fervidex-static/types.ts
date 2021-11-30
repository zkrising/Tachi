import { GPTSupportedVersions, integer } from "tachi-common";

export interface FervidexStaticScore {
	clear_type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
	ex_score: integer;
	miss_count: integer | null; // bp, not cbrk
	chart: `${"sp" | "dp"}${"b" | "n" | "h" | "a" | "l"}`;
	song_id: integer;
}

export interface FervidexStaticContext {
	version: GPTSupportedVersions["iidx:SP" | "iidx:DP"];
}
