import { ConverterFunction, integer } from "../../types";
import { InsertQueue } from "./core/insert-score";
import { ProcessIterableData } from "./processing/score-processor";

async function ScoreImportMain<D, C>(
    userID: integer,
    iterableData: Iterable<D> | AsyncIterable<D>,
    ConverterFunction: ConverterFunction<D, C>,
    context: C
) {
    let importInfo = await ProcessIterableData(userID, iterableData, ConverterFunction, context);

    // Empty anything in the score queue
    await InsertQueue();
}
