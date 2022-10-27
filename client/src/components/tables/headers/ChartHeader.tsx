import { IsNotNullish } from "util/misc";
import { NumericSOV } from "util/sorts";
import { ChartDocument, Game } from "tachi-common";
import { Header } from "../components/TachiTable";

function CascadingTierlistValue(
	chart: ChartDocument,
	...tiers: (keyof ChartDocument["tierlistInfo"])[]
) {
	for (const tier of tiers) {
		if (IsNotNullish(chart.tierlistInfo[tier])) {
			return chart.tierlistInfo[tier]!.value;
		}
	}

	return chart.levelNum;
}

export default function ChartHeader<D>(
	game: Game,
	chartGetter: (k: D) => ChartDocument
): Header<D> {
	let sortFn: (d: D) => number = (k) => chartGetter(k).levelNum;

	if (game === "iidx") {
		sortFn = (k) => CascadingTierlistValue(chartGetter(k), "kt-HC", "kt-NC");
	} else if (game === "bms" || game === "pms") {
		sortFn = (k) => CascadingTierlistValue(chartGetter(k), "sgl-EC", "sgl-HC");
	} else if (game === "itg") {
		return [
			"Chart",
			"Chart",
			(a, b) => {
				const ac = chartGetter(a) as ChartDocument<"itg:Stamina">;
				const bc = chartGetter(b) as ChartDocument<"itg:Stamina">;

				if (ac.levelNum === bc.levelNum) {
					return ac.data.displayBPM - bc.data.displayBPM;
				}

				return ac.levelNum - bc.levelNum;
			},
		];
	}

	return ["Chart", "Chart", NumericSOV(sortFn)];
}
