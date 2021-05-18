import { integer } from "kamaitachi-common";

export interface S3Score {
    id: integer;
    diff: 5 | "L7" | 7 | "A" | "B" | "L14" | 14 | "A14" | "B14";
    songname: string;
    exscore: integer;
    styles: string;
    scorebreakdown: {
        justgreats: integer;
        greats: integer;
        good: integer;
        bad: integer;
        poor: integer;
    };
    mods: {
        hardeasy?: "H" | "E";
    };
    cleartype: "cleared" | "played" | "combo" | "comboed" | "perfect" | "perfected";
    date: string;
    comment?: string;
}
