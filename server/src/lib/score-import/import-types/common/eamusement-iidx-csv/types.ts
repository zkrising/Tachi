import type { GPTSupportedVersions } from "tachi-common";

export interface EamusementScoreData {
	difficulty: "ANOTHER" | "BEGINNER" | "HYPER" | "LEGGENDARIA" | "NORMAL";
	lamp: string;
	exscore: string;
	pgreat: string;
	great: string;
	bp: string;
	level: string;
}

interface BaseProps {
	title: string;
	timestamp: string;
}

export type IIDXEamusementCSVData = BaseProps & {
	score: EamusementScoreData;
};

type Props = "bp" | "exscore" | "great" | "lamp" | "level" | "pgreat";

type RawPropKeys = `${"another" | "beginner" | "hyper" | "leggendaria" | "normal"}-${Props}`;

export type RawIIDXEamusementCSVData = BaseProps &
	Record<string, unknown> & {
		[K in RawPropKeys]: unknown;
	};

export interface IIDXEamusementCSVContext {
	playtype: "DP" | "SP";
	importVersion: GPTSupportedVersions["iidx:DP" | "iidx:SP"];
	hasBeginnerAndLegg: boolean;
	service: string;
}
