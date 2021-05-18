import { ConverterFunction, DryScore, EmptyObject, KtLogger } from "../../../../types";
import {
    InvalidScoreFailure,
    KTDataNotFoundFailure,
    SkipScoreFailure,
} from "../../../framework/common/converter-failures";
import { S3Score } from "./types";
import { Playtypes, Difficulties, Grades, Lamps } from "kamaitachi-common";
import { FindSongOnTitleInsensitive } from "../../../../common/database-lookup/song";
import { FindChartWithPTDFVersion } from "../../../../common/database-lookup/chart";
import {
    GenericCalculatePercent,
    GetGradeFromPercent,
} from "../../../framework/common/score-utils";

export function ParseDifficulty(
    diff: S3Score["diff"]
): { playtype: Playtypes["iidx"]; difficulty: Difficulties["iidx:SP" | "iidx:DP"] } {
    switch (diff) {
        case "L7":
            return { playtype: "SP", difficulty: "NORMAL" };
        case 7:
            return { playtype: "SP", difficulty: "HYPER" };
        case "A":
            return { playtype: "SP", difficulty: "ANOTHER" };
        case "B":
            return { playtype: "SP", difficulty: "LEGGENDARIA" };
        case 5:
            throw new SkipScoreFailure(`5KEY scores are not supported.`);
        case "L14":
            return { playtype: "DP", difficulty: "NORMAL" };
        case 14:
            return { playtype: "DP", difficulty: "HYPER" };
        case "A14":
            return { playtype: "DP", difficulty: "ANOTHER" };
        case "B14":
            return { playtype: "DP", difficulty: "LEGGENDARIA" };
        default:
            throw new InvalidScoreFailure(`Invalid difficulty ${diff}.`);
    }
}

export function ResolveS3Lamp(data: S3Score, logger: KtLogger): Lamps["iidx:SP" | "iidx:DP"] {
    if (data.cleartype === "played") {
        return "FAILED";
    } else if (data.cleartype === "cleared") {
        if (!data.mods.hardeasy) {
            return "CLEAR";
        } else if (data.mods.hardeasy === "H") {
            return "HARD CLEAR";
        } else if (data.mods.hardeasy === "E") {
            return "EASY CLEAR";
        } else {
            logger.warn(`Invalid cleartype of 'cleared' with hardeasy of ${data.mods.hardeasy}?`);
            throw new InvalidScoreFailure(
                `Invalid cleartype of 'cleared' with hardeasy of ${data.mods.hardeasy}?`
            );
        }
    } else if (
        data.cleartype === "combo" ||
        data.cleartype === "comboed" ||
        data.cleartype === "perfect" ||
        data.cleartype === "perfected"
    ) {
        return "FULL COMBO";
    }

    throw new InvalidScoreFailure(`Invalid cleartype of ${data.cleartype}.`);
}

const S3_VERSION_CONV: Record<string, string> = {
    "3rd": "3cs",
    "4th": "4cs",
    "5th": "5cs",
    "6th": "6cs",
    "7th": "7cs",
    "8th": "8cs",
    "9th": "9cs",
    "10th": "10cs",
    red: "11cs",
    hs: "12cs",
    dd: "13cs",
    gold: "14cs",
    djt: "15cs",
    emp: "16cs",
    pb: "16cs",
    us: "bmus",
};

function ConvertVersion(joinedStyles: string) {
    const styles = joinedStyles.split(",");

    const style = styles[styles.length - 1];

    const convertedStyle = S3_VERSION_CONV[style];

    if (!convertedStyle) {
        throw new InvalidScoreFailure(`Song has invalid style ${style}.`);
    }

    return convertedStyle;
}

export const ConvertFileS3: ConverterFunction<S3Score, EmptyObject> = async (
    data,
    context,
    importType,
    logger
) => {
    const song = await FindSongOnTitleInsensitive("iidx", data.songname);

    if (!song) {
        throw new KTDataNotFoundFailure(
            `Could not find song with title ${data.songname}`,
            importType,
            data,
            context
        );
    }

    const { playtype, difficulty } = ParseDifficulty(data.diff);
    const version = ConvertVersion(data.styles);

    const chart = await FindChartWithPTDFVersion("iidx", song.id, playtype, difficulty, version);

    if (!chart) {
        throw new KTDataNotFoundFailure(
            `Could not find chart ${data.songname} (${playtype} ${difficulty} version (${version}))`,
            importType,
            data,
            context
        );
    }

    const percent = GenericCalculatePercent("iidx", data.exscore, chart);

    if (percent > 100) {
        throw new InvalidScoreFailure(
            `${song.title} (${playtype} ${
                chart.difficulty
            }): Percent was greater than 100% (${percent.toFixed(2)}%)`
        );
    }

    const grade = GetGradeFromPercent("iidx", percent);

    const lamp = ResolveS3Lamp(data, logger);

    const timeAchieved = Date.parse(data.date);

    if (Number.isNaN(timeAchieved)) {
        throw new InvalidScoreFailure(`Invalid timestamp of ${data.date} - could not parse.`);
    }

    let hitData = {};
    if (data.scorebreakdown) {
        hitData = {
            pgreat: data.scorebreakdown.justgreats,
            great: data.scorebreakdown.greats,
            good: data.scorebreakdown.good,
            bad: data.scorebreakdown.bad,
            poor: data.scorebreakdown.poor,
        };
    }

    const dryScore: DryScore<"iidx:SP" | "iidx:DP"> = {
        game: "iidx",
        comment: data.comment ?? null,
        importType: "file/solid-state-squad",
        service: "Solid State Squad",
        scoreData: {
            percent,
            grade: grade as Grades["iidx:SP" | "iidx:DP"],
            score: data.exscore,
            lamp,
            hitData,
            hitMeta: {},
        },
        scoreMeta: {},
        timeAchieved,
    };

    return { chart, song, dryScore };
};
