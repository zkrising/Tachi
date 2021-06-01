import { integer } from "kamaitachi-common";

export interface ARCJubeatScore {
    chart_id: string;
    clear_type: "FULL_COMBO" | "CLEAR" | "FAIL" | "EXC";
    score: integer;
    timestamp: string;
}
