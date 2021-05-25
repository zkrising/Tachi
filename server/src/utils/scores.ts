import db from "../external/mongo/db";
import { integer } from "kamaitachi-common";

export function GetPBOnChart(userID: integer, chartID: string) {
    return db["score-pbs"].findOne({
        userID,
        chartID,
    });
}

export function GetServerRecordOnChart(chartID: string) {
    return db["score-pbs"].findOne({
        chartID,
        "rankingData.rank": 1,
    });
}
