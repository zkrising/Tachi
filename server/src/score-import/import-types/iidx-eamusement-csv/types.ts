import { integer } from "kamaitachi-common";

export interface EamusementScoreData {
    difficulty: "BEGINNER" | "NORMAL" | "HYPER" | "ANOTHER" | "LEGGENDARIA";
    lamp: string;
    exscore: integer;
    pgreat: integer;
    great: integer;
    bp: integer | "---"; // lol
    level: integer;
}

type BaseProps = {
    version: string;
    title: string;
    genre: string;
    artist: string;
    playcount: number;
    timestamp: string;
};

export type IIDXEamusementCSVData = {
    scores: EamusementScoreData[];
} & BaseProps;

export interface IIDXEamusementCSVContext {
    playtype: "SP" | "DP";
    importVersion: integer;
    hasBeginnerAndLegg: boolean;
    serviceOrigin: string;
}
