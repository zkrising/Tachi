"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculateGradeDeltaIIDX = void 0;
const config_1 = require("../config/config");
const IIDXConfig = config_1.GetGamePTConfig("iidx", "SP");
function CalculateGradeDeltaIIDX(cmpGrade, score, notecount) {
    const cmpGradeIDX = IIDXConfig.grades.indexOf(cmpGrade);
    const cmpGradePercent = IIDXConfig.gradeBoundaries[cmpGradeIDX];
    const cmpScore = Math.ceil(notecount * (cmpGradePercent / 100));
    const delta = score - cmpScore;
    if (delta >= 0) {
        return `${cmpGrade}+${delta}`;
    }
    else {
        // negative numbers implicitly stringify with the - prefix
        return `${cmpGrade}${delta}`;
    }
}
exports.CalculateGradeDeltaIIDX = CalculateGradeDeltaIIDX;
//# sourceMappingURL=util.js.map