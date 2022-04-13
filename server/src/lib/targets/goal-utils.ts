import db from "external/mongo/db";
import { GenericCalculatePercent } from "lib/score-import/framework/common/score-utils";
import {
	ChartDocument,
	FormatGame,
	Game,
	GetGamePTConfig,
	GoalDocument,
	Playtypes,
} from "tachi-common";
import { GetFolderForIDGuaranteed, HumaniseChartID } from "utils/db";
import { GetFolderChartIDs } from "utils/folder";
import { FormatMaxDP, HumanisedJoinArray } from "utils/misc";

export async function CreateGoalTitle(
	charts: GoalDocument["charts"],
	criteria: GoalDocument["criteria"],
	game: Game,
	playtype: Playtypes[Game]
) {
	const formattedCriteria = FormatCriteria(criteria, game, playtype);

	const datasetName = await FormatCharts(charts, game);

	// Formatting this stuff into english is hard and excruciatingly manual.
	switch (criteria.mode) {
		case "single":
			switch (charts.type) {
				case "any":
					return `${formattedCriteria} any chart`;
				case "single":
				case "multi":
					return `${formattedCriteria} ${datasetName}`;
				case "folder":
					return `${formattedCriteria} any chart in ${datasetName}`;
			}
		// eslint-disable-next-line no-fallthrough
		case "absolute":
			switch (charts.type) {
				case "any":
					return `${formattedCriteria} ${criteria.countNum} charts`;
				case "multi":
					return `${formattedCriteria} ${criteria.countNum} of ${datasetName}`;
				case "folder":
					return `${formattedCriteria} ${criteria.countNum} charts in ${datasetName}`;
			}
			break;
		case "proportion":
			// I know declaring inside cases is a footgun, but I know better.
			// eslint-disable-next-line no-case-declarations
			const propFormat = FormatMaxDP(criteria.countNum * 100);

			switch (charts.type) {
				case "any":
					return `${formattedCriteria} ${propFormat}% of all charts`;
				case "multi":
					return `${formattedCriteria} ${propFormat}% of ${datasetName}`;
				case "folder":
					return `${formattedCriteria} ${propFormat}% of the charts in ${datasetName}`;
			}
	}

	throw new Error(`Couldn't create title from provided info. Is the provided data supported?`);
}

async function FormatCharts(charts: GoalDocument["charts"], game: Game) {
	if (charts.type === "single") {
		return HumaniseChartID(game, charts.data);
	} else if (charts.type === "multi") {
		// @inefficient
		// This could be done with significantly less db queries.
		const formattedTitles = await Promise.all(
			charts.data.map((chartID) => HumaniseChartID(game, chartID))
		);

		return HumanisedJoinArray(formattedTitles);
	} else if (charts.type === "folder") {
		const folder = await GetFolderForIDGuaranteed(charts.data);

		return `the ${folder.title} folder`;
	} else if (charts.type === "any") {
		return null;
	}
}

function FormatCriteria(criteria: GoalDocument["criteria"], game: Game, playtype: Playtypes[Game]) {
	const gptConfig = GetGamePTConfig(game, playtype);

	switch (criteria.key) {
		case "scoreData.gradeIndex":
			return gptConfig.grades[criteria.value];
		case "scoreData.lampIndex":
			return gptConfig.lamps[criteria.value];
		case "scoreData.percent":
			return `Get ${FormatMaxDP(criteria.value)}% on`;
		case "scoreData.score":
			return `Get ${criteria.value.toLocaleString("en-GB")} on`;
	}
}

/**
 * Given a goals' charts and criteria properties, evaluate whether those two make
 * any sense at all. There are certain combinations that are illegal, or values that
 * in general just should be constrained out.
 *
 * @warn This function is disgusting.
 */
export async function ValidateGoalChartsAndCriteria(
	charts: GoalDocument["charts"],
	criteria: GoalDocument["criteria"],
	game: Game,
	playtype: Playtypes[Game]
) {
	let chartCount = 0;
	// Validating the charts supplied
	if (charts.type === "single") {
		const chart = await db.charts[game].findOne({
			playtype,
			chartID: charts.data,
		});

		if (!chart) {
			throw new Error(
				`A chart with id ${charts.data} does not exist for ${game}:${playtype}.`
			);
		}

		chartCount = 1;
	} else if (charts.type === "folder") {
		const folder = await db.folders.findOne({
			game,
			playtype,
			folderID: charts.data,
		});

		if (!folder) {
			throw new Error(
				`A folder with id ${charts.data} does not exist for ${game}:${playtype}.`
			);
		}

		chartCount = (await GetFolderChartIDs(charts.data)).length;
	} else if (charts.type === "multi") {
		if (charts.data.length < 2) {
			throw new Error(
				`Invalid charts.data for 'multi' charts. Must specify atleast two charts.`
			);
		}

		const multiCharts = await db.charts[game].find({
			playtype,
			chartID: { $in: charts.data },
		});

		if (multiCharts.length !== charts.data.length) {
			throw new Error(
				`Expected charts.data to match ${charts.data.length} charts. Instead, it only matched ${multiCharts.length}. Are all of these chartIDs valid?`
			);
		}

		chartCount = multiCharts.length;
	} else {
		// (charts.type === "any")
		chartCount = await db.charts[game].count({ playtype });
	}

	// Validating criteria.mode against countNum.
	if (criteria.mode === "proportion") {
		if (criteria.countNum <= 0 || criteria.countNum > 1) {
			throw new Error(
				`Invalid countNum for goal with criteria.mode of 'proportion'. Expected a decimal in (0, 1]`
			);
		}

		if (Math.floor(chartCount * criteria.countNum) === 0) {
			throw new Error(
				`countNum is too small for goal. Would result in requiring 0 charts to achieve the goal.`
			);
		}
	} else if (
		criteria.mode === "absolute" &&
		(criteria.countNum > chartCount ||
			!Number.isInteger(criteria.countNum) ||
			criteria.countNum < 2)
	) {
		throw new Error(
			`Invalid countNum for goal with criteria.mode of 'abs'. Expected a whole number less than the total amount of charts available and greater than 1.`
		);
	}

	// checking whether the key and value make sense
	const gptConfig = GetGamePTConfig(game, playtype);
	if (criteria.key === "scoreData.gradeIndex" && !gptConfig.grades[criteria.value]) {
		throw new Error(
			`Invalid value of ${criteria.value} for grade goal. No such grade exists at that index.`
		);
	} else if (criteria.key === "scoreData.lampIndex" && !gptConfig.lamps[criteria.value]) {
		throw new Error(
			`Invalid value of ${criteria.value} for lamp goal. No such lamp exists at that index.`
		);
	} else if (
		criteria.key === "scoreData.percent" &&
		(criteria.value <= 0 || criteria.value > gptConfig.percentMax)
	) {
		throw new Error(
			`Invalid value of ${criteria.value} for percent goal. Percents must be between 0 and ${gptConfig.percentMax}.`
		);
	} else if (criteria.key === "scoreData.score") {
		if (criteria.value < 0) {
			throw new Error(`Invalid score value for goal. Can't be negative.`);
		}

		// troublemaker games where score is relative to notecount
		if (game === "iidx" || game === "bms" || game === "pms") {
			if (charts.type !== "single") {
				throw new Error(
					`Invalid key for ${game} with multiple charts. Creating score goals on multiple charts where score is relative to notecount is a terrible idea, and has been disabled.`
				);
			}

			const relatedChart = (await db.charts[game].findOne({
				playtype,
				chartID: charts.data,
			}))! as ChartDocument<
				"bms:14K" | "bms:7K" | "iidx:SP" | "iidx:DP" | "pms:Controller" | "pms:Keyboard"
			>;

			const notecount = relatedChart.data.notecount;

			if (criteria.value > notecount * 2) {
				throw new Error(
					`Invalid value of ${
						criteria.value
					} for goal. Maximum score possible on this chart is ${notecount * 2}.`
				);
			}
		} else if (GenericCalculatePercent(game, criteria.value) >= gptConfig.percentMax) {
			throw new Error(
				`Score of ${criteria.value} is too large for ${FormatGame(game, playtype)}.`
			);
		}
	}

	if (charts.type === "single" && criteria.mode !== "single") {
		throw new Error(`Criteria Mode must be 'single' if Charts Type is 'single'.`);
	}
}
