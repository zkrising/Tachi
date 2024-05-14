// package: mythos.ongeki.v0
// file: ongeki/playlog.proto

import * as jspb from "google-protobuf";
import * as ongeki_common_pb from "../ongeki/common_pb";

export class PlaylogInfo extends jspb.Message {
  getMusicId(): number;
  setMusicId(value: number): void;

  getLevel(): ongeki_common_pb.OngekiLevelMap[keyof ongeki_common_pb.OngekiLevelMap];
  setLevel(value: ongeki_common_pb.OngekiLevelMap[keyof ongeki_common_pb.OngekiLevelMap]): void;

  getTechScore(): number;
  setTechScore(value: number): void;

  getBattleScore(): number;
  setBattleScore(value: number): void;

  getOverDamage(): number;
  setOverDamage(value: number): void;

  getPlatinumScore(): number;
  setPlatinumScore(value: number): void;

  getTechScoreRank(): ongeki_common_pb.OngekiTechScoreRankMap[keyof ongeki_common_pb.OngekiTechScoreRankMap];
  setTechScoreRank(value: ongeki_common_pb.OngekiTechScoreRankMap[keyof ongeki_common_pb.OngekiTechScoreRankMap]): void;

  getBattleScoreRank(): ongeki_common_pb.OngekiBattleScoreRankMap[keyof ongeki_common_pb.OngekiBattleScoreRankMap];
  setBattleScoreRank(value: ongeki_common_pb.OngekiBattleScoreRankMap[keyof ongeki_common_pb.OngekiBattleScoreRankMap]): void;

  getComboStatus(): ongeki_common_pb.OngekiComboStatusMap[keyof ongeki_common_pb.OngekiComboStatusMap];
  setComboStatus(value: ongeki_common_pb.OngekiComboStatusMap[keyof ongeki_common_pb.OngekiComboStatusMap]): void;

  getClearStatus(): ongeki_common_pb.OngekiClearStatusMap[keyof ongeki_common_pb.OngekiClearStatusMap];
  setClearStatus(value: ongeki_common_pb.OngekiClearStatusMap[keyof ongeki_common_pb.OngekiClearStatusMap]): void;

  getIsFullBell(): boolean;
  setIsFullBell(value: boolean): void;

  getIsTechNewRecord(): boolean;
  setIsTechNewRecord(value: boolean): void;

  getIsBattleNewRecord(): boolean;
  setIsBattleNewRecord(value: boolean): void;

  getIsOverDamageNewRecord(): boolean;
  setIsOverDamageNewRecord(value: boolean): void;

  getUserPlayDate(): string;
  setUserPlayDate(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlaylogInfo.AsObject;
  static toObject(includeInstance: boolean, msg: PlaylogInfo): PlaylogInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlaylogInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlaylogInfo;
  static deserializeBinaryFromReader(message: PlaylogInfo, reader: jspb.BinaryReader): PlaylogInfo;
}

export namespace PlaylogInfo {
  export type AsObject = {
    musicId: number,
    level: ongeki_common_pb.OngekiLevelMap[keyof ongeki_common_pb.OngekiLevelMap],
    techScore: number,
    battleScore: number,
    overDamage: number,
    platinumScore: number,
    techScoreRank: ongeki_common_pb.OngekiTechScoreRankMap[keyof ongeki_common_pb.OngekiTechScoreRankMap],
    battleScoreRank: ongeki_common_pb.OngekiBattleScoreRankMap[keyof ongeki_common_pb.OngekiBattleScoreRankMap],
    comboStatus: ongeki_common_pb.OngekiComboStatusMap[keyof ongeki_common_pb.OngekiComboStatusMap],
    clearStatus: ongeki_common_pb.OngekiClearStatusMap[keyof ongeki_common_pb.OngekiClearStatusMap],
    isFullBell: boolean,
    isTechNewRecord: boolean,
    isBattleNewRecord: boolean,
    isOverDamageNewRecord: boolean,
    userPlayDate: string,
  }
}

export class PlaylogJudge extends jspb.Message {
  getJudgeCriticalBreak(): number;
  setJudgeCriticalBreak(value: number): void;

  getJudgeBreak(): number;
  setJudgeBreak(value: number): void;

  getJudgeHit(): number;
  setJudgeHit(value: number): void;

  getJudgeMiss(): number;
  setJudgeMiss(value: number): void;

  getMaxCombo(): number;
  setMaxCombo(value: number): void;

  getBellCount(): number;
  setBellCount(value: number): void;

  getTotalBellCount(): number;
  setTotalBellCount(value: number): void;

  getDamageCount(): number;
  setDamageCount(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlaylogJudge.AsObject;
  static toObject(includeInstance: boolean, msg: PlaylogJudge): PlaylogJudge.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlaylogJudge, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlaylogJudge;
  static deserializeBinaryFromReader(message: PlaylogJudge, reader: jspb.BinaryReader): PlaylogJudge;
}

export namespace PlaylogJudge {
  export type AsObject = {
    judgeCriticalBreak: number,
    judgeBreak: number,
    judgeHit: number,
    judgeMiss: number,
    maxCombo: number,
    bellCount: number,
    totalBellCount: number,
    damageCount: number,
  }
}

export class PlaylogJudgeRate extends jspb.Message {
  getRateTap(): number;
  setRateTap(value: number): void;

  getRateHold(): number;
  setRateHold(value: number): void;

  getRateFlick(): number;
  setRateFlick(value: number): void;

  getRateSideTap(): number;
  setRateSideTap(value: number): void;

  getRateSideHold(): number;
  setRateSideHold(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlaylogJudgeRate.AsObject;
  static toObject(includeInstance: boolean, msg: PlaylogJudgeRate): PlaylogJudgeRate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlaylogJudgeRate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlaylogJudgeRate;
  static deserializeBinaryFromReader(message: PlaylogJudgeRate, reader: jspb.BinaryReader): PlaylogJudgeRate;
}

export namespace PlaylogJudgeRate {
  export type AsObject = {
    rateTap: number,
    rateHold: number,
    rateFlick: number,
    rateSideTap: number,
    rateSideHold: number,
  }
}

export class PlaylogMatchingUser extends jspb.Message {
  getUserName(): string;
  setUserName(value: string): void;

  getMusicLevel(): ongeki_common_pb.OngekiLevelMap[keyof ongeki_common_pb.OngekiLevelMap];
  setMusicLevel(value: ongeki_common_pb.OngekiLevelMap[keyof ongeki_common_pb.OngekiLevelMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlaylogMatchingUser.AsObject;
  static toObject(includeInstance: boolean, msg: PlaylogMatchingUser): PlaylogMatchingUser.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlaylogMatchingUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlaylogMatchingUser;
  static deserializeBinaryFromReader(message: PlaylogMatchingUser, reader: jspb.BinaryReader): PlaylogMatchingUser;
}

export namespace PlaylogMatchingUser {
  export type AsObject = {
    userName: string,
    musicLevel: ongeki_common_pb.OngekiLevelMap[keyof ongeki_common_pb.OngekiLevelMap],
  }
}

export class PlaylogCard extends jspb.Message {
  getCardId(): number;
  setCardId(value: number): void;

  getCardLevel(): number;
  setCardLevel(value: number): void;

  getCardAttack(): number;
  setCardAttack(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlaylogCard.AsObject;
  static toObject(includeInstance: boolean, msg: PlaylogCard): PlaylogCard.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlaylogCard, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlaylogCard;
  static deserializeBinaryFromReader(message: PlaylogCard, reader: jspb.BinaryReader): PlaylogCard;
}

export namespace PlaylogCard {
  export type AsObject = {
    cardId: number,
    cardLevel: number,
    cardAttack: number,
  }
}

export class PlaylogBoss extends jspb.Message {
  getBossId(): number;
  setBossId(value: number): void;

  getBossLevel(): number;
  setBossLevel(value: number): void;

  getBossAttribute(): ongeki_common_pb.OngekiBossAttributeMap[keyof ongeki_common_pb.OngekiBossAttributeMap];
  setBossAttribute(value: ongeki_common_pb.OngekiBossAttributeMap[keyof ongeki_common_pb.OngekiBossAttributeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlaylogBoss.AsObject;
  static toObject(includeInstance: boolean, msg: PlaylogBoss): PlaylogBoss.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlaylogBoss, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlaylogBoss;
  static deserializeBinaryFromReader(message: PlaylogBoss, reader: jspb.BinaryReader): PlaylogBoss;
}

export namespace PlaylogBoss {
  export type AsObject = {
    bossId: number,
    bossLevel: number,
    bossAttribute: ongeki_common_pb.OngekiBossAttributeMap[keyof ongeki_common_pb.OngekiBossAttributeMap],
  }
}

export class PlaylogEvent extends jspb.Message {
  getEventId(): number;
  setEventId(value: number): void;

  getEventName(): string;
  setEventName(value: string): void;

  getEventPoint(): number;
  setEventPoint(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlaylogEvent.AsObject;
  static toObject(includeInstance: boolean, msg: PlaylogEvent): PlaylogEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlaylogEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlaylogEvent;
  static deserializeBinaryFromReader(message: PlaylogEvent, reader: jspb.BinaryReader): PlaylogEvent;
}

export namespace PlaylogEvent {
  export type AsObject = {
    eventId: number,
    eventName: string,
    eventPoint: number,
  }
}

