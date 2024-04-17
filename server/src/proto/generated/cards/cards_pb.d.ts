// package: mythos.cards.v0
// file: cards/cards.proto

import * as jspb from "google-protobuf";

export class LookupRequest extends jspb.Message {
  getAccessCode(): string;
  setAccessCode(value: string): void;

  clearTitlesList(): void;
  getTitlesList(): Array<string>;
  setTitlesList(value: Array<string>): void;
  addTitles(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LookupRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LookupRequest): LookupRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LookupRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LookupRequest;
  static deserializeBinaryFromReader(message: LookupRequest, reader: jspb.BinaryReader): LookupRequest;
}

export namespace LookupRequest {
  export type AsObject = {
    accessCode: string,
    titlesList: Array<string>,
  }
}

export class LookupResponse extends jspb.Message {
  getPlayerApiId(): string;
  setPlayerApiId(value: string): void;

  clearTitlesList(): void;
  getTitlesList(): Array<LookupResponse.TitleEntry>;
  setTitlesList(value: Array<LookupResponse.TitleEntry>): void;
  addTitles(value?: LookupResponse.TitleEntry, index?: number): LookupResponse.TitleEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LookupResponse.AsObject;
  static toObject(includeInstance: boolean, msg: LookupResponse): LookupResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LookupResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LookupResponse;
  static deserializeBinaryFromReader(message: LookupResponse, reader: jspb.BinaryReader): LookupResponse;
}

export namespace LookupResponse {
  export type AsObject = {
    playerApiId: string,
    titlesList: Array<LookupResponse.TitleEntry.AsObject>,
  }

  export class TitleEntry extends jspb.Message {
    getTitleKind(): string;
    setTitleKind(value: string): void;

    getTitleApiId(): string;
    setTitleApiId(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TitleEntry.AsObject;
    static toObject(includeInstance: boolean, msg: TitleEntry): TitleEntry.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TitleEntry, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TitleEntry;
    static deserializeBinaryFromReader(message: TitleEntry, reader: jspb.BinaryReader): TitleEntry;
  }

  export namespace TitleEntry {
    export type AsObject = {
      titleKind: string,
      titleApiId: string,
    }
  }
}

