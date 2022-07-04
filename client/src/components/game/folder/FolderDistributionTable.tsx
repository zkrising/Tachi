import { ChangeOpacity } from "util/color-opacity";
import { TACHI_CHART_THEME } from "util/constants/chart-theme";
import { Reverse, StepFromToMax, PercentFrom } from "util/misc";
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
				keys={Reverse(keys)}
				data={[Object.assign({ id: "" }, values)]}
				theme={Object.assign({}, TACHI_CHART_THEME, { background: "#1c1c1c" })}
				// @ts-expect-error temp
				colors={k => ChangeOpacity(colours[k.id], 0.5)}
				// @ts-expect-error Keys are appended with "." for some reason.
				borderColor={k => colours[k.data.id]}
				labelTextColor="black"
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
				margin={{ right: 50, bottom: 10, top: 20 }}
				tooltip={d => (
					<BarChartTooltip
						point={d}
						renderFn={d => (
							<div className="w-100 text-center">
								{d.label}
								{d.value} ({PercentFrom(d.value, max)})
							</div>
						)}
					/>
				)}
				motionConfig="stiff"
			/>
		</td>
	);
}
