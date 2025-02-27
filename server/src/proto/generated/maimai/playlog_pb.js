// source: maimai/playlog.proto
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

var maimai_common_pb = require('../maimai/common_pb.js');
goog.object.extend(proto, maimai_common_pb);
goog.exportSymbol('proto.mythos.maimai.v0.PlaylogInfo', null, global);
goog.exportSymbol('proto.mythos.maimai.v0.PlaylogJudge', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.mythos.maimai.v0.PlaylogInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.mythos.maimai.v0.PlaylogInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.mythos.maimai.v0.PlaylogInfo.displayName = 'proto.mythos.maimai.v0.PlaylogInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.mythos.maimai.v0.PlaylogJudge = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.mythos.maimai.v0.PlaylogJudge, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.mythos.maimai.v0.PlaylogJudge.displayName = 'proto.mythos.maimai.v0.PlaylogJudge';
}



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.mythos.maimai.v0.PlaylogInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.mythos.maimai.v0.PlaylogInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.mythos.maimai.v0.PlaylogInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    musicId: jspb.Message.getFieldWithDefault(msg, 1, 0),
    level: jspb.Message.getFieldWithDefault(msg, 2, 0),
    achievement: jspb.Message.getFieldWithDefault(msg, 3, 0),
    deluxscore: jspb.Message.getFieldWithDefault(msg, 4, 0),
    scoreRank: jspb.Message.getFieldWithDefault(msg, 5, 0),
    comboStatus: jspb.Message.getFieldWithDefault(msg, 6, 0),
    syncStatus: jspb.Message.getFieldWithDefault(msg, 7, 0),
    isClear: jspb.Message.getBooleanFieldWithDefault(msg, 8, false),
    isAchieveNewRecord: jspb.Message.getBooleanFieldWithDefault(msg, 9, false),
    isDeluxscoreNewRecord: jspb.Message.getBooleanFieldWithDefault(msg, 10, false),
    track: jspb.Message.getFieldWithDefault(msg, 11, 0),
    userPlayDate: jspb.Message.getFieldWithDefault(msg, 12, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.mythos.maimai.v0.PlaylogInfo}
 */
proto.mythos.maimai.v0.PlaylogInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.mythos.maimai.v0.PlaylogInfo;
  return proto.mythos.maimai.v0.PlaylogInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.mythos.maimai.v0.PlaylogInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.mythos.maimai.v0.PlaylogInfo}
 */
proto.mythos.maimai.v0.PlaylogInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setMusicId(value);
      break;
    case 2:
      var value = /** @type {!proto.mythos.maimai.v0.MaimaiLevel} */ (reader.readEnum());
      msg.setLevel(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setAchievement(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setDeluxscore(value);
      break;
    case 5:
      var value = /** @type {!proto.mythos.maimai.v0.MaimaiScoreRank} */ (reader.readEnum());
      msg.setScoreRank(value);
      break;
    case 6:
      var value = /** @type {!proto.mythos.maimai.v0.MaimaiComboStatus} */ (reader.readEnum());
      msg.setComboStatus(value);
      break;
    case 7:
      var value = /** @type {!proto.mythos.maimai.v0.MaimaiSyncStatus} */ (reader.readEnum());
      msg.setSyncStatus(value);
      break;
    case 8:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsClear(value);
      break;
    case 9:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsAchieveNewRecord(value);
      break;
    case 10:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsDeluxscoreNewRecord(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTrack(value);
      break;
    case 12:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserPlayDate(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.mythos.maimai.v0.PlaylogInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.mythos.maimai.v0.PlaylogInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.mythos.maimai.v0.PlaylogInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMusicId();
  if (f !== 0) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = message.getLevel();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getAchievement();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getDeluxscore();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getScoreRank();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getComboStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getSyncStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      7,
      f
    );
  }
  f = message.getIsClear();
  if (f) {
    writer.writeBool(
      8,
      f
    );
  }
  f = message.getIsAchieveNewRecord();
  if (f) {
    writer.writeBool(
      9,
      f
    );
  }
  f = message.getIsDeluxscoreNewRecord();
  if (f) {
    writer.writeBool(
      10,
      f
    );
  }
  f = message.getTrack();
  if (f !== 0) {
    writer.writeInt32(
      11,
      f
    );
  }
  f = message.getUserPlayDate();
  if (f.length > 0) {
    writer.writeString(
      12,
      f
    );
  }
};


/**
 * optional int32 music_id = 1;
 * @return {number}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.getMusicId = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.mythos.maimai.v0.PlaylogInfo} returns this
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.setMusicId = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional MaimaiLevel level = 2;
 * @return {!proto.mythos.maimai.v0.MaimaiLevel}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.getLevel = function() {
  return /** @type {!proto.mythos.maimai.v0.MaimaiLevel} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.mythos.maimai.v0.MaimaiLevel} value
 * @return {!proto.mythos.maimai.v0.PlaylogInfo} returns this
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.setLevel = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional int32 achievement = 3;
 * @return {number}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.getAchievement = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.mythos.maimai.v0.PlaylogInfo} returns this
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.setAchievement = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int32 deluxscore = 4;
 * @return {number}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.getDeluxscore = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.mythos.maimai.v0.PlaylogInfo} returns this
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.setDeluxscore = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional MaimaiScoreRank score_rank = 5;
 * @return {!proto.mythos.maimai.v0.MaimaiScoreRank}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.getScoreRank = function() {
  return /** @type {!proto.mythos.maimai.v0.MaimaiScoreRank} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.mythos.maimai.v0.MaimaiScoreRank} value
 * @return {!proto.mythos.maimai.v0.PlaylogInfo} returns this
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.setScoreRank = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional MaimaiComboStatus combo_status = 6;
 * @return {!proto.mythos.maimai.v0.MaimaiComboStatus}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.getComboStatus = function() {
  return /** @type {!proto.mythos.maimai.v0.MaimaiComboStatus} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.mythos.maimai.v0.MaimaiComboStatus} value
 * @return {!proto.mythos.maimai.v0.PlaylogInfo} returns this
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.setComboStatus = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional MaimaiSyncStatus sync_status = 7;
 * @return {!proto.mythos.maimai.v0.MaimaiSyncStatus}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.getSyncStatus = function() {
  return /** @type {!proto.mythos.maimai.v0.MaimaiSyncStatus} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {!proto.mythos.maimai.v0.MaimaiSyncStatus} value
 * @return {!proto.mythos.maimai.v0.PlaylogInfo} returns this
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.setSyncStatus = function(value) {
  return jspb.Message.setProto3EnumField(this, 7, value);
};


/**
 * optional bool is_clear = 8;
 * @return {boolean}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.getIsClear = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 8, false));
};


/**
 * @param {boolean} value
 * @return {!proto.mythos.maimai.v0.PlaylogInfo} returns this
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.setIsClear = function(value) {
  return jspb.Message.setProto3BooleanField(this, 8, value);
};


/**
 * optional bool is_achieve_new_record = 9;
 * @return {boolean}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.getIsAchieveNewRecord = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 9, false));
};


/**
 * @param {boolean} value
 * @return {!proto.mythos.maimai.v0.PlaylogInfo} returns this
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.setIsAchieveNewRecord = function(value) {
  return jspb.Message.setProto3BooleanField(this, 9, value);
};


/**
 * optional bool is_deluxscore_new_record = 10;
 * @return {boolean}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.getIsDeluxscoreNewRecord = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 10, false));
};


/**
 * @param {boolean} value
 * @return {!proto.mythos.maimai.v0.PlaylogInfo} returns this
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.setIsDeluxscoreNewRecord = function(value) {
  return jspb.Message.setProto3BooleanField(this, 10, value);
};


/**
 * optional int32 track = 11;
 * @return {number}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.getTrack = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 11, 0));
};


/**
 * @param {number} value
 * @return {!proto.mythos.maimai.v0.PlaylogInfo} returns this
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.setTrack = function(value) {
  return jspb.Message.setProto3IntField(this, 11, value);
};


/**
 * optional string user_play_date = 12;
 * @return {string}
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.getUserPlayDate = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 12, ""));
};


/**
 * @param {string} value
 * @return {!proto.mythos.maimai.v0.PlaylogInfo} returns this
 */
proto.mythos.maimai.v0.PlaylogInfo.prototype.setUserPlayDate = function(value) {
  return jspb.Message.setProto3StringField(this, 12, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.toObject = function(opt_includeInstance) {
  return proto.mythos.maimai.v0.PlaylogJudge.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.mythos.maimai.v0.PlaylogJudge} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.mythos.maimai.v0.PlaylogJudge.toObject = function(includeInstance, msg) {
  var f, obj = {
    judgeCriticalPerfect: jspb.Message.getFieldWithDefault(msg, 1, 0),
    judgePerfect: jspb.Message.getFieldWithDefault(msg, 2, 0),
    judgeGreat: jspb.Message.getFieldWithDefault(msg, 3, 0),
    judgeGood: jspb.Message.getFieldWithDefault(msg, 4, 0),
    judgeMiss: jspb.Message.getFieldWithDefault(msg, 5, 0),
    maxCombo: jspb.Message.getFieldWithDefault(msg, 6, 0),
    fastCount: jspb.Message.getFieldWithDefault(msg, 7, 0),
    lateCount: jspb.Message.getFieldWithDefault(msg, 8, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.mythos.maimai.v0.PlaylogJudge}
 */
proto.mythos.maimai.v0.PlaylogJudge.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.mythos.maimai.v0.PlaylogJudge;
  return proto.mythos.maimai.v0.PlaylogJudge.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.mythos.maimai.v0.PlaylogJudge} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.mythos.maimai.v0.PlaylogJudge}
 */
proto.mythos.maimai.v0.PlaylogJudge.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setJudgeCriticalPerfect(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setJudgePerfect(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setJudgeGreat(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setJudgeGood(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setJudgeMiss(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setMaxCombo(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setFastCount(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLateCount(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.mythos.maimai.v0.PlaylogJudge.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.mythos.maimai.v0.PlaylogJudge} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.mythos.maimai.v0.PlaylogJudge.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getJudgeCriticalPerfect();
  if (f !== 0) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = message.getJudgePerfect();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getJudgeGreat();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getJudgeGood();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getJudgeMiss();
  if (f !== 0) {
    writer.writeInt32(
      5,
      f
    );
  }
  f = message.getMaxCombo();
  if (f !== 0) {
    writer.writeInt32(
      6,
      f
    );
  }
  f = message.getFastCount();
  if (f !== 0) {
    writer.writeInt32(
      7,
      f
    );
  }
  f = message.getLateCount();
  if (f !== 0) {
    writer.writeInt32(
      8,
      f
    );
  }
};


/**
 * optional int32 judge_critical_perfect = 1;
 * @return {number}
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.getJudgeCriticalPerfect = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.mythos.maimai.v0.PlaylogJudge} returns this
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.setJudgeCriticalPerfect = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional int32 judge_perfect = 2;
 * @return {number}
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.getJudgePerfect = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.mythos.maimai.v0.PlaylogJudge} returns this
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.setJudgePerfect = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional int32 judge_great = 3;
 * @return {number}
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.getJudgeGreat = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.mythos.maimai.v0.PlaylogJudge} returns this
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.setJudgeGreat = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int32 judge_good = 4;
 * @return {number}
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.getJudgeGood = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.mythos.maimai.v0.PlaylogJudge} returns this
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.setJudgeGood = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional int32 judge_miss = 5;
 * @return {number}
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.getJudgeMiss = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.mythos.maimai.v0.PlaylogJudge} returns this
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.setJudgeMiss = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional int32 max_combo = 6;
 * @return {number}
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.getMaxCombo = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.mythos.maimai.v0.PlaylogJudge} returns this
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.setMaxCombo = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};


/**
 * optional int32 fast_count = 7;
 * @return {number}
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.getFastCount = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {number} value
 * @return {!proto.mythos.maimai.v0.PlaylogJudge} returns this
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.setFastCount = function(value) {
  return jspb.Message.setProto3IntField(this, 7, value);
};


/**
 * optional int32 late_count = 8;
 * @return {number}
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.getLateCount = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {number} value
 * @return {!proto.mythos.maimai.v0.PlaylogJudge} returns this
 */
proto.mythos.maimai.v0.PlaylogJudge.prototype.setLateCount = function(value) {
  return jspb.Message.setProto3IntField(this, 8, value);
};


goog.object.extend(exports, proto.mythos.maimai.v0);
