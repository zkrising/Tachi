import { integer } from "kamaitachi-common";

export interface KaiIIDXScore {
    music_id: integer;
    play_style: "SINGLE" | "DOUBLE";
    difficulty: "BEGINNER" | "NORMAL" | "HYPER" | "ANOTHER" | "LEGGENDARIA";
    version_played: integer;
    lamp: string;
    ex_score: integer;
    miss_count: integer; // -1 => null
    fast_count: integer;
    slow_count: integer;
    timestamp: string;
}

export interface KaiSDVXScore {
    music_id: integer;
    music_difficulty: 0 | 1 | 2 | 3 | 4;
    played_version: integer;
    clear_type: 0 | 1 | 2 | 3 | 4; // hm
    score: integer;
    max_chain: integer;
    critical: integer;
    near: integer;
    error: integer;
    early: integer;
    late: integer;
    gauge_type: 0 | 1 | 2 | 3;
    gauge_rate: integer;
    timestamp: string;
}

export interface KaiContext {
    service: "FLO" | "EAG";
}
