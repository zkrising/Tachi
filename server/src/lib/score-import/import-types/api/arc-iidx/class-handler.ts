import nodeFetch from "../../../../../utils/fetch";
import { HasOwnProperty } from "../../../../../utils/misc";
import { IIDXClasses } from "../../../../constants/classes";
import { ARC_API_URL } from "../../../../setup/config";
import { ClassHandler } from "../../../framework/user-game-stats/types";

export async function CreateArcIIDXClassHandler(
    profileID: string,
    token: string,
    fetch = nodeFetch
): Promise<ClassHandler> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let json: any;
    let err: Error | undefined;

    // SP and DP dans are located in the same place,
    // fetch once, then return a function that traverses this data.
    try {
        const res = await fetch(`${ARC_API_URL}/api/v1/iidx/27/profiles?_id=${profileID}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        json = await res.json();
    } catch (e) {
        err = e;
    }

    return (game, playtype, userID, ratings, logger) => {
        /* istanbul ignore next */
        if (err) {
            logger.error(`An error occured while updating classes for ${ARC_API_URL}.`, { err });
            return {};
        }

        // we're just going to lazily path directly towards the rank.
        // if ARC sends us an unexpected JSON structure or whatever
        // we wont crash.
        let arcClass: string | undefined | null;

        if (playtype === "SP") {
            arcClass = json?._items?.[0]?.sp?.rank;
        } else if (playtype === "DP") {
            arcClass = json?._items?.[0]?.dp?.rank;
        } else {
            logger.error(`ARCIIDXClassUpdater called with invalid playtype of ${playtype}.`);
            return {};
        }

        if (arcClass === null) {
            return {};
        }

        // arc's classes sometimes have trailing/leading spaces.
        const trimmedArcClass = (arcClass ?? "").trim();

        if (!HasOwnProperty(ARCClasses, trimmedArcClass)) {
            logger.warn(`Invalid dan sent from ARC ${trimmedArcClass}. Ignoring.`);
            return {};
        }

        return {
            dan: ARCClasses[trimmedArcClass],
        };
    };
}

const ARCClasses = {
    皆伝: IIDXClasses.KAIDEN,
    中伝: IIDXClasses.CHUUDEN,
    十段: IIDXClasses.DAN_10,
    九段: IIDXClasses.DAN_9,
    八段: IIDXClasses.DAN_8,
    七段: IIDXClasses.DAN_7,
    六段: IIDXClasses.DAN_6,
    五段: IIDXClasses.DAN_5,
    四段: IIDXClasses.DAN_4,
    三段: IIDXClasses.DAN_3,
    二段: IIDXClasses.DAN_2, // These two look very similar but they aren't
    ニ段: IIDXClasses.DAN_2, // and ARC uses both, from what I can tell.
    初段: IIDXClasses.DAN_1,
    一級: IIDXClasses.KYU_1,
    二級: IIDXClasses.KYU_2,
    三級: IIDXClasses.KYU_3,
    四級: IIDXClasses.KYU_4,
    五級: IIDXClasses.KYU_5,
    六級: IIDXClasses.KYU_6,
    七級: IIDXClasses.KYU_7,
};
