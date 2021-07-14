import { FileUploadImportTypes, IRImportTypes, APIImportTypes, ImportTypes, Game, Playtypes } from "..";
export declare const fileImportTypes: FileUploadImportTypes[];
export declare const irImportTypes: IRImportTypes[];
export declare const apiImportTypes: APIImportTypes[];
export declare const allImportTypes: ImportTypes[];
export declare const allSupportedGames: Game[];
export interface ServerConfig {
    name: string;
    supportedGames: Game[];
    supportedImportTypes: ImportTypes[];
}
export declare const KTCHI_CONFIG: ServerConfig;
export declare const BTCHI_CONFIG: ServerConfig;
export declare const OMNI_CONFIG: ServerConfig;
export declare function FormatGame(game: Game, playtype: Playtypes[Game]): string;
