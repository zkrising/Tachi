"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatGame = exports.OMNI_CONFIG = exports.BTCHI_CONFIG = exports.KTCHI_CONFIG = exports.allSupportedGames = exports.allImportTypes = exports.apiImportTypes = exports.irImportTypes = exports.fileImportTypes = void 0;
const config_1 = require("./config");
exports.fileImportTypes = [
    "file/eamusement-iidx-csv",
    "file/batch-manual",
    "file/solid-state-squad",
    "file/mer-iidx",
    "file/pli-iidx-csv",
];
exports.irImportTypes = [
    "ir/direct-manual",
    "ir/barbatos",
    "ir/fervidex",
    "ir/fervidex-static",
    "ir/beatoraja",
    "ir/chunitachi",
    "ir/usc",
];
exports.apiImportTypes = [
    "api/arc-iidx",
    "api/arc-sdvx",
    "api/arc-ddr",
    "api/eag-iidx",
    "api/eag-sdvx",
    "api/flo-iidx",
    "api/flo-sdvx",
];
exports.allImportTypes = [
    ...exports.fileImportTypes,
    ...exports.irImportTypes,
    ...exports.apiImportTypes,
];
exports.allSupportedGames = [
    "iidx",
    "museca",
    "maimai",
    // "jubeat",
    // "popn",
    "sdvx",
    "ddr",
    "bms",
    "chunithm",
    "gitadora",
    "usc",
];
exports.KTCHI_CONFIG = {
    name: "Kamaitachi",
    supportedGames: ["iidx", "gitadora", "chunithm", "maimai", "museca", "sdvx"],
    supportedImportTypes: [
        "api/arc-iidx",
        "api/arc-sdvx",
        "api/arc-ddr",
        "api/eag-iidx",
        "api/eag-sdvx",
        "api/flo-iidx",
        "api/flo-sdvx",
        "ir/direct-manual",
        "ir/fervidex",
        "ir/fervidex-static",
        "ir/chunitachi",
        "file/eamusement-iidx-csv",
        "file/solid-state-squad",
        "file/mer-iidx",
        "file/pli-iidx-csv",
    ],
};
exports.BTCHI_CONFIG = {
    name: "Bokutachi",
    supportedGames: ["usc", "bms"],
    supportedImportTypes: ["ir/beatoraja", "ir/usc", "ir/direct-manual", "file/batch-manual"],
};
exports.OMNI_CONFIG = {
    name: "Omnitachi",
    supportedGames: exports.allSupportedGames,
    supportedImportTypes: exports.allImportTypes,
};
function FormatGame(game, playtype) {
    const gameConfig = config_1.GetGameConfig(game);
    if (gameConfig.validPlaytypes.length === 1) {
        return gameConfig.name;
    }
    return `${gameConfig.name} (${playtype})`;
}
exports.FormatGame = FormatGame;
//# sourceMappingURL=static-config.js.map