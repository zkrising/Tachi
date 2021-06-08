import { integer } from "tachi-common";

export interface FervidexScore {
    chart: `${"sp" | "dp"}${"b" | "n" | "h" | "a" | "l"}`;

    entry_id: integer;
    chart_sha256: string;
    // whether or whether not this chart is from 2dxtra
    custom: boolean;

    pgreat: integer;
    great: integer;
    good: integer;
    bad: integer;
    poor: integer;

    slow: integer;
    fast: integer;
    max_combo: integer;
    combo_break: integer;

    ex_score: integer;
    clear_type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

    gauge: [integer];
    ghost: [integer];

    dead?: {
        measure?: integer | null;
        note?: integer | null;
    };

    option: {
        gauge?: "ASSISTED_EASY" | "EASY" | "HARD" | "EX_HARD" | null;
        range?:
            | "SUDDEN_PLUS"
            | "HIDDEN_PLUS"
            | "SUD_PLUS_HID_PLUS"
            | "LIFT"
            | "LIFT_SUD_PLUS"
            | null;
        style?: "RANDOM" | "R_RANDOM" | "S_RANDOM" | "MIRROR" | null;
        assist?: "AUTO_SCRATCH" | "LEGACY_NOTE" | "ASCR_LEGACY" | "FULL_ASSIST" | null;
    };

    pacemaker: {
        name?: string | null;
        score?: integer | null;
        type?: string | null; // too lazy to type this and we dont use it.
    };

    "2dx-gsm"?: {
        EASY: (number | null)[];
        NORMAL: (number | null)[];
        HARD: (number | null)[];
        EX_HARD: (number | null)[];
    } | null;
}

export interface FervidexContext {
    version: string;
}
