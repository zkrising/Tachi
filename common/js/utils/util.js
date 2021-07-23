"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatChart = exports.FormatGame = exports.FormatDifficultyShort = exports.FormatDifficulty = void 0;
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
    if (game === "ddr") {
        return `${shortDiff}${chart.playtype}`;
    }
    if (gameConfig.validPlaytypes.length === 1 || game === "gitadora") {
        return `${shortDiff} ${chart.level}`;
    }
    return `${chart.playtype}${shortDiff} ${chart.level}`;
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
function FormatChart(game, song, chart) {
    if (game === "bms") {
        return song.title;
    }
    const gameConfig = config_1.GetGameConfig(game);
    let playtypeStr = `${chart.playtype} `;
    if (gameConfig.validPlaytypes.length === 1) {
        playtypeStr = "";
    }
    // return the most recent version this chart appeared in if it
    // is not primary.
    if (!chart.isPrimary) {
        return `${song.title} (${playtypeStr}${chart.difficulty} ${chart.versions[0]})`;
    }
    return `${song.title} (${playtypeStr}${chart.difficulty})`;
}
exports.FormatChart = FormatChart;
//# sourceMappingURL=util.js.map