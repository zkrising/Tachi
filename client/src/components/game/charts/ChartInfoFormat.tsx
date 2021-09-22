import QuickTooltip from "components/layout/misc/QuickTooltip";
import MiniTable from "components/tables/components/MiniTable";
import ApiError from "components/util/ApiError";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ChartDocument, FolderDocument, Game, GetGamePTConfig } from "tachi-common";
import { GamePT } from "types/react";

export default function ChartInfoFormat({
	chart,
	game,
	playtype,
}: { chart: ChartDocument } & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const withTierlists = gptConfig.tierlists.filter(e => chart.tierlistInfo[e]);

	const { data, isLoading, error } = useApiQuery<FolderDocument[]>(
		`/games/${game}/${playtype}/charts/${chart.chartID}/folders`
	);

	const { user } = useContext(UserContext);

	if (error) {
		<ApiError error={error} />;
	}

	if (!data || isLoading) {
		return <Loading />;
	}

	return (
		<Row
			className="text-center align-items-center"
			style={{
				paddingTop: "2.2rem",
				justifyContent: "space-evenly",
			}}
		>
			<Col xs={12} lg={3}>
				<h4>Appears In</h4>
				{data.length !== 0 ? (
					data.map(e => (
						<li key={e.folderID}>
							{user ? (
								<Link
									className="gentle-link"
									to={`/dashboard/users/${user.username}/games/${game}/${playtype}/folders/${e.folderID}`}
								>
									{e.title}
								</Link>
							) : (
								<span>{e.title}</span>
							)}
						</li>
					))
				) : (
					<Muted>No folders...</Muted>
				)}
			</Col>
			<Col xs={12} lg={4}>
				<ChartInfoMiddle chart={chart} game={game} />
			</Col>
			<Col xs={12} lg={3}>
				{withTierlists.length !== 0 ? (
					<>
						<MiniTable headers={["Tierlist Info"]} colSpan={2}>
							{withTierlists.map(e => (
								<tr key={e}>
									<td>{e}</td>
									<td>
										{chart.tierlistInfo[e]!.text}{" "}
										<Muted>({chart.tierlistInfo[e]!.value})</Muted>
										{chart.tierlistInfo[e]!.individualDifference && (
											<>
												<br />
												<QuickTooltip tooltipContent="Individual Difference - The difficulty of this varies massively between people!">
													<span>
														<Icon type="balance-scale-left" />
													</span>
												</QuickTooltip>
											</>
										)}
									</td>
								</tr>
							))}
						</MiniTable>
						<Muted>Disagree with these tiers? Let us know in the discord.</Muted>
					</>
				) : (
					<Muted>No tierlist info.</Muted>
				)}
			</Col>
		</Row>
	);
}

function ChartInfoMiddle({ game, chart }: { chart: ChartDocument; game: Game }) {
	// someday

	return <></>;
}
