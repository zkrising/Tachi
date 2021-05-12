"use strict";
// Hi, Just so you know, this code is not representative of the internal site code.
// This has been added to over the course of around 10 months at the time of writing, and is the source
// of some of my first javascript code.
// It's,, alright, but I like the versatility it brings.
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamePercentMax = exports.FormatDifficulty = exports.PercentToScore = exports.CalculateScore = exports.AbsoluteScoreGradeDelta = exports.ScoreGradeDelta = exports.supportsESD = exports.DirectScoreGradeDelta = exports.ratingParameters = exports.gameChartIndicators = exports.judgeColours = exports.lampColours = exports.gradeColours = exports.COLOUR_SET = exports.judgementWindows = exports.clearGrade = exports.clearLamp = exports.lamps = exports.expChartScale = exports.boundaryHCF = exports.gradeBoundaries = exports.grades = exports.validPlaytypes = exports.humaniseGame = exports.defaultDifficulty = exports.defaultPlaytype = exports.gameOrders = exports.versionHuman = exports.gameHuman = exports.gameRelevantScoreBucket = exports.gameColours = exports.validScoreMeta = exports.validHitMeta = exports.BASE_VALID_HIT_META = exports.validHitData = exports.folderTables = exports.defaultTable = exports.validDifficulties = exports.gameSpecificCalcDescriptions = exports.gameSpecificCalc = exports.supportedGames = exports.importTypes = exports.fileImportTypes = void 0;
exports.fileImportTypes = [
    "file/csv:eamusement-iidx",
    "file/json:batch-manual",
];
exports.importTypes = [...exports.fileImportTypes];
exports.supportedGames = [
    "iidx",
    "museca",
    "maimai",
    "jubeat",
    "popn",
    "sdvx",
    "ddr",
    "bms",
    "chunithm",
    "gitadora",
    "usc",
];
exports.gameSpecificCalc = {
    iidx: {
        SP: ["BPI", "K%"],
        DP: ["BPI"],
    },
    sdvx: {
        Single: ["VF4", "VF5"],
    },
    ddr: {
        SP: ["MFCP"],
        DP: ["MFCP"],
    },
    usc: {
        Single: ["VF4", "VF5"],
    },
};
exports.gameSpecificCalcDescriptions = {
    iidx: {
        SP: {
            BPI: "Beat Power Index: How good a score is relative to Kaiden Average (BPI 0) and the World Record (BPI 100).",
            "K%": "Kaiden Percentile: How many Kaidens you're ahead of on a given chart.",
        },
        DP: {
            BPI: "Beat Power Index: How good a score is relative to Kaiden Average (BPI 0) and the World Record (BPI 100).",
        },
    },
    sdvx: {
        Single: {
            VF4: "VOLFORCE as calculated in SOUND VOLTEX IV: HEAVENLY HAVEN.",
            VF5: "VOLFORCE as calculated in SOUND VOLTEX V: VIVID WAVE.",
        },
    },
    ddr: {
        SP: {
            MFCP: "MFC Points as described in LIFE4.",
        },
        DP: {
            MFCP: "MFC Points as described in LIFE4.",
        },
    },
    usc: {
        Single: {
            VF4: "VOLFORCE as calculated in SOUND VOLTEX IV: HEAVENLY HAVEN.",
            VF5: "VOLFORCE as calculated in SOUND VOLTEX V: VIVID WAVE.",
        },
    },
};
exports.validDifficulties = {
    iidx: ["BEGINNER", "NORMAL", "HYPER", "ANOTHER", "LEGGENDARIA"],
    museca: ["Green", "Yellow", "Red"],
    maimai: ["Easy", "Basic", "Advanced", "Expert", "Master", "Re:Master"],
    jubeat: ["BSC", "ADV", "EXT"],
    popn: ["Easy", "Normal", "Hyper", "EX"],
    sdvx: ["NOV", "ADV", "EXH", "MXM", "INF", "GRV", "HVN", "VVD"],
    ddr: ["BEGINNER", "BASIC", "DIFFICULT", "EXPERT", "CHALLENGE"],
    bms: ["BEGINNER", "NORMAL", "HYPER", "ANOTHER", "INSANE", "CUSTOM"],
    chunithm: ["BASIC", "ADVANCED", "EXPERT", "MASTER", "WORLD'S END"],
    gitadora: [
        "BASIC",
        "ADVANCED",
        "EXTREME",
        "MASTER",
        "BASS BASIC",
        "BASS ADVANCED",
        "BASS EXTREME",
        "BASS MASTER",
    ],
    usc: ["NOV", "ADV", "EXH", "INF"],
};
exports.defaultTable = {
    iidx: "Levels (N-1)",
    bms: "Insane",
    museca: "Levels",
    jubeat: "Levels",
    popn: "Levels",
    sdvx: "Levels",
    ddr: "Levels",
    chunithm: "Levels",
    gitadora: "Levels",
    usc: "Levels",
    maimai: "Levels",
};
exports.folderTables = {
    iidx: ["Levels", "Levels (Omnimix)", "Levels (N-1)", "Levels (N-1 Omnimix)", "Versions"],
    bms: ["Normal", "Insane", "Overjoy", "Satellite", "Stella", "Insane 2", "Joverjoy"],
    museca: ["Levels", "Versions"],
    jubeat: ["Levels", "Versions"],
    popn: ["Levels", "Versions"],
    sdvx: ["Levels", "Versions"],
    ddr: ["Levels", "Versions"],
    chunithm: ["Levels", "Levels (Omnimix)", "Versions"],
    gitadora: ["Levels", "Versions"],
    usc: ["Levels", "Versions"],
    maimai: ["Levels", "Versions"],
};
exports.validHitData = {
    iidx: ["pgreat", "great", "good", "bad", "poor"],
    bms: ["pgreat", "great", "good", "bad", "poor"],
    museca: ["critical", "near", "miss"],
    ddr: ["marvelous", "perfect", "great", "good", "boo", "miss", "ok", "ng"],
    sdvx: ["critical", "near", "miss"],
    popn: ["cool", "great", "good", "bad"],
    maimai: ["perfect", "great", "good", "miss"],
    jubeat: ["perfect", "great", "good", "bad", "miss"],
    chunithm: ["jcrit", "justice", "attack", "miss"],
    gitadora: ["perfect", "great", "good", "ok", "miss"],
    usc: ["critical", "near", "miss"],
};
exports.BASE_VALID_HIT_META = ["fast", "slow", "maxCombo"];
exports.validHitMeta = {
    iidx: ["bp", "gauge", "gaugeHistory", "comboBreak", ...exports.BASE_VALID_HIT_META],
    museca: exports.BASE_VALID_HIT_META,
    ddr: exports.BASE_VALID_HIT_META,
    maimai: exports.BASE_VALID_HIT_META,
    jubeat: exports.BASE_VALID_HIT_META,
    popn: ["gauge", ...exports.BASE_VALID_HIT_META],
    sdvx: ["gauge", ...exports.BASE_VALID_HIT_META],
    bms: [
        "bp",
        "gauge",
        "lbd",
        "ebd",
        "lpr",
        "epr",
        "lgd",
        "egd",
        "lgr",
        "egr",
        "lpg",
        "epg",
        "diedAt",
        ...exports.BASE_VALID_HIT_META,
    ],
    chunithm: [...exports.BASE_VALID_HIT_META],
    gitadora: [...exports.BASE_VALID_HIT_META],
    usc: ["gauge", ...exports.BASE_VALID_HIT_META],
};
exports.validScoreMeta = {
    iidx: {
        random: ["NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR"],
        assist: ["NO ASSIST", "AUTO SCRATCH", "LEGACY NOTE", "ASCR + LEGACY"],
        range: ["NONE", "SUDDEN+", "HIDDEN+", "SUD+ HID+", "LIFT", "LIFT SUD+"],
        gauge: ["ASSISTED EASY", "EASY", "HARD", "EX HARD"],
        pacemaker: [
            "NO GRAPH",
            "MY BEST",
            "RIVAL 1",
            "RIVAL 2",
            "RIVAL 3",
            "RIVAL 4",
            "RIVAL 5",
            "RIVAL NEXT",
            "RIVAL BEST",
            "RIVAL AVERAGE",
            "NATIONAL BEST",
            "NATIONAL AVERAGE",
            "PREFECTURE BEST",
            "PREFECTURE AVERAGE",
            "CLASS BEST",
            "CLASS AVERAGE",
            "VENUE BEST",
            "VENUE NEXT",
            "PREVIOUS GHOST",
            "PACEMAKER AAA",
            "PACEMAKER AA",
            "PACEMAKER A",
            "PACEMAKER" /* ??? */,
            "PACEMAKER NEXT",
            "PACEMAKER NEXT+",
            "PLAYER 1",
            "PLAYER 2",
        ],
        pacemakerName: "string",
        pacemakerTarget: "integer",
        deadMeasure: "integer",
        deadNote: "integer",
    },
    museca: {},
    ddr: {},
    maimai: {},
    jubeat: {},
    popn: {},
    sdvx: {},
    bms: {},
    chunithm: {},
    gitadora: {},
    usc: {
        noteMod: ["NORMAL", "MIRROR", "RANDOM", "MIR-RAN"],
        gaugeMod: ["NORMAL", "HARD"],
    },
};
exports.gameColours = {
    iidx: "#E7BDB3",
    museca: "#C9A4A0",
    maimai: "#AE8094",
    sdvx: "#D6B7B1",
    ddr: "#CC5079",
    gitadora: "#CA9CA9",
    // gfdm: "#DA836E",
    jubeat: "#129A7D",
    popn: "#F39CA4",
    bms: "#B5DCCD",
    chunithm: "#AE8094",
    usc: "#D6B7B1", // TODO
};
exports.gameRelevantScoreBucket = {
    iidx: "lamp",
    museca: "grade",
    maimai: "grade",
    sdvx: "grade",
    ddr: "lamp",
    gitadora: "grade",
    // gfdm: "grade",
    jubeat: "grade",
    popn: "grade",
    bms: "lamp",
    chunithm: "grade",
    usc: "grade",
};
// human readable stuff for games
exports.gameHuman = {
    iidx: "beatmania IIDX",
    museca: "MÚSECA",
    maimai: "maimai",
    sdvx: "SOUND VOLTEX",
    ddr: "DDR",
    gitadora: "GITADORA",
    jubeat: "jubeat",
    popn: "pop'n music",
    bms: "BMS",
    chunithm: "CHUNITHM",
    usc: "unnamed sdvx clone",
};
// human readable stuff for versions
exports.versionHuman = {
    iidx: {
        0: "1st Style",
        1: "substream",
        2: "2nd Style",
        3: "3rd Style",
        4: "4th Style",
        5: "5th Style",
        6: "6th Style",
        7: "7th Style",
        8: "8th Style",
        9: "9th Style",
        10: "10th Style",
        11: "IIDX RED",
        12: "HAPPY SKY",
        13: "DISTORTED",
        14: "GOLD",
        15: "DJ TROOPERS",
        16: "EMPRESS",
        17: "SIRIUS",
        18: "Resort Anthem",
        19: "Lincle",
        20: "tricoro",
        21: "SPADA",
        22: "PENDUAL",
        23: "copula",
        24: "SINOBUZ",
        25: "CANNON BALLERS",
        26: "ROOTAGE",
        27: "HEROIC VERSE",
        28: "BISTROVER",
    },
    museca: {
        1: "",
        1.5: "1+1/2",
    },
    maimai: {
        maimai: "",
        maimaiplus: "PLUS",
        green: "GReeN",
        greenplus: "GReeN PLUS",
        orange: "ORANGE",
        orangeplus: "ORANGE PLUS",
        pink: "PiNK",
        pinkplus: "PiNK PLUS",
        murasaki: "MURASAKi",
        murasakiplus: "MURASAKi PLUS",
        milk: "MiLK",
        milkplus: "MiLK PLUS",
        finale: "FiNALE",
    },
    jubeat: {
        jubeat: "",
        ripples: "ripples",
        knit: "knit",
        copious: "copious",
        saucer: "saucer",
        saucerfulfill: "saucer fulfill",
        prop: "prop",
        qubell: "Qubell",
        clan: "clan",
        festo: "festo",
    },
    popn: {
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        7: "7",
        8: "8",
        9: "9",
        10: "10",
        11: "11",
        12: "12 Iroha",
        13: "13 CARNIVAL",
        14: "14 FEVER!",
        15: "15 ADVENTURE",
        16: "16 PARTY♪",
        17: "17 THE MOVIE",
        18: "18 Sengoku",
        19: "19 TUNE STREET",
        20: "20 fantasia",
        park: "Sunny Park",
        lapis: "Lapistoria",
        eclale: "éclale",
        usaneko: "Usaneko",
        peace: "peace",
    },
    sdvx: {
        booth: "BOOTH",
        inf: "II -infinite infection-",
        gw: "III GRAVITY WARS",
        heaven: "IV HEAVENLY HAVEN",
        vivid: "V VIVID WAVE",
    },
    ddr: {
        1: "1st Mix",
        2: "2nd Mix",
        3: "3rd Mix",
        4: "4th Mix",
        5: "5th Mix",
        max: "MAX",
        max2: "MAX2",
        extreme: "EXTREME",
        snova: "SuperNOVA",
        snova2: "SuperNOVA 2",
        x: "X",
        x2: "X2",
        x3: "X3 vs. 2nd Mix",
        2013: "(2013)",
        2014: "(2014)",
        a: "Ace",
        a20: "A20",
    },
    chunithm: {
        chuni: "",
        chuniplus: "PLUS",
        air: "AIR",
        airplus: "AIR PLUS",
        star: "STAR",
        starplus: "STAR PLUS",
        amazon: "AMAZON",
        amazonplus: "AMAZON PLUS",
        crystal: "CRYSTAL",
        crystalplus: "CRYSTAL PLUS",
    },
    gitadora: {
        xg: "XG",
        xg2: "XG2",
        xg3: "XG3",
        gitadora: "",
        overdrive: "OverDrive",
        triboost: "Tri-Boost",
        triboostplus: "Tri-Boost (Re:EVOLVE)",
        matixx: "Matixx",
        exchain: "EXCHAIN",
        nextage: "NEX+AGE",
    },
    bms: {
        0: "BMS",
    },
    usc: {
        0: "USC",
    },
};
// release orders of the games.
exports.gameOrders = {
    iidx: [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
    ],
    museca: ["1", "1.5"],
    maimai: [
        "maimai",
        "maimaiplus",
        "green",
        "greenplus",
        "orange",
        "orangeplus",
        "pink",
        "pinkplus",
        "murasaki",
        "murasakiplus",
        "milk",
        "milkplus",
        "finale",
    ],
    jubeat: [
        "jubeat",
        "ripples",
        "knit",
        "copious",
        "saucer",
        "saucerfulfill",
        "prop",
        "qubell",
        "clan",
        "festo",
    ],
    popn: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "park",
        "lapis",
        "eclale",
        "usaneko",
        "peace",
    ],
    sdvx: ["booth", "inf", "gw", "heaven", "vivid"],
    ddr: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "max",
        "max2",
        "extreme",
        "snova",
        "snova2",
        "x",
        "x2",
        "x3",
        "2013",
        "2014",
        "a",
        "a20",
    ],
    bms: ["0"],
    chunithm: [
        "chuni",
        "chuniplus",
        "air",
        "airplus",
        "star",
        "starplus",
        "amazon",
        "amazonplus",
        "crystal",
        "crystalplus",
    ],
    gitadora: [
        "gf1",
        "gf2dm1",
        "gf3dm2",
        "gf4dm3",
        "gf5dm4",
        "gf6dm5",
        "gf7dm6",
        "gf8dm7",
        "gf8dm7plus",
        "gf9dm8",
        "gf10dm9",
        "gf11dm10",
        "v",
        "v2",
        "v3",
        "v4",
        "v5",
        "v6",
        "v7",
        "v8",
        "xg",
        "xg2",
        "xg3",
        "gitadora",
        "overdrive",
        "triboost",
        "triboostplus",
        "matixx",
        "exchain",
        "nextage",
    ],
    usc: ["0"],
};
exports.defaultPlaytype = {
    iidx: "SP",
    museca: "Single",
    maimai: "Single",
    jubeat: "Single",
    popn: "9B",
    sdvx: "Single",
    ddr: "SP",
    bms: "7K",
    chunithm: "Single",
    gitadora: "Dora",
    usc: "Single",
};
exports.defaultDifficulty = {
    iidx: "ANOTHER",
    museca: "Red",
    maimai: "Master",
    jubeat: "EXT",
    popn: "EX",
    sdvx: "EXH",
    ddr: "EXPERT",
    bms: "CUSTOM",
    chunithm: "MASTER",
    gitadora: "MASTER",
    usc: "EXH",
};
function humaniseGame(game, pt) {
    if (!pt) {
        return exports.gameHuman[game];
    }
    if (exports.validPlaytypes[game].length === 1) {
        return exports.gameHuman[game];
    }
    return `${exports.gameHuman[game]} (${pt})`;
}
exports.humaniseGame = humaniseGame;
// todo, maybe
// export const difficultyColours = {
//     iidx: {
//         "BEGINNER": ,
//         "NORMAL": ,
//         "HYPER": ,
//         "ANOTHER": ,
//         "LEGGENDARIA": ,
//     }
// }
exports.validPlaytypes = {
    iidx: ["SP", "DP"],
    popn: ["9B"],
    sdvx: ["Single"],
    ddr: ["SP", "DP"],
    maimai: ["Single"],
    jubeat: ["Single"],
    museca: ["Single"],
    bms: ["7K", "14K"],
    chunithm: ["Single"],
    gitadora: ["Gita", "Dora"],
    usc: ["Single"],
};
// correct order for grades
exports.grades = {
    iidx: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
    bms: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
    museca: ["没", "拙", "凡", "佳", "良", "優", "秀", "傑", "傑G"],
    maimai: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "S", "S+", "SS", "SS+", "SSS", "SSS+"],
    jubeat: ["E", "D", "C", "B", "A", "S", "SS", "SSS", "EXC"],
    popn: ["E", "D", "C", "B", "A", "AA", "AAA", "S"],
    sdvx: ["D", "C", "B", "A", "A+", "AA", "AA+", "AAA", "AAA+", "S"],
    ddr: [
        "D",
        "D+",
        "C-",
        "C",
        "C+",
        "B-",
        "B",
        "B+",
        "A-",
        "A",
        "A+",
        "AA-",
        "AA",
        "AA+",
        "AAA",
        "MAX",
    ],
    chunithm: ["D", "C", "B", "BB", "BBB", "A", "AA", "AAA", "S", "SS", "SSS"],
    gitadora: ["C", "B", "A", "S", "SS", "MAX"],
    usc: ["D", "C", "B", "A", "A+", "AA", "AA+", "AAA", "AAA+", "S"],
};
exports.gradeBoundaries = {
    iidx: [0, 22.22, 33.33, 44.44, 55.55, 66.66, 77.77, 88.88, 94.44, 100.0],
    bms: [0, 22.22, 33.33, 44.44, 55.55, 66.66, 77.77, 88.88, 94.44, 100.0],
    museca: [0, 60, 70, 80, 85, 90, 95, 97.5, 100],
    // maimai is fidgety with grades - SSS+ is only possible if you get above 100%, but what the limit is depends on the chart
    maimai: [0, 10, 20, 40, 60, 80, 90, 94, 97, 98, 99, 99.5, 100, 9999],
    jubeat: [0, 50, 70, 80, 85, 90, 95, 98, 100],
    popn: [0, 50, 62, 72, 82, 90, 95, 98],
    // popn is fidgety with grades - A is the limit of grades if you fail. this NEEDS TO BE HANDLED in importhelpers. - 18/09/2020 isnt done yet lol
    sdvx: [0, 70, 80, 87, 90, 93, 95, 97, 98, 99],
    ddr: [0, 55, 59, 60, 65, 69, 70, 75, 79, 80, 85, 89, 90, 95, 99, 100],
    chunithm: [0, 50, 60, 70, 80, 90, 92.5, 95.0, 97.5, 100, 107.5, 101],
    gitadora: [0, 63, 73, 80, 95, 100],
    usc: [0, 70, 80, 87, 90, 93, 95, 97, 98, 99],
};
// these are to resolve some GARBAGE in chart.js
exports.boundaryHCF = {
    iidx: 5.555,
    bms: 5.555,
    museca: 2.5,
    maimai: 0.5,
    jubeat: 1,
    popn: 1,
    sdvx: 1,
    ddr: 1,
    chunithm: 0.5,
    gitadora: 1,
    usc: 1,
};
exports.expChartScale = {
    iidx: 1,
    bms: 1,
    museca: 5,
    maimai: 8,
    jubeat: 5,
    popn: 1,
    sdvx: 7,
    usc: 7,
    ddr: 6,
    chunithm: 4,
    gitadora: 3,
};
// valid lamps for a game, and also in order.
exports.lamps = {
    iidx: [
        "NO PLAY",
        "FAILED",
        "ASSIST CLEAR",
        "EASY CLEAR",
        "CLEAR",
        "HARD CLEAR",
        "EX HARD CLEAR",
        "FULL COMBO",
    ],
    bms: [
        "NO PLAY",
        "FAILED",
        "ASSIST CLEAR",
        "EASY CLEAR",
        "CLEAR",
        "HARD CLEAR",
        "EX HARD CLEAR",
        "FULL COMBO",
    ],
    museca: ["FAILED", "CLEAR", "CONNECT ALL", "PERFECT CONNECT ALL"],
    maimai: ["FAILED", "CLEAR", "FULL COMBO", "ALL PERFECT", "ALL PERFECT+"],
    jubeat: ["FAILED", "CLEAR", "FULL COMBO", "EXCELLENT"],
    popn: ["FAILED", "CLEAR", "FULL COMBO", "PERFECT"],
    sdvx: ["FAILED", "CLEAR", "EXCESSIVE CLEAR", "ULTIMATE CHAIN", "PERFECT ULTIMATE CHAIN"],
    ddr: [
        "FAILED",
        "CLEAR",
        "LIFE4",
        "FULL COMBO",
        "GREAT FULL COMBO",
        "PERFECT FULL COMBO",
        "MARVELOUS FULL COMBO",
    ],
    chunithm: ["FAILED", "CLEAR", "FULL COMBO", "ALL JUSTICE", "ALL JUSTICE CRITICAL"],
    gitadora: ["FAILED", "CLEAR", "FULL COMBO", "EXCELLENT"],
    usc: ["FAILED", "CLEAR", "EXCESSIVE CLEAR", "ULTIMATE CHAIN", "PERFECT ULTIMATE CHAIN"],
};
// first lamp that is considered a "true clear" by the game.
// laugh now, but who'll be laughing when some nerds at sega come up with a brand new
// minimal clear grade called "SOFTER EASIER ASSIST CLEAR EPIC X3"
exports.clearLamp = {
    iidx: "CLEAR",
    bms: "EASY CLEAR",
    museca: "CLEAR",
    maimai: "CLEAR",
    jubeat: "CLEAR",
    popn: "CLEAR",
    sdvx: "CLEAR",
    ddr: "CLEAR",
    chunithm: "CLEAR",
    gitadora: "CLEAR",
    usc: "CLEAR",
};
// minimum grade considered by the game (or kamaitachi) to be a clearing grade.
exports.clearGrade = {
    iidx: "A",
    bms: "A",
    museca: "良",
    maimai: "A",
    jubeat: "A",
    popn: "A",
    sdvx: "AA",
    ddr: "A",
    chunithm: "A",
    gitadora: "A",
    usc: "A",
};
exports.judgementWindows = {
    iidx: {
        SP: [
            { name: "PGREAT", msBorder: 16.667, value: 2 },
            { name: "GREAT", msBorder: 33.333, value: 1 },
            { name: "GOOD", msBorder: 116.667, value: 0 },
        ],
        DP: [
            { name: "PGREAT", msBorder: 16.667, value: 2 },
            { name: "GREAT", msBorder: 33.333, value: 1 },
            { name: "GOOD", msBorder: 116.667, value: 0 },
        ],
    },
    ddr: {
        SP: [
            { name: "MARVELOUS", msBorder: 15, value: 3 },
            { name: "PERFECT", msBorder: 30, value: 2 },
            { name: "GREAT", msBorder: 59, value: 1 },
            { name: "GOOD", msBorder: 89, value: 0 },
            { name: "BAD", msBorder: 119, value: 0 },
        ],
        DP: [
            { name: "MARVELOUS", msBorder: 15, value: 3 },
            { name: "PERFECT", msBorder: 30, value: 2 },
            { name: "GREAT", msBorder: 59, value: 1 },
            { name: "GOOD", msBorder: 89, value: 0 },
            { name: "BAD", msBorder: 119, value: 0 },
        ],
    },
    museca: {
        Single: [
            { name: "CRITICAL", msBorder: 33.333, value: 2 },
            { name: "NEAR", msBorder: 66.667, value: 1 },
        ],
    },
    gitadora: {
        Gita: [
            { name: "PERFECT", msBorder: 33, value: 1 },
            { name: "GREAT", msBorder: 57, value: 0.5 },
            { name: "GOOD", msBorder: 81, value: 0.2 },
            { name: "OK", msBorder: 116.667 /* not really, but yknow */, value: 0 },
        ],
        Dora: [
            { name: "PERFECT", msBorder: 27, value: 1 },
            { name: "GREAT", msBorder: 48, value: 0.5 },
            { name: "GOOD", msBorder: 72, value: 0.2 },
            { name: "OK", msBorder: 116.667 /* not really, but yknow */, value: 0 },
        ],
    },
};
exports.COLOUR_SET = {
    gray: "rgba(105, 105, 105, 1)",
    maroon: "rgba(85, 17, 17, 1)",
    red: "rgba(170, 85, 85, 1)",
    paleGreen: "rgba(142,174,79, 1)",
    paleBlue: "rgba(92, 97, 153, 1)",
    green: "rgba(50, 205, 50, 1)",
    blue: "rgba(70, 130, 180, 1)",
    gold: "rgba(255, 215, 0, 1)",
    vibrantYellow: "rgba(245, 229, 27, 1)",
    teal: "rgba(127, 255, 212, 1)",
    white: "rgba(192, 192, 192, 1)",
    purple: "rgba(153, 50, 204, 1)",
    vibrantPurple: "rgba(161, 23, 230, 1)",
    paleOrange: "rgba(235, 151, 78, 1)",
    orange: "rgba(248, 148, 6, 1)",
    vibrantOrange: "rgba(248, 175, 6, 1)",
    vibrantBlue: "rgba(43, 149, 237, 1)",
    vibrantGreen: "rgba(26, 232, 26, 1)",
};
exports.gradeColours = {
    museca: {
        outline: {
            没: exports.COLOUR_SET.gray,
            拙: exports.COLOUR_SET.maroon,
            凡: exports.COLOUR_SET.red,
            佳: exports.COLOUR_SET.paleGreen,
            良: exports.COLOUR_SET.paleBlue,
            優: exports.COLOUR_SET.green,
            秀: exports.COLOUR_SET.blue,
            傑: exports.COLOUR_SET.teal,
            傑G: exports.COLOUR_SET.gold,
        },
    },
    gitadora: {
        outline: {
            MAX: exports.COLOUR_SET.white,
            SS: exports.COLOUR_SET.gold,
            S: exports.COLOUR_SET.orange,
            A: exports.COLOUR_SET.green,
            B: exports.COLOUR_SET.blue,
            C: exports.COLOUR_SET.purple,
        },
    },
    ddr: {
        outline: {
            D: exports.COLOUR_SET.gray,
            "D+": exports.COLOUR_SET.maroon,
            "C-": exports.COLOUR_SET.red,
            C: exports.COLOUR_SET.purple,
            "C+": exports.COLOUR_SET.vibrantPurple,
            "B-": exports.COLOUR_SET.paleBlue,
            B: exports.COLOUR_SET.blue,
            "B+": exports.COLOUR_SET.vibrantBlue,
            "A-": exports.COLOUR_SET.paleGreen,
            A: exports.COLOUR_SET.green,
            "A+": exports.COLOUR_SET.vibrantGreen,
            "AA-": exports.COLOUR_SET.paleOrange,
            AA: exports.COLOUR_SET.orange,
            "AA+": exports.COLOUR_SET.vibrantOrange,
            AAA: exports.COLOUR_SET.gold,
        },
    },
    jubeat: {
        outline: {
            E: exports.COLOUR_SET.gray,
            D: exports.COLOUR_SET.maroon,
            C: exports.COLOUR_SET.purple,
            B: exports.COLOUR_SET.paleBlue,
            A: exports.COLOUR_SET.paleGreen,
            S: exports.COLOUR_SET.blue,
            SS: exports.COLOUR_SET.gold,
            SSS: exports.COLOUR_SET.teal,
            EXC: exports.COLOUR_SET.white,
        },
    },
    maimai: {
        outline: {
            F: exports.COLOUR_SET.gray,
            E: exports.COLOUR_SET.red,
            D: exports.COLOUR_SET.maroon,
            C: exports.COLOUR_SET.purple,
            B: exports.COLOUR_SET.paleGreen,
            A: exports.COLOUR_SET.green,
            AA: exports.COLOUR_SET.paleBlue,
            AAA: exports.COLOUR_SET.blue,
            S: exports.COLOUR_SET.gold,
            "S+": exports.COLOUR_SET.vibrantYellow,
            SS: exports.COLOUR_SET.paleOrange,
            "SS+": exports.COLOUR_SET.orange,
            SSS: exports.COLOUR_SET.teal,
            "SSS+": exports.COLOUR_SET.white,
        },
    },
    popn: {
        outline: {
            F: exports.COLOUR_SET.gray,
            E: exports.COLOUR_SET.red,
            D: exports.COLOUR_SET.maroon,
            C: exports.COLOUR_SET.purple,
            B: exports.COLOUR_SET.paleBlue,
            A: exports.COLOUR_SET.green,
            AA: exports.COLOUR_SET.paleOrange,
            AAA: exports.COLOUR_SET.gold,
            S: exports.COLOUR_SET.teal,
        },
    },
    iidx: {
        outline: {
            F: exports.COLOUR_SET.gray,
            E: exports.COLOUR_SET.red,
            D: exports.COLOUR_SET.maroon,
            C: exports.COLOUR_SET.purple,
            B: exports.COLOUR_SET.paleBlue,
            A: exports.COLOUR_SET.green,
            AA: exports.COLOUR_SET.blue,
            AAA: exports.COLOUR_SET.gold,
            "MAX-": exports.COLOUR_SET.teal,
            MAX: exports.COLOUR_SET.white,
        },
    },
    bms: {
        outline: {
            F: exports.COLOUR_SET.gray,
            E: exports.COLOUR_SET.red,
            D: exports.COLOUR_SET.maroon,
            C: exports.COLOUR_SET.purple,
            B: exports.COLOUR_SET.paleBlue,
            A: exports.COLOUR_SET.green,
            AA: exports.COLOUR_SET.blue,
            AAA: exports.COLOUR_SET.gold,
            "MAX-": exports.COLOUR_SET.teal,
            MAX: exports.COLOUR_SET.white,
        },
    },
    sdvx: {
        outline: {
            D: exports.COLOUR_SET.gray,
            C: exports.COLOUR_SET.red,
            B: exports.COLOUR_SET.maroon,
            A: exports.COLOUR_SET.paleBlue,
            "A+": exports.COLOUR_SET.blue,
            AA: exports.COLOUR_SET.paleGreen,
            "AA+": exports.COLOUR_SET.green,
            AAA: exports.COLOUR_SET.gold,
            "AAA+": exports.COLOUR_SET.vibrantYellow,
            S: exports.COLOUR_SET.teal,
        },
    },
    usc: {
        outline: {
            D: exports.COLOUR_SET.gray,
            C: exports.COLOUR_SET.red,
            B: exports.COLOUR_SET.maroon,
            A: exports.COLOUR_SET.paleBlue,
            "A+": exports.COLOUR_SET.blue,
            AA: exports.COLOUR_SET.paleGreen,
            "AA+": exports.COLOUR_SET.green,
            AAA: exports.COLOUR_SET.gold,
            "AAA+": exports.COLOUR_SET.vibrantYellow,
            S: exports.COLOUR_SET.teal,
        },
    },
    chunithm: {
        outline: {
            D: exports.COLOUR_SET.red,
            C: exports.COLOUR_SET.purple,
            B: exports.COLOUR_SET.paleBlue,
            BB: exports.COLOUR_SET.blue,
            BBB: exports.COLOUR_SET.vibrantBlue,
            A: exports.COLOUR_SET.paleGreen,
            AA: exports.COLOUR_SET.green,
            AAA: exports.COLOUR_SET.vibrantGreen,
            S: exports.COLOUR_SET.vibrantOrange,
            SS: exports.COLOUR_SET.vibrantYellow,
            SSS: exports.COLOUR_SET.teal,
        },
    },
};
exports.lampColours = {
    gitadora: {
        outline: {
            FAILED: exports.COLOUR_SET.red,
            CLEAR: exports.COLOUR_SET.blue,
            "FULL COMBO": exports.COLOUR_SET.teal,
            EXCELLENT: exports.COLOUR_SET.gold,
        },
    },
    ddr: {
        outline: {
            FAILED: exports.COLOUR_SET.red,
            CLEAR: exports.COLOUR_SET.paleGreen,
            LIFE4: exports.COLOUR_SET.orange,
            "FULL COMBO": exports.COLOUR_SET.paleBlue,
            "GREAT FULL COMBO": exports.COLOUR_SET.green,
            "PERFECT FULL COMBO": exports.COLOUR_SET.gold,
            "MARVELOUS FULL COMBO": exports.COLOUR_SET.teal,
        },
    },
    iidx: {
        outline: {
            "NO PLAY": exports.COLOUR_SET.gray,
            FAILED: exports.COLOUR_SET.red,
            "ASSIST CLEAR": exports.COLOUR_SET.purple,
            "EASY CLEAR": exports.COLOUR_SET.green,
            CLEAR: exports.COLOUR_SET.blue,
            "HARD CLEAR": exports.COLOUR_SET.orange,
            "EX HARD CLEAR": exports.COLOUR_SET.gold,
            "FULL COMBO": exports.COLOUR_SET.teal,
        },
    },
    bms: {
        outline: {
            "NO PLAY": exports.COLOUR_SET.gray,
            FAILED: exports.COLOUR_SET.red,
            "ASSIST CLEAR": exports.COLOUR_SET.purple,
            "EASY CLEAR": exports.COLOUR_SET.green,
            CLEAR: exports.COLOUR_SET.blue,
            "HARD CLEAR": exports.COLOUR_SET.orange,
            "EX HARD CLEAR": exports.COLOUR_SET.gold,
            "FULL COMBO": exports.COLOUR_SET.teal,
        },
    },
    museca: {
        outline: {
            FAILED: exports.COLOUR_SET.red,
            CLEAR: exports.COLOUR_SET.green,
            "CONNECT ALL": exports.COLOUR_SET.teal,
            "PERFECT CONNECT ALL": exports.COLOUR_SET.gold,
        },
    },
    sdvx: {
        outline: {
            FAILED: exports.COLOUR_SET.red,
            CLEAR: exports.COLOUR_SET.green,
            "EXCESSIVE CLEAR": exports.COLOUR_SET.orange,
            "ULTIMATE CHAIN": exports.COLOUR_SET.teal,
            "PERFECT ULTIMATE CHAIN": exports.COLOUR_SET.gold,
        },
    },
    usc: {
        outline: {
            FAILED: exports.COLOUR_SET.red,
            CLEAR: exports.COLOUR_SET.green,
            "EXCESSIVE CLEAR": exports.COLOUR_SET.orange,
            "ULTIMATE CHAIN": exports.COLOUR_SET.teal,
            "PERFECT ULTIMATE CHAIN": exports.COLOUR_SET.gold,
        },
    },
    popn: {
        outline: {
            FAILED: exports.COLOUR_SET.red,
            CLEAR: exports.COLOUR_SET.green,
            "FULL COMBO": exports.COLOUR_SET.teal,
            PERFECT: exports.COLOUR_SET.gold,
        },
    },
    maimai: {
        outline: {
            FAILED: exports.COLOUR_SET.red,
            CLEAR: exports.COLOUR_SET.green,
            "FULL COMBO": exports.COLOUR_SET.blue,
            "ALL PERFECT": exports.COLOUR_SET.gold,
            "ALL PERFECT+": exports.COLOUR_SET.teal,
        },
    },
    jubeat: {
        outline: {
            FAILED: exports.COLOUR_SET.red,
            CLEAR: exports.COLOUR_SET.paleBlue,
            "FULL COMBO": exports.COLOUR_SET.teal,
            EXCELLENT: exports.COLOUR_SET.gold,
        },
    },
    chunithm: {
        outline: {
            FAILED: exports.COLOUR_SET.red,
            CLEAR: exports.COLOUR_SET.paleGreen,
            "FULL COMBO": exports.COLOUR_SET.paleBlue,
            "ALL JUSTICE": exports.COLOUR_SET.gold,
            "ALL JUSTICE CRITICAL": exports.COLOUR_SET.white,
        },
    },
};
// ok
// shoutouts to stack overflow
// https://stackoverflow.com/questions/41993515/access-object-key-using-variable-in-typescript
function typedKeys(o) {
    return Object.keys(o);
}
for (const colourConfig of [exports.lampColours, exports.gradeColours]) {
    for (const game of typedKeys(colourConfig)) {
        if (colourConfig.hasOwnProperty(game)) {
            colourConfig[game].fill = {};
            for (const key in colourConfig[game].outline) {
                if (colourConfig[game].outline.hasOwnProperty(key)) {
                    const element = colourConfig[game].outline[key];
                    if (!element) {
                        continue;
                    }
                    let fadedEl = element.split(",");
                    fadedEl[fadedEl.length - 1] = "0.2)";
                    colourConfig[game].fill[key] = fadedEl.join(",");
                }
            }
        }
    }
}
exports.judgeColours = {
    iidx: {
        fill: {
            MISS: "rgba(211, 38, 38, 0.2)",
            BAD: "rgba(165, 38, 211, 0.2)",
            GOOD: "rgba(38, 211, 78, 0.2)",
            GREAT: "rgba(241, 245, 24, 0.2)",
            PGREAT: "rgba(158, 248, 255, 0.2)",
        },
        outline: {
            MISS: "rgba(211, 38, 38, 1)",
            BAD: "rgba(165, 38, 211, 1)",
            GOOD: "rgba(38, 211, 78, 1)",
            GREAT: "rgba(241, 245, 24, 1)",
            PGREAT: "rgba(158, 248, 255, 1)",
        },
    },
    bms: {
        fill: {
            MISS: "rgba(211, 38, 38, 0.2)",
            BAD: "rgba(165, 38, 211, 0.2)",
            GOOD: "rgba(38, 211, 78, 0.2)",
            GREAT: "rgba(241, 245, 24, 0.2)",
            PGREAT: "rgba(158, 248, 255, 0.2)",
        },
        outline: {
            MISS: "rgba(211, 38, 38, 1)",
            BAD: "rgba(165, 38, 211, 1)",
            GOOD: "rgba(38, 211, 78, 1)",
            GREAT: "rgba(241, 245, 24, 1)",
            PGREAT: "rgba(158, 248, 255, 1)",
        },
    },
    ddr: {
        fill: {
            MISS: "rgba(211, 38, 38, 0.2)",
            BOO: "rgba(165, 38, 211, 0.2)",
            GOOD: "rgba(38, 211, 78, 0.2)",
            GREAT: exports.COLOUR_SET.green,
            PERFECT: "rgba(158, 248, 255, 0.2)",
            MARVELOUS: "rgba(241, 245, 24, 0.2)",
        },
        outline: {
            MISS: "rgba(211, 38, 38, 1)",
            BOO: "rgba(165, 38, 211, 1)",
            GOOD: "rgba(38, 211, 78, 1)",
            GREAT: ChangeAlpha(exports.COLOUR_SET.green, "1"),
            PERFECT: "rgba(158, 248, 255, 1)",
            MARVELOUS: "rgba(241, 245, 24, 1)",
        },
    },
    museca: {
        fill: {
            MISS: "rgba(211, 38, 38, 0.2)",
            NEAR: "rgba(20, 210, 223, 0.2)",
            CRITICAL: "rgba(241, 245, 24, 0.2)",
        },
        outline: {
            MISS: "rgba(211, 38, 38, 1)",
            NEAR: "rgba(20, 210, 223, 1)",
            CRITICAL: "rgba(241, 245, 24, 1)",
        },
    },
    sdvx: {
        fill: {
            MISS: "rgba(211, 38, 38, 0.2)",
            NEAR: "rgba(20, 210, 223, 0.2)",
            CRITICAL: "rgba(241, 245, 24, 0.2)",
        },
        outline: {
            MISS: "rgba(211, 38, 38, 1)",
            NEAR: "rgba(20, 210, 223, 1)",
            CRITICAL: "rgba(241, 245, 24, 1)",
        },
    },
    usc: {
        fill: {
            MISS: "rgba(211, 38, 38, 0.2)",
            NEAR: "rgba(20, 210, 223, 0.2)",
            CRITICAL: "rgba(241, 245, 24, 0.2)",
        },
        outline: {
            MISS: "rgba(211, 38, 38, 1)",
            NEAR: "rgba(20, 210, 223, 1)",
            CRITICAL: "rgba(241, 245, 24, 1)",
        },
    },
    popn: {
        fill: {
            BAD: "rgba(165, 38, 211, 0.2)",
            GOOD: "rgba(239, 84, 81, 0.2)",
            GREAT: "rgba(241, 245, 24, 0.2)",
            PGREAT: "rgba(158, 248, 255, 0.2)",
        },
        outline: {
            BAD: "rgba(165, 38, 211, 1)",
            GOOD: "rgba(239, 84, 81, 1)",
            GREAT: "rgba(241, 245, 24, 1)",
            PGREAT: "rgba(158, 248, 255, 1)",
        },
    },
    maimai: {
        fill: {
            MISS: "rgba(211, 38, 38, 0.2)",
            GOOD: "rgba(38, 211, 78, 0.2)",
            GREAT: "rgba(228, 62, 225, 0.2)",
            PERFECT: "rgba(241, 245, 24, 0.2)",
        },
        outline: {
            MISS: "rgba(211, 38, 38, 1)",
            GOOD: "rgba(38, 211, 78, 1)",
            GREAT: "rgba(228, 62, 225,1)",
            PERFECT: "rgba(241, 245, 24, 1)",
        },
    },
    jubeat: {
        fill: {
            MISS: "rgba(211, 38, 38, 0.2)",
            POOR: "rgba(165, 38, 211, 0.2)",
            GOOD: "rgba(39, 190, 117,0.2)",
            GREAT: "rgba(38, 211, 78, 0.2)",
            PERFECT: "rgba(241, 245, 24, 0.2)",
        },
        outline: {
            MISS: "rgba(211, 38, 38, 1)",
            POOR: "rgba(165, 38, 211, 1)",
            GOOD: "rgba(39, 190, 117, 1)",
            GREAT: "rgba(38, 211, 78, 1)",
            PERFECT: "rgba(241, 245, 24, 1)",
        },
    },
    chunithm: {
        outline: {
            MISS: exports.COLOUR_SET.gray,
            ATTACK: exports.COLOUR_SET.green,
            JUSTICE: exports.COLOUR_SET.orange,
            JCRIT: exports.COLOUR_SET.gold,
        },
        fill: {
            MISS: ChangeAlpha(exports.COLOUR_SET.gray, "1"),
            ATTACK: ChangeAlpha(exports.COLOUR_SET.green, "1"),
            JUSTICE: ChangeAlpha(exports.COLOUR_SET.orange, "1"),
            JCRIT: ChangeAlpha(exports.COLOUR_SET.gold, "1"),
        },
    },
    gitadora: {
        outline: {
            MISS: exports.COLOUR_SET.red,
            OK: exports.COLOUR_SET.purple,
            GOOD: exports.COLOUR_SET.blue,
            GREAT: exports.COLOUR_SET.green,
            PERFECT: exports.COLOUR_SET.gold,
        },
        fill: {
            MISS: ChangeAlpha(exports.COLOUR_SET.red, "1"),
            OK: ChangeAlpha(exports.COLOUR_SET.purple, "1"),
            GOOD: ChangeAlpha(exports.COLOUR_SET.blue, "1"),
            GREAT: ChangeAlpha(exports.COLOUR_SET.green, "1"),
            PERFECT: ChangeAlpha(exports.COLOUR_SET.gold, "1"),
        },
    },
};
exports.gameChartIndicators = {
    iidx: ["cn", "bss", "hcn", "hbss"],
    popn: ["holds"],
    ddr: ["shocks", "freezes"],
    museca: [],
    maimai: [],
    jubeat: ["holds"],
    sdvx: [],
    usc: [],
    bms: [],
    chunithm: [],
    gitadora: [],
};
function GetGrade(game, percent) {
    // THIS FOR LOOP IS ITERATING DOWNWARDS
    // JUST INCASE YOU DON'T ACTUALLY READ IT PROPERLY
    for (let i = exports.grades[game].length; i >= 0; i--) {
        let gradeName = exports.grades[game][i];
        let gradeBound = exports.gradeBoundaries[game][i];
        if (percent >= gradeBound) {
            return gradeName;
        }
    }
    // if we get all this way they've got a negative score
    // idk what to write in this case so ur gonna get null and throw an error in my logs
    return null;
}
exports.ratingParameters = {
    iidx: {
        failHarshnessMultiplier: 0.3,
        pivotPercent: 0.7777,
        clearExpMultiplier: 1,
    },
    bms: {
        failHarshnessMultiplier: 0.5,
        pivotPercent: 0.7777,
        clearExpMultiplier: 0.75,
    },
    museca: {
        failHarshnessMultiplier: 1,
        pivotPercent: 0.8,
        clearExpMultiplier: 1, // no real reason
    },
    popn: {
        failHarshnessMultiplier: 1,
        pivotPercent: 0.8,
        clearExpMultiplier: 0.4, // no real reason
    },
    maimai: {
        failHarshnessMultiplier: 1,
        pivotPercent: 0.8,
        clearExpMultiplier: 1,
    },
    jubeat: {
        failHarshnessMultiplier: 0.9,
        pivotPercent: 0.7,
        clearExpMultiplier: 1,
    },
    sdvx: {
        failHarshnessMultiplier: 1,
        pivotPercent: 0.92,
        clearExpMultiplier: 1.45, // testing
    },
    usc: {
        failHarshnessMultiplier: 1,
        pivotPercent: 0.92,
        clearExpMultiplier: 1.45, // testing
    },
    ddr: {
        failHarshnessMultiplier: 0.9,
        pivotPercent: 0.9,
        clearExpMultiplier: 1,
    },
    chunithm: {
        failHarshnessMultiplier: 1,
        pivotPercent: 0.975,
        clearExpMultiplier: 1.1,
    },
    gitadora: {
        // GENERIC PARAMS. THIS IS **NOT** THE USED CALC.
        failHarshnessMultiplier: 1,
        pivotPercent: 0.8,
        clearExpMultiplier: 1.1,
    },
};
function ChangeAlpha(string, alpha) {
    let spl = string.split(",");
    spl[spl.length - 1] = `${alpha})`;
    return spl.join(",");
}
function DirectScoreGradeDelta(game, score, percent, chart, delta) {
    let grade = GetGrade(game, percent);
    if (!grade) {
        throw new Error(`Invalid grade created from ${game}, ${percent}`);
    }
    let scoreObj = {
        scoreData: {
            score,
            grade,
        },
    };
    return ScoreGradeDelta(game, scoreObj, chart, delta);
}
exports.DirectScoreGradeDelta = DirectScoreGradeDelta;
exports.supportsESD = {
    iidx: true,
    museca: false,
    bms: false,
    chunithm: false,
    ddr: false,
    gitadora: false,
    jubeat: false,
    maimai: false,
    popn: false,
    sdvx: false,
    usc: false,
};
function ScoreGradeDelta(game, score, chart, delta) {
    let nextGrade = exports.grades[game][exports.grades[game].indexOf(score.scoreData.grade) + delta];
    if (nextGrade) {
        let nextGradePercent = exports.gradeBoundaries[game][exports.grades[game].indexOf(nextGrade)];
        let nGScore = CalculateScore(game, nextGradePercent, chart);
        if (nGScore) {
            let delta = score.scoreData.score - nGScore;
            let formattedString = `(${nextGrade})`;
            if (Number.isInteger(delta)) {
                formattedString += delta >= 0 ? `+${delta}` : `${delta}`;
            }
            else {
                formattedString += delta >= 0 ? `+${delta.toFixed(2)}` : `${delta.toFixed(2)}`;
            }
            return {
                grade: nextGrade,
                delta: delta,
                formattedString: formattedString,
            };
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}
exports.ScoreGradeDelta = ScoreGradeDelta;
function AbsoluteScoreGradeDelta(game, score, percent, absDelta) {
    let grade = exports.grades[game][absDelta];
    if (grade) {
        let chart = null;
        if (game === "iidx" || game === "bms") {
            let reversedNC = Math.floor((score / percent) * 100) / 2;
            chart = {
                data: {
                    notecount: reversedNC,
                },
            }; // heheh
        }
        let sc = CalculateScore(game, exports.gradeBoundaries[game][absDelta], chart);
        if (sc) {
            let delta = score - sc;
            let formattedString = `(${grade})`;
            formattedString += delta >= 0 ? `+${delta}` : `${delta}`;
            return {
                grade: grade,
                delta: delta,
                formattedString: formattedString,
            };
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}
exports.AbsoluteScoreGradeDelta = AbsoluteScoreGradeDelta;
function CalculateScore(game, percent, chart) {
    let score = percent;
    if (game === "iidx" || game === "bms") {
        score = chart.data.notecount * 2 * (percent / 100);
    }
    else if (game === "ddr" || game === "museca" || game === "jubeat" || game === "chunithm") {
        score = 1000000 * (percent / 100);
    }
    else if (game === "popn") {
        score = 100000 * (percent / 100);
    }
    else if (game === "sdvx" || game === "usc") {
        score = 10000000 * (percent / 100);
    }
    if (score) {
        return score;
    }
    return null;
}
exports.CalculateScore = CalculateScore;
function PercentToScore(percent, game, chartData) {
    let eScore = 0;
    if (game === "iidx" || game === "bms") {
        eScore = percent * chartData.data.notecount * 2;
    }
    else if (game === "museca" || game === "jubeat") {
        eScore = percent * 1000000;
    }
    else if (game === "popn") {
        eScore = percent * 100000;
    }
    else if (game === "sdvx" || game === "usc") {
        eScore = percent * 10000000;
    }
    else if (game === "ddr") {
        // todo
    }
    else if (game === "chunithm") {
        eScore = percent * 1000000;
    }
    else if (game === "gitadora") {
        eScore = percent;
    }
    return eScore;
}
exports.PercentToScore = PercentToScore;
function FormatDifficulty(chart, game) {
    if (exports.validPlaytypes[game].length > 1) {
        return `${chart.playtype} ${chart.difficulty} ${chart.level}`;
    }
    return `${chart.difficulty}`;
}
exports.FormatDifficulty = FormatDifficulty;
exports.gamePercentMax = {
    iidx: 100,
    ddr: 100,
    gitadora: 100,
    popn: 100,
    sdvx: 100,
    museca: 100,
    jubeat: 100,
    bms: 100,
    chunithm: 101,
    maimai: 150,
    maimaidx: 150,
    usc: 100,
};
//# sourceMappingURL=config.js.map