import { Difficulties } from "kamaitachi-common";
import { Logger } from "winston";
import { ParserFunctionReturnsSync } from "../../../types";
import ScoreImportFatalError from "../../framework/core/score-import-error";
import ConverterFn from "./converter";
import { EamusementScoreData, IIDXEamusementCSVContext, IIDXEamusementCSVData } from "./types";

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

const PRE_HV_HEADER_COUNT = 27;
const HV_HEADER_COUNT = 41;

// commented out for reference
// [
//     "version",
//     "title",
//     "genre",
//     "artist",
//     "playcount",
//     (?beginnerdata)
//     "normal-level",
//     "normal-exscore",
//     "normal-pgreat",
//     "normal-great",
//     "normal-bp",
//     "normal-lamp",
//     "normal-grade",
//     "hyper-level",
//     "hyper-exscore",
//     "hyper-pgreat",
//     "hyper-great",
//     "hyper-bp",
//     "hyper-lamp",
//     "hyper-grade",
//     "another-level",
//     "another-exscore",
//     "another-pgreat",
//     "another-great",
//     "another-bp",
//     "another-lamp",
//     "another-grade",
//     (?leggdata)
//     "timestamp",
// ];

function ResolveHeaders(headers: string[], logger: Logger) {
    if (headers.length === PRE_HV_HEADER_COUNT) {
        logger.verbose("PRE_HV csv recieved.");
        return {
            hasBeginnerAndLegg: false,
        };
    } else if (headers.length === HV_HEADER_COUNT) {
        logger.verbose("HV+ csv recieved.");
        return {
            hasBeginnerAndLegg: true,
        };
    } else {
        logger.info(`Invalid CSV header count of ${headers.length} received.`);
        throw new ScoreImportFatalError(
            400,
            "Invalid CSV provided. CSV does not have the correct amount of headers."
        );
    }
}

function NaiveCSVParse(csvBuffer: Buffer, logger: Logger) {
    const csvString = csvBuffer.toString("utf-8");

    let csvData = csvString.split("\n");

    let rawHeaders = [];
    let headerLen = 0;
    let curStr = "";

    // looks like we're doing it like this.
    for (const char of csvData[0]) {
        headerLen++;

        // safety checks to avoid getting DOS'd
        if (headerLen > 1000) {
            throw new ScoreImportFatalError(400, "Headers were longer than 1000 characters long.");
        } else if (rawHeaders.length > 50) {
            throw new ScoreImportFatalError(400, "Invalid CSV Headers.");
        }

        if (char === ",") {
            rawHeaders.push(curStr);
            curStr = "";
        } else {
            curStr += char;
        }
    }

    rawHeaders.push(curStr);

    const { hasBeginnerAndLegg } = ResolveHeaders(rawHeaders, logger);

    const diffs = hasBeginnerAndLegg
        ? ["beginner", "normal", "hyper", "another", "leggendaria"]
        : ["normal", "hyper", "another"];

    let iterableData = [];

    let gameVersion = 0;

    for (let i = 1; i < csvData.length; i++) {
        let data = csvData[i];

        let cells = data.split(",");

        // weirdly enough, an empty string split on "," is an array with
        // one empty value.
        // regardless, this line skips empty rows
        if (cells.length === 1) {
            logger.verbose(`Skipped empty row ${i}.`);
            continue;
        }

        if (cells.length !== rawHeaders.length) {
            logger.info(
                `eamusement-iidx csv has row (${i}) with invalid cell count of ${cells.length}, rejecting.`,
                {
                    data,
                }
            );
            throw new ScoreImportFatalError(
                400,
                `Row ${i} has an invalid amount of cells (${cells.length}).`
            );
        }

        let version = cells[0];
        let title = cells[1];
        let timestamp = cells[rawHeaders.length - 1].replace(/\r/g, "");

        // wtf typescript?? what's the point of enums?
        const versionNum = EAM_VERSION_NAMES[version as keyof typeof EAM_VERSION_NAMES];

        if (!versionNum) {
            logger.info(`Invalid/Unknown EAM_VERSION_NAME ${version}.`);
            throw new ScoreImportFatalError(400, `Invalid/Unknown EAM_VERSION_NAME ${version}.`);
        }

        if (versionNum > gameVersion) {
            logger.verbose(`Replaced ${version} with ${version} (${versionNum}).`);
            gameVersion = versionNum;
        }

        let scores: EamusementScoreData[] = [];

        for (let d = 0; d < diffs.length; d++) {
            const diff = diffs[d];
            let di = 5 + d * 7;

            scores.push({
                difficulty: (diff.toUpperCase as unknown) as Difficulties["iidx:SP" | "iidx:DP"],
                bp: cells[di + 4],
                exscore: cells[di + 1],
                pgreat: cells[di + 2],
                great: cells[di + 3],
                lamp: cells[di + 5],
                level: cells[di],
            });
        }

        iterableData.push({
            scores,
            timestamp,
            title,
        });
    }

    return { iterableData, version: gameVersion, hasBeginnerAndLegg };
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
        logger.info(`Invalid playtype of ${body.playtype} passed to ParseEamusementCSV.`);
        throw new ScoreImportFatalError(
            400,
            `Invalid playtype of ${body.playtype ?? "Nothing"} given.`
        );
    }

    let lowercaseFilename = fileData.originalname.toLowerCase();

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

    let { hasBeginnerAndLegg, version, iterableData } = NaiveCSVParse(fileData.buffer, logger);

    logger.verbose("Successfully parsed CSV.");

    let context: IIDXEamusementCSVContext = {
        playtype,
        importVersion: version,
        hasBeginnerAndLegg,
        serviceOrigin: "e-amusement",
    };

    logger.verbose(`Successfully Parsed with ${iterableData.length} results.`);

    return {
        iterable: iterableData,
        context,
        ConverterFunction: ConverterFn,
        idStrings: [`iidx:${context.playtype}` as "iidx:SP" | "iidx:DP"],
    };
}

export default ParseEamusementCSV;
