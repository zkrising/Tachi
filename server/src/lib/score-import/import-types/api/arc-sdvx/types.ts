import type { integer } from "tachi-common";

export interface ARCSDVXScore {
	chart_id: string;
	score: integer;
	lamp: "CLEAR" | "HC" | "PLAY" | "PUC" | "UC";
	btn_rate: number;
	long_rate: number;
	vol_rate: number;
	critical: integer;
	near: integer;
	error: integer;
	max_chain: integer;
	timestamp: string;
}
