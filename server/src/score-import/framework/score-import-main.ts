import {
    IDStrings,
    ImportDocument,
    ImportTypes,
    KTBlackImportDocument,
    PublicUserDocument,
} from "kamaitachi-common";
import { createScoreLogger } from "../../logger";
import { ConverterFunction } from "../../types";
import { InsertQueue } from "./core/insert-score";
import { ImportAllIterableData } from "./importing/score-importing";
import crypto from "crypto";

export default async function ScoreImportMain<D, C>(
    user: PublicUserDocument,
    importType: ImportTypes,
    idStrings: IDStrings[],
    iterableData: Iterable<D> | AsyncIterable<D>,
    ConverterFunction: ConverterFunction<D, C>,
    context: C
) {
    const importID = crypto.randomBytes(20).toString("hex");

    const logger = createScoreLogger(user, importID);

    // @todo: scope logger properly
    logger.verbose("Received import request.");

    let importInfo = await ImportAllIterableData(user.id, iterableData, ConverterFunction, context);

    // Empty anything in the score queue
    await InsertQueue();

    // Update user's rating information
    // @todo

    // Construct sessions from successful scores
    // @todo

    // Create import document
    const ImportDocument: KTBlackImportDocument = {
        importType,
        idStrings: idStrings,
    };
}
