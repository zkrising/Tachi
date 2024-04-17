// package: mythos.wacca.v0
// file: wacca/common.proto

import * as jspb from "google-protobuf";

export class WaccaClearStatus extends jspb.Message {
  getIsClear(): boolean;
  setIsClear(value: boolean): void;

  getIsMissless(): boolean;
  setIsMissless(value: boolean): void;

  getIsFullCombo(): boolean;
  setIsFullCombo(value: boolean): void;

  getIsAllMarvelous(): boolean;
  setIsAllMarvelous(value: boolean): void;

  getIsGiveUp(): boolean;
  setIsGiveUp(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WaccaClearStatus.AsObject;
  static toObject(includeInstance: boolean, msg: WaccaClearStatus): WaccaClearStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WaccaClearStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WaccaClearStatus;
  static deserializeBinaryFromReader(message: WaccaClearStatus, reader: jspb.BinaryReader): WaccaClearStatus;
}

export namespace WaccaClearStatus {
  export type AsObject = {
    isClear: boolean,
    isMissless: boolean,
    isFullCombo: boolean,
    isAllMarvelous: boolean,
    isGiveUp: boolean,
  }
}

export class WaccaJudge extends jspb.Message {
  getMarvelous(): number;
  setMarvelous(value: number): void;

  getGreat(): number;
  setGreat(value: number): void;

  getGood(): number;
  setGood(value: number): void;

  getMiss(): number;
  setMiss(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WaccaJudge.AsObject;
  static toObject(includeInstance: boolean, msg: WaccaJudge): WaccaJudge.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WaccaJudge, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WaccaJudge;
  static deserializeBinaryFromReader(message: WaccaJudge, reader: jspb.BinaryReader): WaccaJudge;
}

export namespace WaccaJudge {
  export type AsObject = {
    marvelous: number,
    great: number,
    good: number,
    miss: number,
  }
}

export interface WaccaMusicDifficultyMap {
  WACCA_MUSIC_DIFFICULTY_UNSPECIFIED: 0;
  WACCA_MUSIC_DIFFICULTY_NORMAL: 1;
  WACCA_MUSIC_DIFFICULTY_HARD: 2;
  WACCA_MUSIC_DIFFICULTY_EXPERT: 3;
  WACCA_MUSIC_DIFFICULTY_INFERNO: 4;
}

export const WaccaMusicDifficulty: WaccaMusicDifficultyMap;

export interface WaccaMusicScoreGradeMap {
  WACCA_MUSIC_SCORE_GRADE_UNSPECIFIED: 0;
  WACCA_MUSIC_SCORE_GRADE_D: 1;
  WACCA_MUSIC_SCORE_GRADE_C: 2;
  WACCA_MUSIC_SCORE_GRADE_B: 3;
  WACCA_MUSIC_SCORE_GRADE_A: 4;
  WACCA_MUSIC_SCORE_GRADE_AA: 5;
  WACCA_MUSIC_SCORE_GRADE_AAA: 6;
  WACCA_MUSIC_SCORE_GRADE_S: 7;
  WACCA_MUSIC_SCORE_GRADE_S_PLUS: 8;
  WACCA_MUSIC_SCORE_GRADE_SS: 9;
  WACCA_MUSIC_SCORE_GRADE_SS_PLUS: 10;
  WACCA_MUSIC_SCORE_GRADE_SSS: 11;
  WACCA_MUSIC_SCORE_GRADE_SSS_PLUS: 12;
  WACCA_MUSIC_SCORE_GRADE_MASTER: 13;
}

export const WaccaMusicScoreGrade: WaccaMusicScoreGradeMap;

export interface WaccaPlayModeMap {
  WACCA_PLAY_MODE_UNSPECIFIED: 0;
  WACCA_PLAY_MODE_SINGLE: 1;
  WACCA_PLAY_MODE_VERSUS: 2;
  WACCA_PLAY_MODE_CO_OP: 3;
}

export const WaccaPlayMode: WaccaPlayModeMap;

