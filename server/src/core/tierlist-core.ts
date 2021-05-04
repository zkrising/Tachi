import crypto from "crypto";

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
