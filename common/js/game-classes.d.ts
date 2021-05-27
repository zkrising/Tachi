import { IDStrings, integer } from "./types";
export interface ClassInfo {
    display: string;
    mouseover: string;
}
export declare const IIDXDans: ClassInfo[];
export declare const GitadoraColours: ClassInfo[];
export declare const BMSGenocideDans: ClassInfo[];
export declare const BMSStSlDans: ClassInfo[];
export declare const SDVXDans: ClassInfo[];
export interface GameClassSets {
    "iidx:SP": "dan";
    "iidx:DP": "dan";
    "popn:9B": never;
    "sdvx:Single": "dan" | "badge";
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
export declare type GameClasses<I extends IDStrings> = {
    [K in GameClassSets[I]]: integer;
};
