import { integer } from "kamaitachi-common";

export interface FervidexStaticScore {
    clear_type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    ex_score: integer;
    miss_count: integer; // bp, not cbrk
    chart: string;
    song_id: integer;
}

export interface FervidexStaticContext {
    version: string;
}
