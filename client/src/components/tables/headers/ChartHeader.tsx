import { ChartDocument, Game } from "tachi-common";
import { FolderDataset, PBDataset, ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { IsNotNullish } from "util/misc";
import { NumericSOV } from "util/sorts";
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
	}

	return ["Chart", "Chart", NumericSOV(sortFn)];
}
