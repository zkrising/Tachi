"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDifficulty = void 0;
const config_1 = require("../config/config");
function FormatDifficulty(chart, game) {
    const gameConfig = config_1.GetGameConfig(game);
    if (gameConfig.validPlaytypes.length > 1) {
        return `${chart.playtype} ${chart.difficulty} ${chart.level}`;
    }
    return `${chart.difficulty}`;
}
exports.FormatDifficulty = FormatDifficulty;
//# sourceMappingURL=util.js.map