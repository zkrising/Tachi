import ClassBadge from "components/game/ClassBadge";
import useSetSubheader from "components/layout/header/useSetSubheader";
import IndexCell from "components/tables/cells/IndexCell";
import UserCell from "components/tables/cells/UserCell";
import TachiTable, { Header } from "components/tables/components/TachiTable";
import PBTable from "components/tables/pbs/PBTable";
import ApiError from "components/util/ApiError";
import DebugContent from "components/util/DebugContent";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import useScoreRatingAlg, { useProfileRatingAlg } from "components/util/useScoreRatingAlg";
import { UGPTSettingsContext } from "context/UGPTSettingsContext";
import React, { useContext, useState } from "react";
import { Col, Row, Form } from "react-bootstrap";
import { FormatGame, GetGameConfig, GetGamePTConfig } from "tachi-common";
import { ScoreLeaderboardReturns, UserLeaderboardReturns } from "types/api-returns";
import { GamePT } from "types/react";
import { PBDataset, UGSDataset } from "types/tables";
import { CreateChartMap, CreateSongMap, CreateUserMap } from "util/data";
import { UppercaseFirst } from "util/misc";
import { NumericSOV, StrSOV } from "util/sorts";

export default function GPTLeaderboardsPage({ game, playtype }: GamePT) {
	useSetSubheader(
		["Games", GetGameConfig(game).name, playtype, "Leaderboards"],
		[game, playtype],
		`${FormatGame(game, playtype)} Leaderboards`
	);

	const { settings } = useContext(UGPTSettingsContext);

	const [mode, setMode] = useState<"profile" | "score">("profile");

	return (
		<Row>
			<Col xs={12} className="d-flex justify-content-center">
				<div className="btn-group">
					<SelectButton id="profile" value={mode} setValue={setMode}>
						<Icon type="user" />
						User Leaderboards
					</SelectButton>
					<SelectButton id="score" value={mode} setValue={setMode}>
						<Icon type="sort-numeric-up-alt" />
						Score Leaderboards
					</SelectButton>
				</div>
			</Col>
			<Col xs={12}>
				<Divider />
				{mode === "profile" ? (
					<ProfileLeaderboard game={game} playtype={playtype} />
				) : (
					<ScoreLeaderboard game={game} playtype={playtype} />
				)}
			</Col>
		</Row>
	);
}

function ProfileLeaderboard({ game, playtype }: GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const defaultAlg = useProfileRatingAlg(game, playtype);

	const [alg, setAlg] = useState(defaultAlg);

	const SelectComponent =
		gptConfig.profileRatingAlgs.length > 1 ? (
			<Form.Control as="select" value={alg} onChange={e => setAlg(e.target.value as any)}>
				{gptConfig.profileRatingAlgs.map(e => (
					<option key={e} value={e}>
						{UppercaseFirst(e)}
					</option>
				))}
			</Form.Control>
		) : null;

	const { data, isLoading, error } = useApiQuery<UserLeaderboardReturns>(
		`/games/${game}/${playtype}/leaderboard?alg=${alg}`
	);

	if (error) {
		return (
			<>
				{SelectComponent}
				<ApiError error={error} />
			</>
		);
	}

	if (!data || isLoading) {
		return (
			<>
				{SelectComponent}
				<Loading />
			</>
		);
	}

	const userMap = CreateUserMap(data.users);

	const userDataset: UGSDataset = [];

	for (const [index, gs] of data.gameStats.entries()) {
		userDataset.push({
			...gs,
			__related: {
				user: userMap.get(gs.userID)!,
				index,
			},
		});
	}

	return (
		<>
			{SelectComponent}
			<Divider />
			<TachiTable
				dataset={userDataset}
				entryName="Rankers"
				headers={[
					["Ranking", "Rank", NumericSOV(x => x.__related.index)],
					["User", "User", StrSOV(x => x.__related.user.username)],
					...gptConfig.profileRatingAlgs.map(
						e =>
							[
								UppercaseFirst(e),
								UppercaseFirst(e),
								NumericSOV(x => x.ratings[e] ?? -Infinity),
							] as Header<UGSDataset[0]>
					),
					["Classes", "Classes"],
				]}
				rowFunction={r => (
					<tr>
						<IndexCell index={r.__related.index} />
						<UserCell game={game} playtype={playtype} user={r.__related.user} />
						{gptConfig.profileRatingAlgs.map(e => (
							<td key={e}>
								{r.ratings[e]
									? gptConfig.profileRatingAlgFormatters[e]
										? gptConfig.profileRatingAlgFormatters[e]!(r.ratings[e]!)
										: r.ratings[e]!.toFixed(2)
									: "No Data."}
							</td>
						))}
						<td>
							{Object.keys(r.classes).length === 0 ? (
								<Muted>None</Muted>
							) : (
								Object.entries(r.classes).map(([k, v]) => (
									<ClassBadge
										key={k}
										classSet={k as keyof typeof r.classes}
										game={game}
										playtype={playtype}
										classValue={v}
									/>
								))
							)}
						</td>
					</tr>
				)}
			/>
		</>
	);
}

function ScoreLeaderboard({ game, playtype }: GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const defaultAlg = useScoreRatingAlg(game, playtype);

	const [alg, setAlg] = useState(defaultAlg);

	const SelectComponent =
		gptConfig.scoreRatingAlgs.length > 1 ? (
			<Form.Control as="select" value={alg} onChange={e => setAlg(e.target.value as any)}>
				{gptConfig.scoreRatingAlgs.map(e => (
					<option key={e} value={e}>
						{UppercaseFirst(e)}
					</option>
				))}
			</Form.Control>
		) : null;

	const { data, isLoading, error } = useApiQuery<ScoreLeaderboardReturns>(
		`/games/${game}/${playtype}/score-leaderboard?alg=${alg}`
	);

	if (error) {
		return (
			<>
				{SelectComponent}
				<ApiError error={error} />
			</>
		);
	}

	if (!data || isLoading) {
		return (
			<>
				{SelectComponent}
				<Loading />
			</>
		);
	}

	const songMap = CreateSongMap(data.songs);
	const chartMap = CreateChartMap(data.charts);
	const userMap = CreateUserMap(data.users);

	const pbDataset: PBDataset = [];

	for (const [index, pb] of data.pbs.entries()) {
		pbDataset.push({
			...pb,
			__related: {
				chart: chartMap.get(pb.chartID)!,
				song: songMap.get(pb.songID)!,
				index,
				user: userMap.get(pb.userID)!,
			},
		});
	}

	return (
		<>
			{SelectComponent}
			<Divider />
			<PBTable
				dataset={pbDataset}
				game={game}
				playtype={playtype}
				showUser
				showChart
				indexCol
				alg={alg}
			/>
		</>
	);
}
