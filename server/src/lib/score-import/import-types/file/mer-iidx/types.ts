import { integer } from "kamaitachi-common";

export interface MerScore {
    music_id: integer;
    play_type: "SINGLE" | "DOUBLE";
    diff_type: "BEGINNER" | "NORMAL" | "HYPER" | "ANOTHER" | "LEGGENDARIA";
    score: integer;
    miss_count: integer;
    clear_type:
        | "NO PLAY"
        | "FAILED"
        | "ASSIST CLEAR"
        | "EASY CLEAR"
        | "CLEAR"
        | "HARD CLEAR"
        | "EX HARD CLEAR"
        | "FULLCOMBO CLEAR";
    update_time: string;
}
