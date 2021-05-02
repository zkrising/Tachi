"use strict";
// Classes refer to things like dans.
// Not the JS construct.
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultGameClasses = exports.gameClassValues = void 0;
const __internalIIDXDans = {
    kaiden: {
        display: "皆伝",
        mouseover: "Kaiden",
        index: 18,
    },
    chuuden: {
        display: "中伝",
        mouseover: "Chuuden",
        index: 17,
    },
    10: {
        display: "十段",
        mouseover: "10th Dan",
        index: 16,
    },
    9: {
        display: "九段",
        mouseover: "9th Dan",
        index: 15,
    },
    8: {
        display: "八段",
        mouseover: "8th Dan",
        index: 14,
    },
    7: {
        display: "七段",
        mouseover: "7th Dan",
        index: 13,
    },
    6: {
        display: "六段",
        mouseover: "6th Dan",
        index: 12,
    },
    5: {
        display: "五段",
        mouseover: "5th Dan",
        index: 11,
    },
    4: {
        display: "四段",
        mouseover: "4th Dan",
        index: 10,
    },
    3: {
        display: "三段",
        mouseover: "3rd Dan",
        index: 9,
    },
    2: {
        display: "二段",
        mouseover: "2nd Dan",
        index: 8,
    },
    1: {
        display: "初段",
        mouseover: "1st Dan",
        index: 7,
    },
    "1kyu": {
        display: "一級",
        mouseover: "1st Kyu",
        index: 6,
    },
    "2kyu": {
        display: "二級",
        mouseover: "2nd Kyu",
        index: 5,
    },
    "3kyu": {
        display: "三級",
        mouseover: "3rd Kyu",
        index: 4,
    },
    "4kyu": {
        display: "四級",
        mouseover: "4th Kyu",
        index: 3,
    },
    "5kyu": {
        display: "五級",
        mouseover: "5th Kyu",
        index: 2,
    },
    "6kyu": {
        display: "六級",
        mouseover: "6th Kyu",
        index: 1,
    },
    "7kyu": {
        display: "七級",
        mouseover: "7th Kyu",
        index: 0,
    },
};
const __internalSDVXDans = {
    inf: {
        display: "LV.∞",
        mouseover: "Inf. Dan",
        index: 12,
    },
    11: {
        display: "LV.11",
        mouseover: "11th Dan",
        index: 11,
    },
    10: {
        display: "LV.10",
        mouseover: "10th Dan",
        index: 10,
    },
    9: {
        display: "LV.09",
        mouseover: "9th Dan",
        index: 9,
    },
    8: {
        display: "LV.08",
        mouseover: "8th Dan",
        index: 8,
    },
    7: {
        display: "LV.07",
        mouseover: "7th Dan",
        index: 7,
    },
    6: {
        display: "LV.06",
        mouseover: "6th Dan",
        index: 6,
    },
    5: {
        display: "LV.05",
        mouseover: "5th Dan",
        index: 5,
    },
    4: {
        display: "LV.04",
        mouseover: "4th Dan",
        index: 4,
    },
    3: {
        display: "LV.03",
        mouseover: "3rd Dan",
        index: 3,
    },
    2: {
        display: "LV.02",
        mouseover: "2nd Dan",
        index: 2,
    },
    1: {
        display: "LV.01",
        mouseover: "1st Dan",
        index: 1,
    },
};
// unimplemented
const __internalDDRDans = {};
const __internalGitadoraColours = {
    rainbow: {
        display: "虹",
        mouseover: "Rainbow",
        index: 16,
    },
    gold: {
        display: "金",
        mouseover: "Gold",
        index: 15,
    },
    silver: {
        display: "銀",
        mouseover: "Silver",
        index: 14,
    },
    bronze: {
        display: "銅",
        mouseover: "Bronze",
        index: 13,
    },
    redgradient: {
        display: "赤グラ",
        mouseover: "Red Gradient",
        index: 12,
    },
    red: {
        display: "赤",
        mouseover: "Red",
        index: 11,
    },
    purplegradient: {
        display: "紫グラ",
        mouseover: "Purple Gradient",
        index: 10,
    },
    purple: {
        display: "紫",
        mouseover: "Purple",
        index: 9,
    },
    bluegradient: {
        display: "青グラ",
        mouseover: "Blue Gradient",
        index: 8,
    },
    blue: {
        display: "青",
        mouseover: "Blue",
        index: 7,
    },
    greengradient: {
        display: "緑グラ",
        mouseover: "Green Gradient",
        index: 6,
    },
    green: {
        display: "緑",
        mouseover: "Green",
        index: 5,
    },
    yellowgradient: {
        display: "黄グラ",
        mouseover: "Yellow Gradient",
        index: 4,
    },
    yellow: {
        display: "黄",
        mouseover: "Yellow",
        index: 3,
    },
    orangegradient: {
        display: "橙グラ",
        mouseover: "Orange Gradient",
        index: 2,
    },
    orange: {
        display: "橙",
        mouseover: "Orange",
        index: 1,
    },
    white: {
        display: "白",
        mouseover: "White",
        index: 0,
    },
};
const __internalGenocideDans = {
    overjoy: {
        display: "(^^)",
        mouseover: "Overjoy",
        index: 22,
    },
    kaiden: {
        display: "★★",
        mouseover: "Insane Kaiden",
        index: 21,
    },
    10: {
        display: "★10",
        mouseover: "Insane 10th Dan",
        index: 20,
    },
    9: {
        display: "★9",
        mouseover: "Insane 9th Dan",
        index: 19,
    },
    8: {
        display: "★8",
        mouseover: "Insane 8th Dan",
        index: 18,
    },
    7: {
        display: "★7",
        mouseover: "Insane 7th Dan",
        index: 17,
    },
    6: {
        display: "★6",
        mouseover: "Insane 6th Dan",
        index: 16,
    },
    5: {
        display: "★5",
        mouseover: "Insane 5th Dan",
        index: 15,
    },
    4: {
        display: "★4",
        mouseover: "Insane 4th Dan",
        index: 14,
    },
    3: {
        display: "★3",
        mouseover: "Insane 3rd Dan",
        index: 13,
    },
    2: {
        display: "★2",
        mouseover: "Insane 2nd Dan",
        index: 12,
    },
    1: {
        display: "★1",
        mouseover: "Insane 1st Dan",
        index: 11,
    },
    normal10: {
        display: "☆10",
        mouseover: "Normal 10th Dan",
        index: 10,
    },
    normal9: {
        display: "☆9",
        mouseover: "Normal 9th Dan",
        index: 9,
    },
    normal8: {
        display: "☆8",
        mouseover: "Normal 8th Dan",
        index: 8,
    },
    normal7: {
        display: "☆7",
        mouseover: "Normal 7th Dan",
        index: 7,
    },
    normal6: {
        display: "☆6",
        mouseover: "Normal 6th Dan",
        index: 6,
    },
    normal5: {
        display: "☆5",
        mouseover: "Normal 5th Dan",
        index: 5,
    },
    normal4: {
        display: "☆4",
        mouseover: "Normal 4th Dan",
        index: 4,
    },
    normal3: {
        display: "☆3",
        mouseover: "Normal 3rd Dan",
        index: 3,
    },
    normal2: {
        display: "☆2",
        mouseover: "Normal 2nd Dan",
        index: 2,
    },
    normal1: {
        display: "☆1",
        mouseover: "Normal 1st Dan",
        index: 1,
    },
};
const __internalStellaDans = {
    st11: {
        display: "st11",
        mouseover: "Stella Skill Simulator st11",
        index: 24,
    },
    st10: {
        display: "st10",
        mouseover: "Stella Skill Simulator st10",
        index: 23,
    },
    st9: {
        display: "st9",
        mouseover: "Stella Skill Simulator st9",
        index: 22,
    },
    st8: {
        display: "st8",
        mouseover: "Stella Skill Simulator st8",
        index: 21,
    },
    st7: {
        display: "st7",
        mouseover: "Stella Skill Simulator st7",
        index: 20,
    },
    st6: {
        display: "st6",
        mouseover: "Stella Skill Simulator st6",
        index: 19,
    },
    st5: {
        display: "st5",
        mouseover: "Stella Skill Simulator st5",
        index: 18,
    },
    st4: {
        display: "st4",
        mouseover: "Stella Skill Simulator st4",
        index: 17,
    },
    st3: {
        display: "st3",
        mouseover: "Stella Skill Simulator st3",
        index: 16,
    },
    st2: {
        display: "st2",
        mouseover: "Stella Skill Simulator st2",
        index: 15,
    },
    st1: {
        display: "st1",
        mouseover: "Stella Skill Simulator st1",
        index: 14,
    },
    st0: {
        display: "st0",
        mouseover: "Stella Skill Simulator st0",
        index: 13,
    },
    sl12: {
        display: "sl12",
        mouseover: "Satellite Skill Simulator sl12",
        index: 12,
    },
    sl11: {
        display: "sl11",
        mouseover: "Satellite Skill Simulator sl11",
        index: 11,
    },
    sl10: {
        display: "sl10",
        mouseover: "Satellite Skill Simulator sl10",
        index: 10,
    },
    sl9: {
        display: "sl9",
        mouseover: "Satellite Skill Simulator sl9",
        index: 9,
    },
    sl8: {
        display: "sl8",
        mouseover: "Satellite Skill Simulator sl8",
        index: 8,
    },
    sl7: {
        display: "sl7",
        mouseover: "Satellite Skill Simulator sl7",
        index: 7,
    },
    sl6: {
        display: "sl6",
        mouseover: "Satellite Skill Simulator sl6",
        index: 6,
    },
    sl5: {
        display: "sl5",
        mouseover: "Satellite Skill Simulator sl5",
        index: 5,
    },
    sl4: {
        display: "sl4",
        mouseover: "Satellite Skill Simulator sl4",
        index: 4,
    },
    sl3: {
        display: "sl3",
        mouseover: "Satellite Skill Simulator sl3",
        index: 3,
    },
    sl2: {
        display: "sl2",
        mouseover: "Satellite Skill Simulator sl2",
        index: 2,
    },
    sl1: {
        display: "sl1",
        mouseover: "Satellite Skill Simulator sl1",
        index: 1,
    },
    sl0: {
        display: "sl0",
        mouseover: "Satellite Skill Simulator sl0",
        index: 0,
    },
};
exports.gameClassValues = {
    iidx: {
        SP: {
            dan: __internalIIDXDans,
        },
        DP: {
            dan: __internalIIDXDans,
        },
    },
    ddr: {
        SP: {
            dan: __internalDDRDans,
        },
        DP: {
            dan: __internalDDRDans,
        },
    },
    sdvx: {
        Single: {
            dan: __internalSDVXDans,
        },
    },
    popn: {
        "9B": {},
    },
    museca: {
        Single: {},
    },
    jubeat: {
        Single: {},
    },
    bms: {
        "7K": {
            genocideDan: __internalGenocideDans,
            stDan: __internalStellaDans,
        },
        "14K": {},
    },
    chunithm: {
        Single: {},
    },
    gitadora: {
        Gita: {
            skillColour: __internalGitadoraColours,
        },
        Dora: {
            skillColour: __internalGitadoraColours,
        },
    },
    maimai: {
        Single: {},
    },
    usc: {
        Single: {},
    },
};
exports.defaultGameClasses = {
    iidx: {
        SP: "dan",
        DP: "dan",
    },
    ddr: {
        SP: "dan",
        DP: "dan",
    },
    gitadora: {
        Gita: "skillColour",
        Dora: "skillColour",
    },
    popn: {},
    sdvx: {
        Single: "dan",
    },
    museca: {},
    jubeat: {
        Single: "jubilityColour",
    },
    bms: {
        "7K": "genocideDan",
    },
    chunithm: {},
    maimai: {},
    usc: {},
};
//# sourceMappingURL=game-classes.js.map