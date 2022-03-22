import { EmbedFieldData, MessageEmbed, Util } from "discord.js";
import {
	ChartDocument,
	FolderDocument,
	FormatChart,
	FormatGame,
	Game,
	GetGamePTConfig,
	ImportDocument,
	integer,
	Playtype,
	PublicUserDocument,
	ScoreDocument,
	SongDocument,
} from "tachi-common";
import { BotConfig, ServerConfig } from "../config";
import { GetChartInfoForUser } from "./apiRequests";
import { ParseTimelineTarget } from "./argParsers";
import { PrependTachiUrl, TachiServerV1Get } from "./fetchTachi";
import {
	CreateChartLink,
	Entries,
	FormatChartTierlistInfo,
	FormatDate,
	FormatProfileRating,
	FormatScoreData,
	FormatScoreRating,
	GetChartPertinentInfo,
	MillisToSince,
	Pluralise,
	UppercaseFirst,
} from "./misc";
import { UGPTFolderStat, UGPTFolderTimeline, UGPTStats } from "./returnTypes";

export function CreateEmbed() {
	return new MessageEmbed()
		.setColor(ServerConfig.type === "ktchi" ? "#e61c6e" : "#527acc")
		.setTimestamp();
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
			`${BotConfig.TACHI_SERVER_LOCATION}/dashboard/users/${importDoc.userID}/games/${importDoc.game}`
		);
}

export function CreateUserEmbed(userDoc: PublicUserDocument) {
	return CreateEmbed()
		.setTitle(`${userDoc.username} (#${userDoc.id})`)
		.setThumbnail(PrependTachiUrl(`/users/${userDoc.id}/pfp`))
		.setDescription(userDoc.status ?? "No status...")
		.addField("Join Date", FormatDate(userDoc.joinDate))
		.setURL(`${BotConfig.TACHI_SERVER_LOCATION}/dashboard/users/${userDoc.username}`);
}

export function CreateGameProfileEmbed(userDoc: PublicUserDocument, ugptStats: UGPTStats) {
	const { game, playtype } = ugptStats.gameStats;

	const gptConfig = GetGamePTConfig(game, playtype);

	return CreateEmbed()
		.setTitle(`${userDoc.username} (${FormatGame(game, playtype)})`)
		.setThumbnail(PrependTachiUrl(`/users/${userDoc.id}/pfp`))
		.setDescription(userDoc.status ?? "No status...")
		.addField(
			"Rankings",
			Entries(ugptStats.rankingData)
				.map(
					([k, v]) =>
						`**${k}**: #${v.ranking}/${v.outOf} (${FormatProfileRating(
							game,
							playtype,
							k,
							ugptStats.gameStats.ratings[k]
						)})`
				)
				.join("\n"),
			true
		)
		.addField(
			"Classes",
			Entries(ugptStats.gameStats.classes)
				.map(
					([k, v]) =>
						`**${UppercaseFirst(k)}**: ${gptConfig.classHumanisedFormat[k][v].display}`
				)
				.join("\n"),
			true
		)
		.addField("Playcount", ugptStats.totalScores.toString())
		.addField(
			"First Play",
			ugptStats.firstScore.timeAchieved
				? `${FormatDate(ugptStats.firstScore.timeAchieved)}
(${MillisToSince(ugptStats.firstScore.timeAchieved)})`
				: "N/A",
			true
		)
		.addField(
			"Last Played",
			ugptStats.mostRecentScore.timeAchieved
				? `${FormatDate(ugptStats.mostRecentScore.timeAchieved)}
(${MillisToSince(ugptStats.mostRecentScore.timeAchieved)})`
				: "N/A",
			true
		)
		.setURL(
			`${BotConfig.TACHI_SERVER_LOCATION}/dashboard/users/${userDoc.username}/games/${game}/${playtype}`
		);
}

export async function CreateChartScoresEmbed(
	userDoc: PublicUserDocument,
	game: Game,
	playtype: Playtype,
	chartID: string
) {
	const { song, chart, pb } = await GetChartInfoForUser(userDoc.id, chartID, game, playtype);

	const embed = CreateEmbed()
		.setTitle(`${userDoc.username}: ${FormatChart(game, song, chart)}`)
		.setThumbnail(PrependTachiUrl(`/users/${userDoc.id}/pfp`))
		.setURL(CreateChartLink(chart, game));

	if (pb === null) {
		embed.setDescription(`${userDoc.username} has not played this chart.`);
	} else {
		const { scoreStr, lampStr } = FormatScoreData(pb);

		embed
			.addField("Score", scoreStr, true)
			.addField("Lamp", lampStr, true)
			.addField(
				"Ratings",
				Entries(pb.calculatedData)
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
				pb.timeAchieved
					? `${FormatDate(pb.timeAchieved)} (${MillisToSince(pb.timeAchieved)})`
					: "N/A",
				true
			)
			.addField("Ranking", `#**${pb.rankingData.rank}**/${pb.rankingData.outOf}`);

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

export async function CreateFolderStatsEmbed(
	game: Game,
	playtype: Playtype,
	username: string,
	folderID: string
) {
	const statsRes = await TachiServerV1Get<{ folder: FolderDocument; stats: UGPTFolderStat }>(
		`/users/${username}/games/${game}/${playtype}/folders/${folderID}/stats`,
		null
	);

	if (!statsRes.success) {
		throw new Error(`Failed to fetch stats on ${folderID} for ${username}.`);
	}

	const { folder, stats } = statsRes.body;

	const gptConfig = GetGamePTConfig(game, playtype);

	return CreateEmbed()
		.setTitle(`${username}: ${folder.title}`)
		.setURL(
			`${BotConfig.TACHI_SERVER_LOCATION}/dashboard/users/${username}/games/${game}/${playtype}/folders/${folderID}`
		)
		.addField(
			"Lamp Distribution",
			gptConfig.lamps
				.slice()
				.reverse()
				.map((l) => `${l}: ${stats.lamps[l] ?? 0}`)
				.join("\n"),
			true
		)
		.addField(
			"Grade Distribution",
			gptConfig.grades
				.slice()
				.reverse()
				.map((g) => `${g}: ${stats.grades[g] ?? 0}`)
				.join("\n"),
			true
		)

		.addField("Total Charts", stats.chartCount.toString());
}

export async function CreateFolderTimelineEmbed(
	game: Game,
	playtype: Playtype,
	username: string,
	folderID: string,
	formatMethod: "recent" | "first",
	rawTarget: string
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const { type, value } = ParseTimelineTarget(game, playtype, rawTarget);

	const prettyValue = gptConfig[type === "grade" ? "grades" : "lamps"][value];

	const timelineRes = await TachiServerV1Get<UGPTFolderTimeline>(
		`/users/${username}/games/${game}/${playtype}/folders/${folderID}/timeline`,
		null,
		{
			criteriaType: type,
			criteriaValue: value.toString(),
		}
	);

	if (!timelineRes.success) {
		throw new Error(
			`Failed to retrieve timeline info for ${username} on folderID: ${folderID}.`
		);
	}

	const { folder, songs, charts, scores } = timelineRes.body;

	const songMap = new Map<integer, SongDocument>();
	const chartMap = new Map<string, ChartDocument>();
	const scoreMap = new Map<string, ScoreDocument>();

	for (const song of songs) {
		songMap.set(song.id, song);
	}

	for (const chart of charts) {
		chartMap.set(chart.chartID, chart);
	}

	for (const score of scores) {
		scoreMap.set(score.scoreID, score);
	}

	let fields: EmbedFieldData[] = [];

	fields = scores
		.filter((e) => e.timeAchieved !== null)
		.sort((a, b) =>
			formatMethod === "first"
				? a.timeAchieved! - b.timeAchieved!
				: b.timeAchieved! - a.timeAchieved!
		)
		.slice(0, 5)
		.map((sc) => {
			const { scoreStr, lampStr } = FormatScoreData(sc);

			return {
				name: Util.escapeMarkdown(
					FormatChart(game, songMap.get(sc.songID)!, chartMap.get(sc.chartID)!)
				),
				value: `${scoreStr}
${lampStr}
${FormatDate(sc.timeAchieved!)} (${MillisToSince(sc.timeAchieved!)})`,
			};
		});

	const embed = CreateEmbed()
		.setTitle(
			`${username}: ${folder.title} (${
				formatMethod === "first" ? "First" : "Most Recent"
			} ${prettyValue}s)`
		)
		.setURL(
			`${BotConfig.TACHI_SERVER_LOCATION}/dashboard/users/${username}/games/${game}/${playtype}/folders/${folderID}`
		);

	if (fields.length === 0) {
		return embed.addField("N/A", "This user has never achieved this target in this folder.");
	}

	return embed.addFields(fields);
}
