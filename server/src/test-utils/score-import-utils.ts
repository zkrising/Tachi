import { KTBlackImportDocument } from "kamaitachi-common";

export function GetUnsuccessfulScores(importDoc: KTBlackImportDocument) {
    return importDoc.importInfo.filter((e) => !e.success).length;
}
