import { ServerConfig } from "lib/setup/config";

export function KaiTypeToBaseURL(kaiType: "FLO" | "EAG" | "MIN") {
	if (kaiType === "FLO") {
		if (!ServerConfig.FLO_API_URL) {
			throw new Error(`Got kaiType FLO, but no API_URL was defined?`);
		}
		return ServerConfig.FLO_API_URL;
	} else if (kaiType === "EAG") {
		if (!ServerConfig.EAG_API_URL) {
			throw new Error(`Got kaiType EAG, but no API_URL was defined?`);
		}
		return ServerConfig.EAG_API_URL;
	} else if (kaiType === "MIN") {
		if (!ServerConfig.MIN_API_URL) {
			throw new Error(`Got kaiType MIN, but no API_URL was defined?`);
		}
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
