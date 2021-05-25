import { ClassHandler } from "../../../framework/user-game-stats/classes";
import { integer } from "kamaitachi-common";

export const FERVIDEX_COURSE_LOOKUP = [
    "7kyu",
    "6kyu",
    "5kyu",
    "4kyu",
    "3kyu",
    "2kyu",
    "1kyu",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "chuuden",
    "kaiden",
];

export function FerStaticClassHandler(body: Record<string, unknown>): ClassHandler {
    return (game, playtype, userID, customRatings, logger) => {
        let index;

        if (playtype === "SP") {
            index = body.sp_dan;
        } else if (playtype === "DP") {
            index = body.dp_dan;
        } else {
            logger.error(
                `Invalid playtype ${playtype} passed to FerStaticClassHandler. Attempting to continue.`
            );
            return;
        }

        if (!Number.isInteger(index)) {
            logger.info(`Recieved invalid fer-static class of ${index}.`);
            return;
        }

        const classVal = FERVIDEX_COURSE_LOOKUP[index as integer];

        if (!classVal) {
            logger.info(`Recieved invalid fer-static class of ${index}.`);
            return;
        }

        return {
            dan: classVal,
        };
    };
}
