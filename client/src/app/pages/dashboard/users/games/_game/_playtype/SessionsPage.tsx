import useSetSubheader from "components/layout/header/useSetSubheader";
import LoadingWrapper from "components/util/LoadingWrapper";
import GenericSessionTable, {
	SessionDataset,
} from "components/tables/sessions/GenericSessionTable";
import DebounceSearch from "components/util/DebounceSearch";
import React, { useState } from "react";
import { useQuery } from "react-query";
import {
	PublicUserDocument,
	GetGameConfig,
	SessionDocument,
	UnsuccessfulAPIResponse,
	FormatGame,
} from "tachi-common";
import { GamePT } from "types/react";
import { APIFetchV1 } from "util/api";
import SelectButton from "components/util/SelectButton";
import Icon from "components/util/Icon";
import { useSessionRatingAlg } from "components/util/useScoreRatingAlg";
import { NumericSOV } from "util/sorts";

export default function SessionsPage({
	reqUser,
	game,
	playtype,
}: {
	reqUser: PublicUserDocument;
} & GamePT) {
	const [sessionSet, setSessionSet] = useState<"recent" | "best" | "highlighted">("best");
	const [search, setSearch] = useState("");

	const gameConfig = GetGameConfig(game);

	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Sessions"],
		[reqUser],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Sessions`
	);

	const baseUrl = `/users/${reqUser.id}/games/${game}/${playtype}/sessions`;

	const rating = useSessionRatingAlg(game, playtype);

	const { isLoading, error, data } = useQuery<SessionDataset, UnsuccessfulAPIResponse>(
		`${baseUrl}/${sessionSet}`,
		async () => {
			const res = await APIFetchV1<SessionDocument[]>(`${baseUrl}/${sessionSet}`);

			if (!res.success) {
				throw res;
			}

			return res.body
				.sort(NumericSOV(x => x.calculatedData[rating] ?? 0, true))
				.map((e, i) => ({
					...e,
					__related: {
						index: i,
					},
				}));
		}
	);

	return (
		<div className="row">
			<div className="col-12 text-center">
				<div className="btn-group mb-4">
					<SelectButton id="best" setValue={setSessionSet} value={sessionSet}>
						<Icon type="trophy" />
						Best Sessions
					</SelectButton>
					<SelectButton id="recent" setValue={setSessionSet} value={sessionSet}>
						<Icon type="history" />
						Recent Sessions
					</SelectButton>
					<SelectButton id="highlighted" setValue={setSessionSet} value={sessionSet}>
						<Icon type="star" />
						Highlighted Sessions
					</SelectButton>
				</div>
			</div>
			<div className="col-12 mt-4">
				<DebounceSearch
					placeholder="Search all sessions..."
					className="form-control-lg"
					setSearch={setSearch}
				/>
			</div>
			<div className="col-12 mt-4">
				{search === "" ? (
					<LoadingWrapper {...{ isLoading, error, dataset: data }}>
						<GenericSessionTable
							indexCol={sessionSet === "best"}
							dataset={data!}
							game={game}
							playtype={playtype}
						/>
					</LoadingWrapper>
				) : (
					<SearchSessionsTable {...{ game, playtype, baseUrl, search }} />
				)}
			</div>
		</div>
	);
}

function SearchSessionsTable({
	search,
	game,
	playtype,
	baseUrl,
}: { search: string; baseUrl: string } & GamePT) {
	const { isLoading, error, data } = useQuery<SessionDataset, UnsuccessfulAPIResponse>(
		`${baseUrl}?search=${search}`,
		async () => {
			const res = await APIFetchV1<SessionDocument[]>(`${baseUrl}?search=${search}`);

			if (!res.success) {
				throw res;
			}

			return res.body.map((e, i) => ({
				...e,
				__related: {
					index: i,
				},
			}));
		}
	);

	return (
		<LoadingWrapper {...{ isLoading, error, dataset: data }}>
			<GenericSessionTable dataset={data!} game={game} playtype={playtype} />
		</LoadingWrapper>
	);
}
