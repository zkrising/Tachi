import { IDStrings, integer } from "./types";
export interface ClassInfo {
    display: string;
    mouseover?: string;
    css?: {
        backgroundColor: string;
        color: string;
    };
    variant?: "primary" | "secondary" | "success" | "warning" | "danger";
}
export declare const IIDXDans: ClassInfo[];
export declare const GitadoraColours: ClassInfo[];
export declare const BMSGenocideDans: ClassInfo[];
export declare const BMSStSlDans: ClassInfo[];
export declare const SDVXDans: ClassInfo[];
export declare const SDVXVFClasses: ClassInfo[];
export declare const DDRDans: ({
    display: string;
    mouseover: string;
    css: {
        backgroundColor: string;
        color: string;
    };
} | {
    display: string;
    mouseover: string;
    variant: "warning" | "primary" | "secondary" | "success" | "danger";
})[];
export interface GameClassSets {
    "iidx:SP": "dan";
    "iidx:DP": "dan";
    "popn:9B": never;
    "sdvx:Single": "dan" | "vfClass";
    "usc:Single": never;
    "ddr:SP": "dan";
    "ddr:DP": "dan";
    "maimai:Single": never;
    "jubeat:Single": "colour";
    "museca:Single": never;
    "bms:7K": "genocideDan" | "stslDan";
    "bms:14K": "genocideDan";
    "chunithm:Single": never;
    "gitadora:Gita": "colour";
    "gitadora:Dora": "colour";
}
export declare type AllClassSets = GameClassSets[IDStrings];
export declare type GameClasses<I extends IDStrings> = {
    [K in GameClassSets[I]]: integer;
};
