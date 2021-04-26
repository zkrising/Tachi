import { ScoreDocument } from "..";
import { ICollection } from "monk";
export declare function AutoCoerce(collection: ICollection<ScoreDocument>, scores: ScoreDocument[]): Promise<ScoreDocument[]>;
