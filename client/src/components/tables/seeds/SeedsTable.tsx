import { ExtractGameFromFile } from "util/misc";
import { MakeDataset } from "util/seeds";
import React, { useMemo } from "react";
import { AllDatabaseSeeds, Game } from "tachi-common";
import SeedsBMSCourseLookupTable from "./SeedsBMSCourseLookupTable";
import SeedsChartsTable from "./SeedsChartsTable";
import SeedsFolderTable from "./SeedsFolderTable";
import SeedsSongsTable from "./SeedsSongsTable";
import SeedsTableTable from "./SeedsTableTable";

export default function SeedsTable({
	data,
	file,
}: {
	data: Partial<AllDatabaseSeeds>;
	file: keyof AllDatabaseSeeds;
}) {
	const dataset: any = useMemo(() => MakeDataset(file, data), [file, data]);

	if (file.startsWith("songs-")) {
		const game = ExtractGameFromFile(file);

		return <SeedsSongsTable dataset={dataset} game={game as Game} />;
	} else if (file.startsWith("charts-")) {
		const game = ExtractGameFromFile(file);

		if (file === "charts-iidx.json") {
			return (
				<>
					<span>
						Tip: Use a filter of <code>level:!0</code> to filter out 2DXTra charts.
					</span>
					<SeedsChartsTable dataset={dataset} game={game as Game} />;
				</>
			);
		}

		return <SeedsChartsTable dataset={dataset} game={game as Game} />;
	}

	if (file === "bms-course-lookup.json") {
		return <SeedsBMSCourseLookupTable dataset={dataset} />;
	} else if (file === "tables.json") {
		return <SeedsTableTable dataset={dataset} />;
	} else if (file === "folders.json") {
		return <SeedsFolderTable dataset={dataset} />;
	}

	return <></>;
}
