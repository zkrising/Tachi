import { GPTSupportedVersions } from "tachi-common";

export interface EamusementScoreData {
	difficulty: "BEGINNER" | "NORMAL" | "HYPER" | "ANOTHER" | "LEGGENDARIA";
	lamp: string;
	exscore: string;
	pgreat: string;
	great: string;
	bp: string;
	level: string;
}

type BaseProps = {
	title: string;
	timestamp: string;
};

export type IIDXEamusementCSVData = {
	score: EamusementScoreData;
} & BaseProps;

type Props = "exscore" | "lamp" | "pgreat" | "great" | "bp" | "level";

type RawPropKeys = `${"beginner" | "normal" | "hyper" | "another" | "leggendaria"}-${Props}`;

export type RawIIDXEamusementCSVData = {
	[K in RawPropKeys]: unknown;
} &
	BaseProps & { [index: string]: unknown };

export interface IIDXEamusementCSVContext {
	playtype: "SP" | "DP";
	importVersion: GPTSupportedVersions["iidx:SP" | "iidx:DP"];
	hasBeginnerAndLegg: boolean;
	service: string;
}
