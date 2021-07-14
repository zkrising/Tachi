"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatGame = exports.FormatDifficulty = void 0;
const config_1 = require("../config/config");
function FormatDifficulty(chart, game) {
    const gameConfig = config_1.GetGameConfig(game);
    if (gameConfig.validPlaytypes.length > 1) {
        return `${chart.playtype} ${chart.difficulty} ${chart.level}`;
    }
    return `${chart.difficulty}`;
}
exports.FormatDifficulty = FormatDifficulty;
function FormatGame(game, playtype) {
    const gameConfig = config_1.GetGameConfig(game);
    if (gameConfig.validPlaytypes.length === 1) {
        return gameConfig.name;
    }
    return `${gameConfig.name} (${playtype})`;
}
exports.FormatGame = FormatGame;
//# sourceMappingURL=util.js.map