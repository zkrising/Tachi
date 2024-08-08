// package: mythos.maimai.v0
// file: maimai/playlog.proto

import * as jspb from "google-protobuf";
import * as maimai_common_pb from "../maimai/common_pb";

export class PlaylogInfo extends jspb.Message {
  getMusicId(): number;
  setMusicId(value: number): void;

  getLevel(): maimai_common_pb.MaimaiLevelMap[keyof maimai_common_pb.MaimaiLevelMap];
  setLevel(value: maimai_common_pb.MaimaiLevelMap[keyof maimai_common_pb.MaimaiLevelMap]): void;

  getAchievement(): number;
  setAchievement(value: number): void;

  getDeluxscore(): number;
  setDeluxscore(value: number): void;

  getScoreRank(): maimai_common_pb.MaimaiScoreRankMap[keyof maimai_common_pb.MaimaiScoreRankMap];
  setScoreRank(value: maimai_common_pb.MaimaiScoreRankMap[keyof maimai_common_pb.MaimaiScoreRankMap]): void;

  getComboStatus(): maimai_common_pb.MaimaiComboStatusMap[keyof maimai_common_pb.MaimaiComboStatusMap];
  setComboStatus(value: maimai_common_pb.MaimaiComboStatusMap[keyof maimai_common_pb.MaimaiComboStatusMap]): void;

  getSyncStatus(): maimai_common_pb.MaimaiSyncStatusMap[keyof maimai_common_pb.MaimaiSyncStatusMap];
  setSyncStatus(value: maimai_common_pb.MaimaiSyncStatusMap[keyof maimai_common_pb.MaimaiSyncStatusMap]): void;

  getIsClear(): boolean;
  setIsClear(value: boolean): void;

  getIsAchieveNewRecord(): boolean;
  setIsAchieveNewRecord(value: boolean): void;

  getIsDeluxscoreNewRecord(): boolean;
  setIsDeluxscoreNewRecord(value: boolean): void;

  getTrack(): number;
  setTrack(value: number): void;

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
    level: maimai_common_pb.MaimaiLevelMap[keyof maimai_common_pb.MaimaiLevelMap],
    achievement: number,
    deluxscore: number,
    scoreRank: maimai_common_pb.MaimaiScoreRankMap[keyof maimai_common_pb.MaimaiScoreRankMap],
    comboStatus: maimai_common_pb.MaimaiComboStatusMap[keyof maimai_common_pb.MaimaiComboStatusMap],
    syncStatus: maimai_common_pb.MaimaiSyncStatusMap[keyof maimai_common_pb.MaimaiSyncStatusMap],
    isClear: boolean,
    isAchieveNewRecord: boolean,
    isDeluxscoreNewRecord: boolean,
    track: number,
    userPlayDate: string,
  }
}

export class PlaylogJudge extends jspb.Message {
  getJudgeCriticalPerfect(): number;
  setJudgeCriticalPerfect(value: number): void;

  getJudgePerfect(): number;
  setJudgePerfect(value: number): void;

  getJudgeGreat(): number;
  setJudgeGreat(value: number): void;

  getJudgeGood(): number;
  setJudgeGood(value: number): void;

  getJudgeMiss(): number;
  setJudgeMiss(value: number): void;

  getMaxCombo(): number;
  setMaxCombo(value: number): void;

  getFastCount(): number;
  setFastCount(value: number): void;

  getLateCount(): number;
  setLateCount(value: number): void;

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
    judgeCriticalPerfect: number,
    judgePerfect: number,
    judgeGreat: number,
    judgeGood: number,
    judgeMiss: number,
    maxCombo: number,
    fastCount: number,
    lateCount: number,
  }
}

