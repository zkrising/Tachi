// source: ongeki/common.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {missingRequire} reports error on implicit type usages.
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
// @ts-nocheck

var jspb = require('google-protobuf');
var goog = jspb;
var global = (function() {
  if (this) { return this; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  if (typeof self !== 'undefined') { return self; }
  return Function('return this')();
}.call(null));

goog.exportSymbol('proto.mythos.ongeki.v0.OngekiBattleScoreRank', null, global);
goog.exportSymbol('proto.mythos.ongeki.v0.OngekiBossAttribute', null, global);
goog.exportSymbol('proto.mythos.ongeki.v0.OngekiClearStatus', null, global);
goog.exportSymbol('proto.mythos.ongeki.v0.OngekiComboStatus', null, global);
goog.exportSymbol('proto.mythos.ongeki.v0.OngekiLevel', null, global);
goog.exportSymbol('proto.mythos.ongeki.v0.OngekiRankingType', null, global);
goog.exportSymbol('proto.mythos.ongeki.v0.OngekiTechScoreRank', null, global);
/**
 * @enum {number}
 */
proto.mythos.ongeki.v0.OngekiLevel = {
  ONGEKI_LEVEL_UNSPECIFIED: 0,
  ONGEKI_LEVEL_BASIC: 1,
  ONGEKI_LEVEL_ADVANCED: 2,
  ONGEKI_LEVEL_EXPERT: 3,
  ONGEKI_LEVEL_MASTER: 4,
  ONGEKI_LEVEL_LUNATIC: 5
};

/**
 * @enum {number}
 */
proto.mythos.ongeki.v0.OngekiRankingType = {
  ONGEKI_RANKING_TYPE_UNSPECIFIED: 0,
  ONGEKI_RANKING_TYPE_TECH_SCORE: 1,
  ONGEKI_RANKING_TYPE_BATTLE_SCORE: 2,
  ONGEKI_RANKING_TYPE_OVER_DAMAGE: 3,
  ONGEKI_RANKING_TYPE_PLATINUM_SCORE: 4
};

/**
 * @enum {number}
 */
proto.mythos.ongeki.v0.OngekiTechScoreRank = {
  ONGEKI_TECH_SCORE_RANK_UNSPECIFIED: 0,
  ONGEKI_TECH_SCORE_RANK_D: 1,
  ONGEKI_TECH_SCORE_RANK_C: 2,
  ONGEKI_TECH_SCORE_RANK_B: 3,
  ONGEKI_TECH_SCORE_RANK_BB: 4,
  ONGEKI_TECH_SCORE_RANK_BBB: 5,
  ONGEKI_TECH_SCORE_RANK_A: 6,
  ONGEKI_TECH_SCORE_RANK_AA: 7,
  ONGEKI_TECH_SCORE_RANK_AAA: 8,
  ONGEKI_TECH_SCORE_RANK_S: 9,
  ONGEKI_TECH_SCORE_RANK_S_PLUS: 10,
  ONGEKI_TECH_SCORE_RANK_SS: 11,
  ONGEKI_TECH_SCORE_RANK_SS_PLUS: 12,
  ONGEKI_TECH_SCORE_RANK_SSS: 13,
  ONGEKI_TECH_SCORE_RANK_SSS_PLUS: 14
};

/**
 * @enum {number}
 */
proto.mythos.ongeki.v0.OngekiBattleScoreRank = {
  ONGEKI_BATTLE_SCORE_RANK_UNSPECIFIED: 0,
  ONGEKI_BATTLE_SCORE_RANK_NO_GOOD: 1,
  ONGEKI_BATTLE_SCORE_RANK_USUALLY: 2,
  ONGEKI_BATTLE_SCORE_RANK_GOOD: 3,
  ONGEKI_BATTLE_SCORE_RANK_GREAT: 4,
  ONGEKI_BATTLE_SCORE_RANK_EXCELLENT: 5,
  ONGEKI_BATTLE_SCORE_RANK_UNBELIEVABLE: 6
};

/**
 * @enum {number}
 */
proto.mythos.ongeki.v0.OngekiClearStatus = {
  ONGEKI_CLEAR_STATUS_UNSPECIFIED: 0,
  ONGEKI_CLEAR_STATUS_FAILED: 1,
  ONGEKI_CLEAR_STATUS_CLEARED: 2,
  ONGEKI_CLEAR_STATUS_OVER_DAMAGE: 3
};

/**
 * @enum {number}
 */
proto.mythos.ongeki.v0.OngekiComboStatus = {
  ONGEKI_COMBO_STATUS_UNSPECIFIED: 0,
  ONGEKI_COMBO_STATUS_NONE: 1,
  ONGEKI_COMBO_STATUS_FULL_COMBO: 2,
  ONGEKI_COMBO_STATUS_ALL_BREAK: 3
};

/**
 * @enum {number}
 */
proto.mythos.ongeki.v0.OngekiBossAttribute = {
  ONGEKI_BOSS_ATTRIBUTE_UNSPECIFIED: 0,
  ONGEKI_BOSS_ATTRIBUTE_FIRE: 1,
  ONGEKI_BOSS_ATTRIBUTE_AQUA: 2,
  ONGEKI_BOSS_ATTRIBUTE_LEAF: 3
};

goog.object.extend(exports, proto.mythos.ongeki.v0);
