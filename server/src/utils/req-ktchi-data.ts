import { SYMBOL_KtchiData } from "../lib/constants/ktchi";
import { Request } from "express";
import { KtchiRequestData } from "./types";
import deepmerge from "deepmerge";

export function AssignToReqKtchiData(req: Request, data: Partial<KtchiRequestData>) {
    if (!req[SYMBOL_KtchiData]) {
        req[SYMBOL_KtchiData] = data;
    } else {
        req[SYMBOL_KtchiData] = deepmerge(req[SYMBOL_KtchiData]!, data);
    }
}
