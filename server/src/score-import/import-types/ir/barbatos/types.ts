import { integer } from "kamaitachi-common";

export interface BarbatosScore {
    difficulty: 0 | 1 | 2 | 3 | 4;
    level: integer;
    song_id: integer;
    max_chain: integer;
    critical: integer;
    near_total: integer;
    near_fast: integer;
    near_slow: integer;
    score: integer;
    error: integer;
    percent: number;
    did_fail: boolean;
    clear_type: 1 | 2 | 3 | 4 | 5;
    gauge_type: 1 | 2;
    is_skill_analyser: boolean;
}
