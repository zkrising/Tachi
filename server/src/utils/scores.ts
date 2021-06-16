import db from "../external/mongo/db";
import { integer } from "tachi-common";

export function GetPBOnChart(userID: integer, chartID: string) {
    return db["personal-bests"].findOne({
        userID,
        chartID,
    });
}

export function GetServerRecordOnChart(chartID: string) {
    return db["personal-bests"].findOne({
        chartID,
        "rankingData.rank": 1,
    });
}
