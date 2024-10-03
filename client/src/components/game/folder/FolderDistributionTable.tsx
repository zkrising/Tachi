import { ChangeOpacity } from "util/color-opacity";
import { TACHI_BAR_THEME } from "util/constants/chart-theme";
import { StepFromToMax, PercentFrom } from "util/misc";
import { ResponsiveBar } from "@nivo/bar";
import { BarChartTooltip } from "components/charts/ChartTooltip";
import MiniTable from "components/tables/components/MiniTable";
import Muted from "components/util/Muted";
import React from "react";
import { integer } from "tachi-common";

export default function FolderDistributionTable<T extends string>({
	keys,
	values,
	colours,
	max,
}: {
	keys: T[];
	values: Record<T, integer>;
	colours: Record<T, string>;
	max: integer;
}) {
	const cumulativeValues: Record<T, integer> = {} as Record<T, integer>;

	let total = 0;
	for (const k of keys) {
		total += values[k] ?? 0;
		cumulativeValues[k] = total;
	}

	return (
		<MiniTable headers={["Value", "Count (Total)", "Thermometer"]}>
			{keys.map((k, i) => (
				<tr key={k}>
					<td style={{ backgroundColor: ChangeOpacity(colours[k], 0.15) }}>{k}</td>
					<td>
						{values[k] ?? 0} <Muted>({cumulativeValues[k]})</Muted>
					</td>
					{i === 0 && (
						<FolderThermometer
							keys={keys}
							values={values}
							max={max}
							colours={colours}
						/>
					)}
				</tr>
			))}
		</MiniTable>
	);
}

function FolderThermometer<T extends string>({
	keys,
	values,
	max,
	colours,
}: {
	keys: T[];
	values: Record<T, integer>;
	colours: Record<T, string>;
	max: integer;
}) {
	return (
		<td rowSpan={keys.length} style={{ width: 200, height: 40 * keys.length }}>
			<ResponsiveBar
				keys={keys}
				data={[Object.assign({ id: "" }, values)]}
				theme={Object.assign({}, TACHI_BAR_THEME)}
				// @ts-expect-error temp
				colors={(k) => ChangeOpacity(colours[k.id], 0.5)}
				// @ts-expect-error Keys are appended with "." for some reason.
				borderColor={(k) => ChangeOpacity(colours[k.data.id], 0.4)}
				labelSkipHeight={12}
				maxValue={max}
				padding={0.33}
				borderWidth={1}
				valueScale={{ type: "linear" }}
				axisRight={{
					tickSize: 5,
					tickPadding: 5,
					tickValues: StepFromToMax(max),
				}}
				margin={{ left: 10, right: 40, bottom: 10, top: 20 }}
				tooltip={(d) => (
					<BarChartTooltip>
						<div>{d.label}</div>
						<div>
							{d.value} ({PercentFrom(d.value, max)})
						</div>
					</BarChartTooltip>
				)}
				motionConfig="stiff"
			/>
		</td>
	);
}
