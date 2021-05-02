import { Game, integer, Playtypes } from "./types";
export declare type ClassData = Record<string, ClassInfo>;
export interface ClassInfo {
    display: string;
    mouseover: string;
    index: integer;
}
declare type GameClasses = {
    [G in Game]: {
        [P in Playtypes[G]]: Record<string, ClassData>;
    };
};
export declare const gameClassValues: GameClasses;
export declare const defaultGameClasses: {
    iidx: {
        SP: string;
        DP: string;
    };
    ddr: {
        SP: string;
        DP: string;
    };
    gitadora: {
        Gita: string;
        Dora: string;
    };
    popn: {};
    sdvx: {
        Single: string;
    };
    museca: {};
    jubeat: {
        Single: string;
    };
    bms: {
        "7K": string;
    };
    chunithm: {};
    maimai: {};
    usc: {};
};
export {};
