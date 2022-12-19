import { GetChartInfoForUser } from "./apiRequests";
import { PrependTachiUrl } from "./fetchTachi";
import {
	CreateChartLink,
	Entries,
	FormatChartTierlistInfo,
	FormatDate,
	FormatScoreData,
	FormatScoreRating,
	GetChartPertinentInfo,
	MillisToSince,
	Pluralise,
	UppercaseFirst,
} from "./misc";
import { BotConfig, ServerConfig } from "../config";
import { MessageEmbed } from "discord.js";
import { FormatChart } from "tachi-common";
import type {
	Game,
	ImportDocument,
	PBScoreDocument,
	Playtype,
	ScoreDocument,
	UserDocument,
	integer,
} from "tachi-common";

export function CreateEmbed(userID?: integer) {
	const embed = new MessageEmbed()
		.setColor(ServerConfig.type === "ktchi" ? "#e61c6e" : "#527acc")
		.setTimestamp();

	if (userID !== undefined) {
		embed.setThumbnail(PrependTachiUrl(`/users/${userID}/pfp`));
	}

	return embed;
}

export function CreateImportEmbed(importDoc: ImportDocument) {
	return CreateEmbed()
		.setTitle(
			`Imported ${importDoc.scoreIDs.length} ${Pluralise(
				importDoc.scoreIDs.length,
				"score"
			)}!`
		)
		.addField("Created Sessions", importDoc.createdSessions.length.toString(), true)
		.addField("Errors", importDoc.errors.length.toString(), true)
		.addField(
			"Your Profile",
			`${BotConfig.TACHI_SERVER_LOCATION}/u/${importDoc.userID}/games/${importDoc.game}`
		);
}

export function CreateUserEmbed(userDoc: UserDocument) {
	return CreateEmbed()
		.setTitle(`${userDoc.username} (ID: ${userDoc.id})`)
		.setThumbnail(PrependTachiUrl(`/users/${userDoc.id}/pfp`))
		.setDescription(userDoc.status ?? "No status...")
		.addField("Join Date", FormatDate(userDoc.joinDate))
		.setURL(`${BotConfig.TACHI_SERVER_LOCATION}/u/${userDoc.username}`);
}

export async function CreateChartScoresEmbed(
	userDoc: UserDocument,
	game: Game,
	playtype: Playtype,
	chartID: string,
	renderThisScore: ScoreDocument | null
) {
	const { song, chart, pb } = await GetChartInfoForUser(userDoc.id, chartID, game, playtype);

	let score: PBScoreDocument | ScoreDocument | null = renderThisScore;

	// if the user didn't pass a score to be rendered, render their PB.
	if (renderThisScore === null) {
		// eslint-disable-next-line no-param-reassign
		score = pb;
	}

	const embed = CreateEmbed()
		.setTitle(`${userDoc.username}: ${FormatChart(game, song, chart)}`)
		.setThumbnail(PrependTachiUrl(`/users/${userDoc.id}/pfp`))
		.setURL(CreateChartLink(chart, game));

	// unecessary OR here to assert to TS that this implies PB can't be null either.
	if (score === null || pb === null) {
		embed.setDescription(`${userDoc.username} has not played this chart.`);
	} else {
		const { scoreStr, lampStr } = FormatScoreData(score);

		embed
			.addField("Score", scoreStr, true)
			.addField("Lamp", lampStr, true)
			.addField(
				"Ratings",
				Entries(score.calculatedData)
					.map(
						([key, value]) =>
							`${UppercaseFirst(key)}: ${FormatScoreRating(
								game,
								playtype,
								key,
								value
							)}`
					)
					.join("\n")
			)
			.addField(
				"Last Raised",
				score.timeAchieved !== null
					? `${FormatDate(score.timeAchieved)} (${MillisToSince(score.timeAchieved)})`
					: "N/A",
				true
			);

		// if score is a PB
		if ("rankingData" in score) {
			embed.addField("Ranking", `#**${score.rankingData.rank}**/${score.rankingData.outOf}`);
		} else {
			const { scoreStr, lampStr } = FormatScoreData(pb);

			if (pb.scoreData.score !== score.scoreData.score) {
				embed.addField("PB Score", scoreStr, true);
			}

			if (pb.scoreData.lamp !== score.scoreData.lamp) {
				embed.addField("PB Lamp", lampStr, true);
			}
		}

		const pertinentInfo = GetChartPertinentInfo(game, chart);
		const tierlistInfo = FormatChartTierlistInfo(game, chart);

		if (pertinentInfo) {
			embed.addField("Related", pertinentInfo, !!tierlistInfo);
		}

		if (tierlistInfo) {
			embed.addField("Tierlist Info", tierlistInfo, !!pertinentInfo);
		}
	}

	return embed;
}
