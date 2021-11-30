import { SYMBOL_TachiData } from "lib/constants/tachi";
import { Request } from "express";
import { TachiRequestData } from "./types";
import deepmerge from "deepmerge";

export function AssignToReqTachiData(req: Request, data: Partial<TachiRequestData>) {
	if (!req[SYMBOL_TachiData]) {
		req[SYMBOL_TachiData] = data;
	} else {
		req[SYMBOL_TachiData] = deepmerge(req[SYMBOL_TachiData]!, data);
	}
}
