// barrel file for re-exporting env variables.
import dotenv from "dotenv";
dotenv.config();

const envVars = [
    "KTBKS_MONGO_BASE_URL",
    "KTBKS_LOG_LEVEL",
    "KTBKS_CAPTCHA_SECRET_KEY",
    "KTBKS_SESSION_SECRET",
    "KTBKS_FLO_API_URL",
    "KTBKS_EAG_API_URL",
    "KTBKS_ARC_API_URL",
];

for (const eVar of envVars) {
    if (!process.env[eVar]) {
        throw new Error(`${eVar} was not defined.`);
    }
}

export const MONGO_BASE_URL = process.env.KTBKS_MONGO_BASE_URL!;
export const LOG_LEVEL = process.env.KTBKS_LOG_LEVEL!;
export const SESSION_SECRET = process.env.KTBKS_SESSION_SECRET!;
export const CAPTCHA_SECRET_KEY = process.env.KTBKS_CAPTCHA_SECRET_KEY!;
export const FLO_API_URL = process.env.KTBKS_FLO_API_URL!;
export const EAG_API_URL = process.env.KTBKS_EAG_API_URL!;
export const ARC_API_URL = process.env.KTBKS_ARC_API_URL!;
