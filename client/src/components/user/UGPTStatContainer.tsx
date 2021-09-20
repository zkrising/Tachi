import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { useQuery } from "react-query";
import { integer, PublicUserDocument, ShowcaseStatDetails } from "tachi-common";
import { UGPTPreferenceStatsReturn } from "types/api-returns";
import { GamePT } from "types/react";
import { APIFetchV1 } from "util/api";
import { StatDisplay } from "./UGPTStatShowcase";

type Props = { reqUser: PublicUserDocument } & GamePT;

export default function UGPTStatContainer({
	stat,
	reqUser,
	game,
	playtype,
	shouldFetchCompareID,
}: { stat: ShowcaseStatDetails; shouldFetchCompareID?: integer } & Props) {
	const searchParams = new URLSearchParams();

	searchParams.set("mode", stat.mode);
	searchParams.set("property", stat.property);

	if (stat.mode === "chart") {
		searchParams.set("chartID", stat.chartID);
	} else if (stat.mode === "folder") {
		searchParams.set(
			"folderID",
			Array.isArray(stat.folderID) ? stat.folderID.join(",") : stat.folderID
		);
		searchParams.set("gte", stat.gte.toString());
	}

	const { data, isLoading, error } = useQuery(
		`/users/${reqUser.id}/games/${game}/${playtype}/showcase/custom?${searchParams.toString()}`,
		async () => {
			const res = await APIFetchV1<UGPTPreferenceStatsReturn>(
				`/users/${
					reqUser.id
				}/games/${game}/${playtype}/showcase/custom?${searchParams.toString()}`
			);

			if (!res.success) {
				throw new Error(res.description);
			}

			if (shouldFetchCompareID) {
				const res2 = await APIFetchV1<UGPTPreferenceStatsReturn>(
					`/users/${shouldFetchCompareID}/games/${game}/${playtype}/showcase/custom?${searchParams.toString()}`
				);

				if (!res2.success) {
					throw new Error(res2.description);
				}

				return { data: res.body, compareData: res2.body };
			}

			return { data: res.body };
		}
	);

	if (error) {
		return <>{(error as any).description}</>;
	}

	if (isLoading || !data) {
		return <Loading />;
	}

	return (
		<StatDisplay
			game={game}
			playtype={playtype}
			statData={data.data}
			compareData={data.compareData}
		/>
	);
}
