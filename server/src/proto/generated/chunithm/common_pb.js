// source: chunithm/common.proto
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

goog.exportSymbol('proto.mythos.chunithm.v0.ChunithmClearStatus', null, global);
goog.exportSymbol('proto.mythos.chunithm.v0.ChunithmComboStatus', null, global);
goog.exportSymbol('proto.mythos.chunithm.v0.ChunithmFullChainStatus', null, global);
goog.exportSymbol('proto.mythos.chunithm.v0.ChunithmLevel', null, global);
goog.exportSymbol('proto.mythos.chunithm.v0.ChunithmScoreRank', null, global);
/**
 * @enum {number}
 */
proto.mythos.chunithm.v0.ChunithmClearStatus = {
  CHUNITHM_CLEAR_STATUS_UNSPECIFIED: 0,
  CHUNITHM_CLEAR_STATUS_FAILED: 1,
  CHUNITHM_CLEAR_STATUS_CLEAR: 2,
  CHUNITHM_CLEAR_STATUS_HARD: 3,
  CHUNITHM_CLEAR_STATUS_ABSOLUTE: 4,
  CHUNITHM_CLEAR_STATUS_ABSOLUTE_PLUS: 5,
  CHUNITHM_CLEAR_STATUS_CATASTROPHY: 6
};

/**
 * @enum {number}
 */
proto.mythos.chunithm.v0.ChunithmFullChainStatus = {
  CHUNITHM_FULL_CHAIN_STATUS_UNSPECIFIED: 0,
  CHUNITHM_FULL_CHAIN_STATUS_NONE: 1,
  CHUNITHM_FULL_CHAIN_STATUS_FULL_CHAIN_FC: 2,
  CHUNITHM_FULL_CHAIN_STATUS_FULL_CHAIN_AJ: 3
};

/**
 * @enum {number}
 */
proto.mythos.chunithm.v0.ChunithmLevel = {
  CHUNITHM_LEVEL_UNSPECIFIED: 0,
  CHUNITHM_LEVEL_BASIC: 1,
  CHUNITHM_LEVEL_ADVANCED: 2,
  CHUNITHM_LEVEL_EXPERT: 3,
  CHUNITHM_LEVEL_MASTER: 4,
  CHUNITHM_LEVEL_ULTIMA: 5,
  CHUNITHM_LEVEL_WORLDS_END: 6
};

/**
 * @enum {number}
 */
proto.mythos.chunithm.v0.ChunithmScoreRank = {
  CHUNITHM_SCORE_RANK_UNSPECIFIED: 0,
  CHUNITHM_SCORE_RANK_D: 1,
  CHUNITHM_SCORE_RANK_C: 2,
  CHUNITHM_SCORE_RANK_B: 3,
  CHUNITHM_SCORE_RANK_BB: 4,
  CHUNITHM_SCORE_RANK_BBB: 5,
  CHUNITHM_SCORE_RANK_A: 6,
  CHUNITHM_SCORE_RANK_AA: 7,
  CHUNITHM_SCORE_RANK_AAA: 8,
  CHUNITHM_SCORE_RANK_S: 9,
  CHUNITHM_SCORE_RANK_S_PLUS: 10,
  CHUNITHM_SCORE_RANK_SS: 11,
  CHUNITHM_SCORE_RANK_SS_PLUS: 12,
  CHUNITHM_SCORE_RANK_SSS: 13,
  CHUNITHM_SCORE_RANK_SSS_PLUS: 14
};

/**
 * @enum {number}
 */
proto.mythos.chunithm.v0.ChunithmComboStatus = {
  CHUNITHM_COMBO_STATUS_UNSPECIFIED: 0,
  CHUNITHM_COMBO_STATUS_NONE: 1,
  CHUNITHM_COMBO_STATUS_FULL_COMBO: 2,
  CHUNITHM_COMBO_STATUS_ALL_JUSTICE: 3,
  CHUNITHM_COMBO_STATUS_ALL_JUSTICE_CRITICAL: 4
};

goog.object.extend(exports, proto.mythos.chunithm.v0);
