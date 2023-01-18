import QuickTooltip from "components/layout/misc/QuickTooltip";
import Icon from "components/util/Icon";
import Muted from "components/util/Muted";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
import React from "react";
import { ChartDocument, Game, GetGPTString } from "tachi-common";
import { GPTRatingSystem } from "lib/types";
import MiniTable from "../components/MiniTable";

export default function RatingSystemPart({ chart, game }: { chart: ChartDocument; game: Game }) {
	const ratingSystems: Array<GPTRatingSystem<any>> =
		GPT_CLIENT_IMPLEMENTATIONS[GetGPTString(game, chart.playtype)].ratingSystems;

	// don't render anything if this game has no other rating systems defined
	// for this chart
	if (ratingSystems.filter((e) => typeof e.toNumber(chart) === "number").length === 0) {
		return null;
	}

	return (
		<>
			<div className="d-none d-lg-block">
				<QuickTooltip
					tooltipContent={
						<MiniTable headers={["Ratings"]} colSpan={2}>
							{ratingSystems.map((e) => {
								const strV = e.toString(chart);
								const numV = e.toNumber(chart);

								if (
									strV === null ||
									strV === undefined ||
									numV === null ||
									numV === undefined
								) {
									return null;
								}

								return (
									<tr key={e.name}>
										<td>{e.name}</td>
										<td>
											{strV} <Muted>({numV.toFixed(2)})</Muted>
											{e.idvDifference(chart) && (
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
								);
							})}
						</MiniTable>
					}
				>
					<div>
						<Muted>
							{ratingSystems.map((r) => r.toString(chart as any)).join(" / ")}
						</Muted>
					</div>
				</QuickTooltip>
			</div>
			<div className="d-block d-lg-none">
				<Muted>
					{ratingSystems.map((r) => (
						<React.Fragment key={r.name}>
							{r.toString(chart as any)}
							<br />
						</React.Fragment>
					))}
				</Muted>
			</div>
		</>
	);
}
