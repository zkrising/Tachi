"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoCoerce = void 0;
function AutoCoerce(collection, scores) {
    return __awaiter(this, void 0, void 0, function* () {
        let notPBsArr = [];
        for (const s of scores) {
            if (!s.isLampPB) {
                notPBsArr.push({
                    userID: s.userID,
                    chartID: s.chartID,
                    isLampPB: true,
                });
            }
        }
        if (notPBsArr.length === 0) {
            return scores;
        }
        let lampPBsArr = yield collection.find({
            $or: notPBsArr,
        });
        let lampPBs = new Map();
        for (const score of lampPBsArr) {
            lampPBs.set(`${score.userID}-${score.chartID}`, score);
        }
        for (const score of scores) {
            if (!score.isLampPB) {
                let lampPB = lampPBs.get(`${score.userID}-${score.chartID}`);
                if (lampPB) {
                    score.scoreData.lamp = lampPB.scoreData.lamp;
                    score.scoreData.lampIndex = lampPB.scoreData.lampIndex;
                    score.calculatedData.lampRating = lampPB.calculatedData.lampRating;
                    // not too happy about this, this is a sign
                    // of something not properly being generalised.
                    if (score.game === "bms") {
                        score.calculatedData.rating = lampPB.calculatedData.rating;
                    }
                    score.isLampPB = true;
                }
            }
        }
        return scores;
    });
}
exports.AutoCoerce = AutoCoerce;
//# sourceMappingURL=score-core.js.map