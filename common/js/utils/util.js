"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatGame = exports.FormatDifficultyShort = exports.FormatDifficulty = void 0;
const config_1 = require("../config/config");
function FormatDifficulty(chart, game) {
    const gameConfig = config_1.GetGameConfig(game);
    if (game === "bms") {
        return `${chart.playtype} ${chart.level}`;
    }
    if (gameConfig.validPlaytypes.length > 1) {
        return `${chart.playtype} ${chart.difficulty} ${chart.level}`;
    }
    return `${chart.difficulty}`;
}
exports.FormatDifficulty = FormatDifficulty;
/**
 * Formats a chart's difficulty into a shorter variant. This handles a lot of
 * game-specific strange edge cases.
 */
function FormatDifficultyShort(chart, game) {
    var _a;
    const gameConfig = config_1.GetGameConfig(game);
    const gptConfig = config_1.GetGamePTConfig(game, chart.playtype);
    const shortDiff = (_a = gptConfig.shortDifficulties[chart.difficulty]) !== null && _a !== void 0 ? _a : chart.difficulty;
    if (game === "bms") {
        return `${chart.playtype} ${chart.level}`;
    }
    if (game === "gitadora" && chart.playtype === "Gita") {
        if (chart.difficulty.startsWith("BASS ")) {
            return shortDiff;
        }
        return `G-${shortDiff}`;
    }
    if (game === "ddr") {
        return `${shortDiff}${chart.playtype}`;
    }
    if (gameConfig.validPlaytypes.length === 1) {
        return shortDiff;
    }
    return `${chart.playtype} ${shortDiff}`;
}
exports.FormatDifficultyShort = FormatDifficultyShort;
function FormatGame(game, playtype) {
    const gameConfig = config_1.GetGameConfig(game);
    if (gameConfig.validPlaytypes.length === 1) {
        return gameConfig.name;
    }
    return `${gameConfig.name} (${playtype})`;
}
exports.FormatGame = FormatGame;
//# sourceMappingURL=util.js.map