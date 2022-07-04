import { IsNotNullish } from "util/misc";
import { NumericSOV } from "util/sorts";
import { ChartDocument, Game } from "tachi-common";
import { FolderDataset, PBDataset, ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
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

export default function ChartHeader<D extends ScoreDataset | FolderDataset | PBDataset>(
	game: Game,
	playtype: Playtype,
	chartGetter: (k: D[0]) => ChartDocument
): Header<D[0]> {
	let sortFn: (d: D[0]) => number = k => chartGetter(k).levelNum;

	if (game === "iidx") {
		sortFn = k => CascadingTierlistValue(chartGetter(k), "kt-HC", "kt-NC");
	} else if (game === "bms" || game === "pms") {
		sortFn = k => CascadingTierlistValue(chartGetter(k), "sgl-HC", "sgl-EC");
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
