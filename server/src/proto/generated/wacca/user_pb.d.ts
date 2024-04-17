// package: mythos.wacca.v0
// file: wacca/user.proto

import * as jspb from "google-protobuf";
import * as wacca_common_pb from "../wacca/common_pb";

export class DataRequest extends jspb.Message {
  getApiId(): string;
  setApiId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DataRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DataRequest): DataRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DataRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DataRequest;
  static deserializeBinaryFromReader(message: DataRequest, reader: jspb.BinaryReader): DataRequest;
}

export namespace DataRequest {
  export type AsObject = {
    apiId: string,
  }
}

export class DataResponse extends jspb.Message {
  getUserName(): string;
  setUserName(value: string): void;

  getExp(): number;
  setExp(value: number): void;

  getPoints(): number;
  setPoints(value: number): void;

  clearFavoriteMusicEntriesList(): void;
  getFavoriteMusicEntriesList(): Array<number>;
  setFavoriteMusicEntriesList(value: Array<number>): void;
  addFavoriteMusicEntries(value: number, index?: number): number;

  getVersionDataMap(): jspb.Map<number, DataResponse.VersionData>;
  clearVersionDataMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DataResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DataResponse): DataResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DataResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DataResponse;
  static deserializeBinaryFromReader(message: DataResponse, reader: jspb.BinaryReader): DataResponse;
}

export namespace DataResponse {
  export type AsObject = {
    userName: string,
    exp: number,
    points: number,
    favoriteMusicEntriesList: Array<number>,
    versionDataMap: Array<[number, DataResponse.VersionData.AsObject]>,
  }

  export class VersionData extends jspb.Message {
    getRank(): number;
    setRank(value: number): void;

    getDanRank(): number;
    setDanRank(value: number): void;

    getRating(): number;
    setRating(value: number): void;

    clearTitlePartIdsList(): void;
    getTitlePartIdsList(): Array<number>;
    setTitlePartIdsList(value: Array<number>): void;
    addTitlePartIds(value: number, index?: number): number;

    getLastAppVersion(): string;
    setLastAppVersion(value: string): void;

    hasLastSong(): boolean;
    clearLastSong(): void;
    getLastSong(): DataResponse.VersionData.LastSong | undefined;
    setLastSong(value?: DataResponse.VersionData.LastSong): void;

    getLastSongSort(): number;
    setLastSongSort(value: number): void;

    getLastFolder(): number;
    setLastFolder(value: number): void;

    getLastFolderSort(): number;
    setLastFolderSort(value: number): void;

    getLastBrowsedSongList(): string;
    setLastBrowsedSongList(value: string): void;

    getTutorialStateMap(): jspb.Map<number, boolean>;
    clearTutorialStateMap(): void;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): VersionData.AsObject;
    static toObject(includeInstance: boolean, msg: VersionData): VersionData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: VersionData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): VersionData;
    static deserializeBinaryFromReader(message: VersionData, reader: jspb.BinaryReader): VersionData;
  }

  export namespace VersionData {
    export type AsObject = {
      rank: number,
      danRank: number,
      rating: number,
      titlePartIdsList: Array<number>,
      lastAppVersion: string,
      lastSong?: DataResponse.VersionData.LastSong.AsObject,
      lastSongSort: number,
      lastFolder: number,
      lastFolderSort: number,
      lastBrowsedSongList: string,
      tutorialStateMap: Array<[number, boolean]>,
    }

    export class LastSong extends jspb.Message {
      getMusicId(): number;
      setMusicId(value: number): void;

      getMusicDifficulty(): wacca_common_pb.WaccaMusicDifficultyMap[keyof wacca_common_pb.WaccaMusicDifficultyMap];
      setMusicDifficulty(value: wacca_common_pb.WaccaMusicDifficultyMap[keyof wacca_common_pb.WaccaMusicDifficultyMap]): void;

      serializeBinary(): Uint8Array;
      toObject(includeInstance?: boolean): LastSong.AsObject;
      static toObject(includeInstance: boolean, msg: LastSong): LastSong.AsObject;
      static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
      static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
      static serializeBinaryToWriter(message: LastSong, writer: jspb.BinaryWriter): void;
      static deserializeBinary(bytes: Uint8Array): LastSong;
      static deserializeBinaryFromReader(message: LastSong, reader: jspb.BinaryReader): LastSong;
    }

    export namespace LastSong {
      export type AsObject = {
        musicId: number,
        musicDifficulty: wacca_common_pb.WaccaMusicDifficultyMap[keyof wacca_common_pb.WaccaMusicDifficultyMap],
      }
    }
  }
}

export class PlaylogRequest extends jspb.Message {
  getApiId(): string;
  setApiId(value: string): void;

  hasMusicId(): boolean;
  clearMusicId(): void;
  getMusicId(): number;
  setMusicId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlaylogRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PlaylogRequest): PlaylogRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlaylogRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlaylogRequest;
  static deserializeBinaryFromReader(message: PlaylogRequest, reader: jspb.BinaryReader): PlaylogRequest;
}

export namespace PlaylogRequest {
  export type AsObject = {
    apiId: string,
    musicId: number,
  }
}

export class PlaylogStreamItem extends jspb.Message {
  getPlaylogApiId(): string;
  setPlaylogApiId(value: string): void;

  hasInfo(): boolean;
  clearInfo(): void;
  getInfo(): PlaylogInfo | undefined;
  setInfo(value?: PlaylogInfo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlaylogStreamItem.AsObject;
  static toObject(includeInstance: boolean, msg: PlaylogStreamItem): PlaylogStreamItem.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlaylogStreamItem, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlaylogStreamItem;
  static deserializeBinaryFromReader(message: PlaylogStreamItem, reader: jspb.BinaryReader): PlaylogStreamItem;
}

export namespace PlaylogStreamItem {
  export type AsObject = {
    playlogApiId: string,
    info?: PlaylogInfo.AsObject,
  }
}

export class PlaylogInfo extends jspb.Message {
  getMusicId(): number;
  setMusicId(value: number): void;

  getMusicDifficulty(): wacca_common_pb.WaccaMusicDifficultyMap[keyof wacca_common_pb.WaccaMusicDifficultyMap];
  setMusicDifficulty(value: wacca_common_pb.WaccaMusicDifficultyMap[keyof wacca_common_pb.WaccaMusicDifficultyMap]): void;

  getScore(): number;
  setScore(value: number): void;

  getGrade(): wacca_common_pb.WaccaMusicScoreGradeMap[keyof wacca_common_pb.WaccaMusicScoreGradeMap];
  setGrade(value: wacca_common_pb.WaccaMusicScoreGradeMap[keyof wacca_common_pb.WaccaMusicScoreGradeMap]): void;

  hasJudge(): boolean;
  clearJudge(): void;
  getJudge(): wacca_common_pb.WaccaJudge | undefined;
  setJudge(value?: wacca_common_pb.WaccaJudge): void;

  hasClearStatus(): boolean;
  clearClearStatus(): void;
  getClearStatus(): wacca_common_pb.WaccaClearStatus | undefined;
  setClearStatus(value?: wacca_common_pb.WaccaClearStatus): void;

  getIsNewRecord(): boolean;
  setIsNewRecord(value: boolean): void;

  getCombo(): number;
  setCombo(value: number): void;

  getSkillPoints(): number;
  setSkillPoints(value: number): void;

  getFast(): number;
  setFast(value: number): void;

  getLate(): number;
  setLate(value: number): void;

  getUserPlayMode(): wacca_common_pb.WaccaPlayModeMap[keyof wacca_common_pb.WaccaPlayModeMap];
  setUserPlayMode(value: wacca_common_pb.WaccaPlayModeMap[keyof wacca_common_pb.WaccaPlayModeMap]): void;

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
    musicDifficulty: wacca_common_pb.WaccaMusicDifficultyMap[keyof wacca_common_pb.WaccaMusicDifficultyMap],
    score: number,
    grade: wacca_common_pb.WaccaMusicScoreGradeMap[keyof wacca_common_pb.WaccaMusicScoreGradeMap],
    judge?: wacca_common_pb.WaccaJudge.AsObject,
    clearStatus?: wacca_common_pb.WaccaClearStatus.AsObject,
    isNewRecord: boolean,
    combo: number,
    skillPoints: number,
    fast: number,
    late: number,
    userPlayMode: wacca_common_pb.WaccaPlayModeMap[keyof wacca_common_pb.WaccaPlayModeMap],
    track: number,
    userPlayDate: string,
  }
}

