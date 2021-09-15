import QuickTooltip from "components/layout/misc/QuickTooltip";
import Icon from "components/util/Icon";
import Muted from "components/util/Muted";
import React from "react";
import { ChartDocument } from "tachi-common";
import MiniTable from "../components/MiniTable";

// I hate the fact object.keys doesnt infer types.
type K = keyof ChartDocument["tierlistInfo"];

export default function TierlistInfoPart({ chart }: { chart: ChartDocument }) {
	const keys = Object.keys(chart.tierlistInfo) as K[];

	return (
		<QuickTooltip
			tooltipContent={
				<MiniTable className="table-sm">
					<thead>
						<tr>
							<th>Tierlist</th>
							<th>Value</th>
						</tr>
					</thead>
					<tbody>
						{keys.map(k => (
							<tr key={k}>
								<td>{k}</td>
								<td>
									{chart.tierlistInfo[k]!.text} ({chart.tierlistInfo[k]!.value})
									{chart.tierlistInfo[k]!.individualDifference && (
										<>
											<br />
											<Icon type="balance-scale-left" />
										</>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</MiniTable>
			}
		>
			<div>
				<Muted>{keys.map(k => chart.tierlistInfo[k]!.text).join(" / ")}</Muted>
			</div>
		</QuickTooltip>
	);
}
