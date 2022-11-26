import { ChangeOpacity } from "util/color-opacity";
import { ExtractGameFromFile } from "util/misc";
import {
	DBSeedsDiff,
	DBSeedsDiffDeleted,
	DBSeedsDiffModified,
	DBSeedsDiffNew,
	MakeDataset,
} from "util/seeds";
import Divider from "components/util/Divider";
import SelectButton from "components/util/SelectButton";
import { ColourConfig } from "lib/config";
import React, { useEffect, useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { AllDatabaseSeeds } from "tachi-common";
import { ChangeIndicator, DiffSeedsCollection } from "types/seeds";
import MakeSeedsDiffTable from "./MakeSeedsDiffTable";
import MakeSeedsTable from "./MakeSeedsTable";
import {
	SeedsBMSCourseLookupCells,
	SeedsBMSCourseLookupHeaders,
	SeedsBMSCourseLookupSearchFns,
} from "./SeedsBMSCourseLookupTable";
import { SeedsTableCells, SeedsTableHeaders, SeedsTableSearchFns } from "./SeedsTableTable";
import { SeedsFolderCells, SeedsFolderHeaders, SeedsFolderSearchFns } from "./SeedsFolderTable";
import { MakeSeedsChartsControls } from "./SeedsChartsTable";
import { MakeSeedsSongsControls } from "./SeedsSongsTable";
import { SeedsGoalCells, SeedsGoalSearchFns, SeedsGoalsHeaders } from "./SeedsGoalsTable";
import { SeedsQuestCells, SeedsQuestSearchFns, SeedsQuestsHeaders } from "./SeedsQuestTable";
import {
	SeedsQuestlineCells,
	SeedsQuestlineHeaders,
	SeedsQuestlineSearchFns,
} from "./SeedsQuestlineTable";

export default function SeedsTable({
	data,
	file,
	indicate = null,
}: {
	data: Partial<AllDatabaseSeeds>;
	file: keyof AllDatabaseSeeds;
	indicate?: ChangeIndicator;
}) {
	const dataset: any = useMemo(() => MakeDataset(file, data), [file, data]);

	const tableControls = useMemo(() => GetTableControls(file), [file]);

	if (!tableControls) {
		return <>This collection does not have render controls.</>;
	}

	return <MakeSeedsTable {...(tableControls as any)} dataset={dataset} indicate={indicate} />;
}

export function SeedsDiffTable<T extends keyof AllDatabaseSeeds>({
	baseData,
	headData,
	file,
	diffs,
}: {
	baseData: Partial<AllDatabaseSeeds>;
	headData: Partial<AllDatabaseSeeds>;
	file: T;

	// disgusting types
	diffs: DBSeedsDiff<AllDatabaseSeeds[T][0]>[];
}) {
	// filter all these into their separate camps + disgusting type assertions
	const addedDiffs = diffs.filter((e) => e.type === "ADDED") as DBSeedsDiffNew<
		AllDatabaseSeeds[T][0]
	>[];
	const deletedDiffs = diffs.filter((e) => e.type === "DELETED") as DBSeedsDiffDeleted<
		AllDatabaseSeeds[T][0]
	>[];
	const modifiedDiffs = diffs.filter((e) => e.type === "MODIFIED") as DBSeedsDiffModified<
		AllDatabaseSeeds[T][0]
	>[];

	// Ok, this is kind of some insane hackery, but follow with me on this one.
	// We "make" a dataset, but with the collection replaced with the documents
	// affected in the diff, in this way, we only create a dataset of - say -
	// three modified folder documents, instead of the whole collection.
	const addedData = useMemo(
		() => ({
			...headData,
			[file]: addedDiffs.map((e) => e.head),
		}),
		[addedDiffs, file, headData]
	);

	// see above
	const deletedData = useMemo(
		() => ({
			...baseData,
			[file]: deletedDiffs.map((e) => e.base),
		}),
		[deletedDiffs, file, baseData]
	);

	// Overwhelmingly complex.
	// We split our diffs into separate arrays HEAD_DATA[] and BASE_DATA[]
	// then we make datasets from those.
	// we then rejoin the datasets in the same position, such that
	// B, DIFF, H
	// becomes
	// DATASET(B), DIFF, DATASET(H)
	const modifiedData = useMemo(() => {
		const head = [];
		const base = [];

		for (const diff of modifiedDiffs) {
			head.push(diff.head);
			base.push(diff.base);
		}

		const headDSet = MakeDataset(file, {
			...headData,
			[file]: head,
		});
		const baseDSet = MakeDataset(file, {
			...baseData,
			[file]: base,
		});

		const dataset: DiffSeedsCollection<any>[] = [];

		for (let i = 0; i < modifiedDiffs.length; i++) {
			const diff = modifiedDiffs[i]!;
			const head = headDSet[i]!;
			const base = baseDSet[i];

			dataset.push({
				head,
				base,
				diff: diff.diff,
			});
		}

		return dataset;
	}, [baseData, headData, file, modifiedDiffs]);

	// not handling the case where there's no diffs because that ain't possible
	const defaultView = modifiedDiffs.length ? "MODIFIED" : addedDiffs.length ? "ADDED" : "DELETED";

	const [view, setView] = useState<"ADDED" | "DELETED" | "MODIFIED">(defaultView);

	useEffect(() => {
		setView(modifiedDiffs.length ? "MODIFIED" : addedDiffs.length ? "ADDED" : "DELETED");
	}, [modifiedDiffs.length, addedDiffs.length]);

	return (
		<>
			<Row>
				<Col xs={12}>
					<div className="d-flex flex-wrap" style={{ justifyContent: "space-evenly" }}>
						{addedDiffs.length > 0 && (
							<SelectButton
								id="ADDED"
								value={view}
								setValue={setView}
								onStyle={{
									backgroundColor: ChangeOpacity(ColourConfig.primary, 0.6),
								}}
							>
								Added <span className="text-success">(+{addedDiffs.length})</span>
							</SelectButton>
						)}
						{modifiedDiffs.length > 0 && (
							<SelectButton
								id="MODIFIED"
								value={view}
								setValue={setView}
								onStyle={{
									backgroundColor: ChangeOpacity(ColourConfig.primary, 0.6),
								}}
							>
								Modified{" "}
								<span className="text-warning">(~{modifiedDiffs.length})</span>
							</SelectButton>
						)}
						{deletedDiffs.length > 0 && (
							<SelectButton
								id="DELETED"
								value={view}
								setValue={setView}
								onStyle={{
									backgroundColor: ChangeOpacity(ColourConfig.primary, 0.6),
								}}
							>
								Deleted{" "}
								<span className="text-danger">(-{deletedDiffs.length})</span>
							</SelectButton>
						)}
					</div>
					<Divider />
				</Col>

				{view === "ADDED" ? (
					<SeedsTable data={addedData} file={file} indicate="ADDED" />
				) : view === "DELETED" ? (
					<SeedsTable data={deletedData} file={file} indicate="REMOVED" />
				) : (
					<InnerSeedsDifftable dataset={modifiedData} file={file} />
				)}
			</Row>
		</>
	);
}

function InnerSeedsDifftable({
	dataset,
	file,
}: {
	// any here is a funny hack because TS doesn't really have nice match statements
	// ah well.
	dataset: DiffSeedsCollection<any>[];
	file: keyof AllDatabaseSeeds;
}) {
	const tableControls = useMemo(() => GetTableControls(file), [file]);

	if (!tableControls) {
		return <>This collection does not have render controls.</>;
	}

	return <MakeSeedsDiffTable {...(tableControls as any)} dataset={dataset} />;
}

function GetTableControls(file: keyof AllDatabaseSeeds) {
	if (file.startsWith("songs-")) {
		const game = ExtractGameFromFile(file);

		return {
			...MakeSeedsSongsControls(game),
			entryName: "Songs",
		};
	} else if (file.startsWith("charts-")) {
		const game = ExtractGameFromFile(file);

		return {
			...MakeSeedsChartsControls(game),
			entryName: "Charts",
		};
	}

	if (file === "bms-course-lookup.json") {
		return {
			Cells: SeedsBMSCourseLookupCells,
			headers: SeedsBMSCourseLookupHeaders,
			searchFns: SeedsBMSCourseLookupSearchFns,
			entryName: "BMS Courses",
		};
	} else if (file === "tables.json") {
		return {
			Cells: SeedsTableCells,
			headers: SeedsTableHeaders,
			searchFns: SeedsTableSearchFns,
			entryName: "Tables",
		};
	} else if (file === "folders.json") {
		return {
			Cells: SeedsFolderCells,
			headers: SeedsFolderHeaders,
			searchFns: SeedsFolderSearchFns,
			entryName: "Folders",
		};
	} else if (file === "goals.json") {
		return {
			Cells: SeedsGoalCells,
			headers: SeedsGoalsHeaders,
			searchFns: SeedsGoalSearchFns,
			entryName: "Goals",
		};
	} else if (file === "quests.json") {
		return {
			Cells: SeedsQuestCells,
			headers: SeedsQuestsHeaders,
			searchFns: SeedsQuestSearchFns,
			entryName: "Quests",
		};
	} else if (file === "questlines.json") {
		return {
			Cells: SeedsQuestlineCells,
			headers: SeedsQuestlineHeaders,
			searchFns: SeedsQuestlineSearchFns,
			entryName: "Questlines",
		};
	}

	return null;
}
