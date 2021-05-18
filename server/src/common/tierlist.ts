import crypto from "crypto";
import { AnyChartDocument, Game, Playtypes } from "kamaitachi-common";
import db from "../db/db";
import CreateLogCtx from "../logger";

const logger = CreateLogCtx("tierlist.ts");

export function CalculateTierlistDataID(
    chartID: string,
    type: "score" | "lamp" | "grade",
    key: string | null,
    tierlistID: string
) {
    return crypto
        .createHash("sha256")
        .update(`${chartID}|${type}|${key}|${tierlistID}`)
        .digest("hex");
}

export function GetDefaultTierlist(game: Game, playtype: Playtypes[Game]) {
    return db.tierlists.findOne({
        game,
        playtype,
        isDefault: true,
    });
}

async function GetDefaultTierlistID(game: Game, playtype: Playtypes[Game]) {
    const tierlistData = await GetDefaultTierlist(game, playtype);

    if (!tierlistData) {
        logger.warn(
            `Attempted to GetTierlistData for ${game} ${playtype}, but no default tierlist is set.`
        );
        return undefined;
    }

    return tierlistData.tierlistID;
}

export async function GetOneTierlistData(
    game: Game,
    chart: AnyChartDocument,
    type: "score" | "lamp" | "grade",
    key: string | null,
    tierlistID?: string
) {
    const tlID = tierlistID ?? (await GetDefaultTierlistID(game, chart.playtype));

    const query: Record<string, unknown> = {
        tierlistID: tlID,
        chartID: chart.chartID,
        type,
        key,
    };

    return db["tierlist-data"].findOne(query);
}

export async function GetAllTierlistDataOfType(
    game: Game,
    chart: AnyChartDocument,
    type: "score" | "lamp" | "grade",
    tierlistID?: string
) {
    const tlID = tierlistID ?? (await GetDefaultTierlistID(game, chart.playtype));

    const query: Record<string, unknown> = {
        tierlistID: tlID,
        chartID: chart.chartID,
        type,
    };

    return db["tierlist-data"].find(query);
}
