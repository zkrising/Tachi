import csvParse from "csv-parse/lib/sync";
import { Difficulties, integer } from "kamaitachi-common";
import { Logger } from "winston";
import { ParserFunctionReturnsSync } from "../../../types";
import ScoreImportFatalError from "../../framework/core/score-import-error";
import ConverterFn from "./converter";
import {
    EamusementScoreData,
    IIDXEamusementCSVContext,
    IIDXEamusementCSVData,
    RawIIDXEamusementCSVData,
} from "./types";

const PRE_HV_HEADER_COUNT = 27;
const HV_HEADER_COUNT = 41;

enum EAM_VERSION_NAMES {
    "1st&substream" = 1,
    "2nd style",
    "3rd style",
    "4th style",
    "5th style",
    "6th style",
    "7th style",
    "8th style",
    "9th style",
    "10th style",
    "IIDX RED",
    "HAPPY SKY",
    "DistorteD",
    "GOLD",
    "DJ TROOPERS",
    "EMPRESS",
    "SIRIUS",
    "Resort Anthem",
    "Lincle",
    "tricoro",
    "SPADA",
    "PENDUAL",
    "copula",
    "SINOBUZ",
    "CANNON BALLERS",
    "Rootage",
    "HEROIC VERSE",
    "BISTROVER",
}

/**
 * Parses a buffer of EamusementCSV data.
 * @param fileData - The buffer to parse.
 * @param body - The request body that made this file import request. Used to infer playtype.
 */
function ParseEamusementCSV(
    fileData: Express.Multer.File,
    body: Record<string, unknown>,
    logger: Logger
): ParserFunctionReturnsSync<IIDXEamusementCSVData, IIDXEamusementCSVContext> {
    let playtype: "SP" | "DP";

    if (body.playtype === "SP") {
        playtype = "SP";
    } else if (body.playtype === "DP") {
        playtype = "DP";
    } else {
        logger.error(`Invalid playtype of ${body.playtype} passed to ParseEamusementCSV.`);
        throw new ScoreImportFatalError(
            400,
            `Invalid playtype of ${body.playtype ?? "Nothing"} given.`
        );
    }

    let lowercaseFilename = fileData.filename.toLowerCase();

    // prettier pls
    if (
        !body.assertPlaytypeCorrect &&
        ((lowercaseFilename.includes("sp") && playtype === "DP") ||
            (lowercaseFilename.toLowerCase().includes("dp") && playtype === "SP"))
    ) {
        logger.info(
            `File was uploaded with filename ${fileData.filename}, but this was set as a ${playtype} import. Sanity check refusing.`
        );

        throw new ScoreImportFatalError(
            400,
            `Safety: Filename contained '${
                playtype === "SP" ? "DP" : "SP"
            }', but was marked as a ${playtype} import. Are you *absolutely* sure this is right?`
        );
    }

    let data: IIDXEamusementCSVData[] = [];
    let csvData: RawIIDXEamusementCSVData[];
    let hasBeginnerAndLegg: boolean | null = null;

    try {
        csvData = csvParse(fileData.buffer, {
            bom: true,
            // @ts-expect-error csvParse's types are wrong, see https://github.com/adaltas/node-csv-parse/pull/314
            escape: null, // KONMAI do not escape their CSV, disable escaping entirely.
            columns: (header) => {
                // does not have leggendaria/beginner built in
                if (header.length === PRE_HV_HEADER_COUNT) {
                    logger.verbose("PRE_HV csv recieved.");
                    hasBeginnerAndLegg = false;
                    return [
                        "version",
                        "title",
                        "genre",
                        "artist",
                        "playcount",
                        "normal-level",
                        "normal-exscore",
                        "normal-pgreat",
                        "normal-great",
                        "normal-bp",
                        "normal-lamp",
                        "normal-grade",
                        "hyper-level",
                        "hyper-exscore",
                        "hyper-pgreat",
                        "hyper-great",
                        "hyper-bp",
                        "hyper-lamp",
                        "hyper-grade",
                        "another-level",
                        "another-exscore",
                        "another-pgreat",
                        "another-great",
                        "another-bp",
                        "another-lamp",
                        "another-grade",
                        "timestamp",
                    ];
                }
                // does
                else if (header.length === HV_HEADER_COUNT) {
                    logger.verbose("HV+ csv recieved.");
                    hasBeginnerAndLegg = true;
                    return [
                        "version",
                        "title",
                        "genre",
                        "artist",
                        "playcount",
                        "beginner-level",
                        "beginner-exscore",
                        "beginner-pgreat",
                        "beginner-great",
                        "beginner-bp",
                        "beginner-lamp",
                        "beginner-grade",
                        "normal-level",
                        "normal-exscore",
                        "normal-pgreat",
                        "normal-great",
                        "normal-bp",
                        "normal-lamp",
                        "normal-grade",
                        "hyper-level",
                        "hyper-exscore",
                        "hyper-pgreat",
                        "hyper-great",
                        "hyper-bp",
                        "hyper-lamp",
                        "hyper-grade",
                        "another-level",
                        "another-exscore",
                        "another-pgreat",
                        "another-great",
                        "another-bp",
                        "another-lamp",
                        "another-grade",
                        "leggendaria-level",
                        "leggendaria-exscore",
                        "leggendaria-pgreat",
                        "leggendaria-great",
                        "leggendaria-bp",
                        "leggendaria-lamp",
                        "leggendaria-grade",
                        "timestamp",
                    ];
                } else {
                    logger.warn(`Invalid CSV header count of ${header.length} received.`);
                    throw new ScoreImportFatalError(
                        400,
                        "Invalid CSV provided. CSV does not have the correct amount of headers."
                    );
                }
            },
            skipEmptyLines: true,
        });
    } catch (err) {
        logger.error(`CSV Parser Error: ${err}`);
        throw new ScoreImportFatalError(400, "CSV Could not be parsed.");
    }

    logger.verbose("Successfully parsed CSV.");

    let firstEl = csvData[0];

    if (!firstEl) {
        throw new ScoreImportFatalError(400, "This CSV has no scores.");
    }

    let version = 0;

    const diffs = hasBeginnerAndLegg
        ? ["beginner", "normal", "hyper", "another", "leggendaria"]
        : ["normal", "hyper", "another"];

    // @optimisable - Can hook into the CSV parser perhaps and read this value immediately?
    for (const d of csvData) {
        // wtf typescript?? what's the point of enums?
        const versionNum = EAM_VERSION_NAMES[d.version as keyof typeof EAM_VERSION_NAMES];

        if (!versionNum) {
            logger.error(`Invalid/Unknown EAM_VERSION_NAME ${d.version}.`);
            throw new ScoreImportFatalError(400, `Invalid/Unknown EAM_VERSION_NAME ${d.version}.`);
        }

        if (versionNum > version) {
            logger.verbose(`Replaced ${version} with ${d.version} (${versionNum}).`);
            version = versionNum;
        }

        let scores: EamusementScoreData[] = [];

        for (const diff of diffs) {
            scores.push({
                difficulty: (diff.toUpperCase as unknown) as Difficulties["iidx:SP" | "iidx:DP"],
                bp: d[`${diff}-bp`] as integer | "---",
                exscore: d[`${diff}-exscore`] as integer,
                pgreat: d[`${diff}-pgreat`] as integer,
                great: d[`${diff}-great`] as integer,
                lamp: d[`${diff}-lamp`] as string,
                level: d[`${diff}-level`] as integer,
            });
        }

        data.push({
            scores,
            artist: d.artist,
            genre: d.genre,
            playcount: d.playcount,
            timestamp: d.timestamp,
            title: d.title,
            version: d.version,
        });
    }

    if (hasBeginnerAndLegg === null) {
        logger.error(`hasBeginnerAndLegg was not set, but the end of parsings was reached?`);
        throw new ScoreImportFatalError(500, "An internal service error has occured.");
    }

    let context: IIDXEamusementCSVContext = {
        playtype,
        importVersion: version,
        hasBeginnerAndLegg,
        serviceOrigin: "e-amusement",
    };

    logger.verbose(`Successfully Parsed with ${data.length} results.`);

    return {
        iterable: data,
        context,
        ConverterFunction: ConverterFn,
        idStrings: [`iidx:${context.playtype}` as "iidx:SP" | "iidx:DP"],
    };
}

export default ParseEamusementCSV;
