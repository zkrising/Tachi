import { integer } from "kamaitachi-common";

export interface FervidexScore {
    chart: `${"sp" | "dp"}${"b" | "n" | "h" | "a" | "l"}`;

    entry_id: integer;

    pgreat: integer;
    great: integer;
    good: integer;
    bad: integer;
    poor: integer;

    slow: integer;
    fast: integer;
    max_combo: integer;

    ex_score: integer;
    clear_type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

    gauge: [integer];

    dead: {
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
        style?: "RANDOM" | "R_RANDOM" | "S_RANDOM" | "MIRROR";
        assist?: "AUTO_SCRATCH" | "LEGACY_NOTE" | "ASCR_LEGACY" | "FULL_ASSIST";
    };

    pacemaker: {
        name?: string | null;
        score?: integer | null;
        type?: string | null; // too lazy to type this and we dont use it.
    };
}
