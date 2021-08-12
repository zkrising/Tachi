import { ServerConfig } from "lib/setup/config";

export function KaiTypeToBaseURL(kaiType: "FLO" | "EAG" | "MIN") {
	if (kaiType === "FLO") {
		return ServerConfig.FLO_API_URL;
	} else if (kaiType === "EAG") {
		return ServerConfig.EAG_API_URL;
	} else if (kaiType === "MIN") {
		return ServerConfig.MIN_API_URL;
	}

	throw new Error(`Invalid Kai Type ${kaiType} provided.`);
}

export function GetKaiTypeClientCredentials(kaiType: "FLO" | "EAG" | "MIN") {
	if (kaiType === "FLO") {
		return ServerConfig.FLO_OAUTH2_INFO;
	} else if (kaiType === "EAG") {
		return ServerConfig.EAG_OAUTH2_INFO;
	}

	return ServerConfig.MIN_OAUTH2_INFO;
}
