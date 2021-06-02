// barrel file for re-exporting env variables.
import dotenv from "dotenv";
dotenv.config();

const envVars = [
    "KTBSV_MONGO_BASE_URL",
    "KTBSV_LOG_LEVEL",
    "KTBSV_CAPTCHA_SECRET_KEY",
    "KTBSV_SESSION_SECRET",
    "KTBSV_FLO_API_URL",
    "KTBSV_EAG_API_URL",
    "KTBSV_ARC_API_URL",
    "KTBSV_ARC_AUTH_TOKEN",
];

for (const eVar of envVars) {
    if (!process.env[eVar]) {
        throw new Error(`${eVar} was not defined.`);
    }
}

export const MONGO_BASE_URL = process.env.KTBSV_MONGO_BASE_URL!;
export const LOG_LEVEL = process.env.KTBSV_LOG_LEVEL!;
export const SESSION_SECRET = process.env.KTBSV_SESSION_SECRET!;
export const CAPTCHA_SECRET_KEY = process.env.KTBSV_CAPTCHA_SECRET_KEY!;
export const FLO_API_URL = process.env.KTBSV_FLO_API_URL!;
export const EAG_API_URL = process.env.KTBSV_EAG_API_URL!;
export const ARC_API_URL = process.env.KTBSV_ARC_API_URL!;
export const ARC_AUTH_TOKEN = process.env.KTBSV_ARC_AUTH_TOKEN!;
