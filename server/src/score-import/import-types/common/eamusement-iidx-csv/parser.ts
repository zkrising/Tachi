import { Difficulties } from "kamaitachi-common";
import { KtLogger } from "../../../../common/types";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { ParserFunctionReturnsSync } from "../types";
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

export function ResolveHeaders(headers: string[], logger: KtLogger) {
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
    }

    logger.info(`Invalid CSV header count of ${headers.length} received.`);
    throw new ScoreImportFatalError(
        400,
        "Invalid CSV provided. CSV does not have the correct amount of headers."
    );
}

export function NaiveCSVParse(csvBuffer: Buffer, logger: KtLogger) {
    const csvString = csvBuffer.toString("utf-8");

    const csvData = csvString.split("\n");

    const rawHeaders = [];
    let headerLen = 0;
    let curStr = "";

    // looks like we're doing it like this.
    for (const char of csvData[0]) {
        headerLen++;

        // safety checks to avoid getting DOS'd
        if (headerLen > 1000) {
            throw new ScoreImportFatalError(400, "Headers were longer than 1000 characters long.");
        } else if (rawHeaders.length >= 50) {
            // this does not *really* do what it seems.
            // because there's inevitably something left in curStr in this fn
            // this means that the above check is actually > 50 headers. Not
            // >= 50.
            throw new ScoreImportFatalError(400, "Too many CSV headers.");
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

    const iterableData = [];

    let gameVersion = 0;

    for (let i = 1; i < csvData.length; i++) {
        const data = csvData[i];

        // @security: This should probably be safetied from DOSing
        const cells = data.split(",");

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
                `Row ${i} has an invalid amount of cells (${cells.length}, expected ${rawHeaders.length}).`
            );
        }

        const version = cells[0];
        const title = cells[1].trim(); // konmai quality
        const timestamp = cells[rawHeaders.length - 1].trim();

        // wtf typescript?? what's the point of enums?
        const versionNum = EAM_VERSION_NAMES[version as keyof typeof EAM_VERSION_NAMES];

        if (!versionNum) {
            logger.info(`Invalid/Unsupported EAM_VERSION_NAME ${version}.`);
            throw new ScoreImportFatalError(
                400,
                `Invalid/Unsupported Eamusement Version Name ${version}.`
            );
        }

        if (versionNum > gameVersion) {
            gameVersion = versionNum;
        }

        const scores: EamusementScoreData[] = [];

        for (let d = 0; d < diffs.length; d++) {
            const diff = diffs[d];
            const di = 5 + d * 7;

            scores.push({
                difficulty: diff.toUpperCase() as Difficulties["iidx:SP" | "iidx:DP"],
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

    return { iterableData, version: gameVersion.toString(), hasBeginnerAndLegg };
}

/**
 * Parses a buffer of EamusementCSV data.
 * @param fileData - The buffer to parse.
 * @param body - The request body that made this file import request. Used to infer playtype.
 */
function GenericParseEamIIDXCSV(
    fileData: Express.Multer.File,
    body: Record<string, unknown>,
    service: string,
    logger: KtLogger
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

    const lowercaseFilename = fileData.originalname.toLowerCase();

    // prettier pls
    if (
        !body.assertPlaytypeCorrect &&
        ((lowercaseFilename.includes("sp") && playtype === "DP") ||
            (lowercaseFilename.includes("dp") && playtype === "SP"))
    ) {
        logger.info(
            `File was uploaded with filename ${fileData.originalname}, but this was set as a ${playtype} import. Sanity check refusing.`
        );

        throw new ScoreImportFatalError(
            400,
            `Safety Triggered: Filename contained '${
                playtype === "SP" ? "DP" : "SP"
            }', but was marked as a ${playtype} import. Are you *absolutely* sure this is right?`
        );
    }

    const { hasBeginnerAndLegg, version, iterableData } = NaiveCSVParse(fileData.buffer, logger);

    logger.verbose("Successfully parsed CSV.");

    const context: IIDXEamusementCSVContext = {
        playtype,
        importVersion: version,
        hasBeginnerAndLegg,
        service,
    };

    logger.verbose(`Successfully Parsed with ${iterableData.length} results.`);

    return {
        iterable: iterableData,
        context,
        ConverterFunction: ConverterFn,
        game: "iidx",
        classHandler: null,
    };
}

export default GenericParseEamIIDXCSV;
