import { SessionDocument } from "kamaitachi-common";
import db from "../db/db";

export function GetScoresFromSession(session: SessionDocument) {
    return db.scores.find({
        scoreID: { $in: session.scoreInfo.map((e) => e.scoreID) },
    });
}
