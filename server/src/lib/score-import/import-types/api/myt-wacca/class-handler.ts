import { UnaryRPCAsAsync } from "../../common/api-myt/traverse-api";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import { DataRequest } from "proto/generated/wacca/user_pb";
import { WaccaStageUps } from "tachi-common/config/game-support/wacca";
import type { ClassProvider } from "lib/score-import/framework/calculated-data/types";
import type { WaccaUserClient } from "proto/generated/wacca/user_grpc_pb";
import type { DataResponse } from "proto/generated/wacca/user_pb";

export default async function CreateMytWACCAClassHandler(
	titleApiId: string,
	userClient: WaccaUserClient
): Promise<ClassProvider> {
	const req = new DataRequest();

	req.setApiId(titleApiId);
	const dataRes: DataResponse = await UnaryRPCAsAsync(userClient.getData.bind(userClient), req);
	const data = dataRes;

	return (_gptString, _userID, _ratings, _logger) => {
		// versions are 0-indexed, so
		// 0 -> WACCA
		// 1 -> S
		// 2 -> Lily
		// 3 -> Lily R
		// 4 -> Reverse
		// 5 -> Plus
		// Currently (Apr 2024) only Reverse and Plus are supported on Myt, with Plus in loctest only.
		// Also, these may change to be 1-indexed at some point.
		// Tachi only supports reverse, so we only look at the version data for reverse.
		// We will need to update this once Plus is supported.
		const REVERSE_VERSION = 4;
		const versionData = data.getVersionDataMap().get(REVERSE_VERSION);

		// rank:
		// 0 -> none
		// 1 -> stage I
		// 2 -> stage II
		// ...
		// 14 -> stage XIV
		if (versionData === undefined || versionData.getRank() === 0) {
			return {};
		}

		const stageEnum = WaccaStageUps[versionData.getRank() - 1];

		if (stageEnum === undefined) {
			throw new ScoreImportFatalError(400, `Unknown stage up value ${versionData.getRank()}`);
		}

		return {
			stageUp: stageEnum.id,
		};
	};
}
