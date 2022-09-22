import { MakeDataset } from "util/seeds";
import React, { useMemo } from "react";
import { AllDatabaseSeeds, Game } from "tachi-common";
import SeedsBMSCourseLookupTable from "./SeedsBMSCourseLookupTable";
import SeedsTableTable from "./SeedsTableTable";
import SeedsFolderTable from "./SeedsFolderTable";
import SeedsSongsTable from "./SeedsSongsTable";

export default function SeedsTable({
	data,
	file,
}: {
	data: Partial<AllDatabaseSeeds>;
	file: keyof AllDatabaseSeeds;
}) {
	const dataset: any = useMemo(() => MakeDataset(file, data), [file, data]);

	if (file.startsWith("songs-")) {
		const [_, game] = /^songs-(.*?).json$/u.exec(file)!;

		return <SeedsSongsTable dataset={dataset} game={game as Game} />;
	} else if (file.startsWith("charts-")) {
		return <>temp</>;
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
