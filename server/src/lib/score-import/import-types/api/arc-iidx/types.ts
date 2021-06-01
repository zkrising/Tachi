import { integer } from "kamaitachi-common";

export interface ARCIIDXScore {
    chart_id: string;
    lamp:
        | "NO_PLAY"
        | "FAILED"
        | "ASSIST_CLEAR"
        | "EASY_CLEAR"
        | "CLEAR"
        | "HARD_CLEAR"
        | "EX_HARD_CLEAR"
        | "FULL_COMBO";
    ex_score: integer;
    miss_count: integer | null;
    timestamp: string;
}
