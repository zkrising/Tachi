// package: mythos.chunithm.v0
// file: chunithm/playlog.proto

import * as jspb from "google-protobuf";
import * as chunithm_common_pb from "../chunithm/common_pb";

export class PlaylogInfo extends jspb.Message {
  getMusicId(): number;
  setMusicId(value: number): void;

  getLevel(): chunithm_common_pb.ChunithmLevelMap[keyof chunithm_common_pb.ChunithmLevelMap];
  setLevel(value: chunithm_common_pb.ChunithmLevelMap[keyof chunithm_common_pb.ChunithmLevelMap]): void;

  getScore(): number;
  setScore(value: number): void;

  getScoreRank(): chunithm_common_pb.ChunithmScoreRankMap[keyof chunithm_common_pb.ChunithmScoreRankMap];
  setScoreRank(value: chunithm_common_pb.ChunithmScoreRankMap[keyof chunithm_common_pb.ChunithmScoreRankMap]): void;

  getComboStatus(): chunithm_common_pb.ChunithmComboStatusMap[keyof chunithm_common_pb.ChunithmComboStatusMap];
  setComboStatus(value: chunithm_common_pb.ChunithmComboStatusMap[keyof chunithm_common_pb.ChunithmComboStatusMap]): void;

  getFullChainStatus(): chunithm_common_pb.ChunithmFullChainStatusMap[keyof chunithm_common_pb.ChunithmFullChainStatusMap];
  setFullChainStatus(value: chunithm_common_pb.ChunithmFullChainStatusMap[keyof chunithm_common_pb.ChunithmFullChainStatusMap]): void;

  getClearStatus(): chunithm_common_pb.ChunithmClearStatusMap[keyof chunithm_common_pb.ChunithmClearStatusMap];
  setClearStatus(value: chunithm_common_pb.ChunithmClearStatusMap[keyof chunithm_common_pb.ChunithmClearStatusMap]): void;

  getIsNewRecord(): boolean;
  setIsNewRecord(value: boolean): void;

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
    level: chunithm_common_pb.ChunithmLevelMap[keyof chunithm_common_pb.ChunithmLevelMap],
    score: number,
    scoreRank: chunithm_common_pb.ChunithmScoreRankMap[keyof chunithm_common_pb.ChunithmScoreRankMap],
    comboStatus: chunithm_common_pb.ChunithmComboStatusMap[keyof chunithm_common_pb.ChunithmComboStatusMap],
    fullChainStatus: chunithm_common_pb.ChunithmFullChainStatusMap[keyof chunithm_common_pb.ChunithmFullChainStatusMap],
    clearStatus: chunithm_common_pb.ChunithmClearStatusMap[keyof chunithm_common_pb.ChunithmClearStatusMap],
    isNewRecord: boolean,
    track: number,
    userPlayDate: string,
  }
}

export class PlaylogJudge extends jspb.Message {
  getJudgeHeaven(): number;
  setJudgeHeaven(value: number): void;

  getJudgeCritical(): number;
  setJudgeCritical(value: number): void;

  getJudgeJustice(): number;
  setJudgeJustice(value: number): void;

  getJudgeAttack(): number;
  setJudgeAttack(value: number): void;

  getJudgeMiss(): number;
  setJudgeMiss(value: number): void;

  getMaxCombo(): number;
  setMaxCombo(value: number): void;

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
    judgeHeaven: number,
    judgeCritical: number,
    judgeJustice: number,
    judgeAttack: number,
    judgeMiss: number,
    maxCombo: number,
  }
}

