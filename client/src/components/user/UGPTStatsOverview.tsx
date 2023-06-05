import { FormatGPTProfileRating, UppercaseFirst } from "util/misc";
import { StrSOV } from "util/sorts";
import ClassBadge from "components/game/ClassBadge";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import MiniTable from "components/tables/components/MiniTable";
import Divider from "components/util/Divider";
import React from "react";
import {
	GetGamePTConfig,
	GPTString,
	ProfileRatingAlgorithms,
	UserGameStats,
	Classes,
} from "tachi-common";

export default function UGPTRatingsTable({ ugs }: { ugs: UserGameStats }) {
	const gptConfig = GetGamePTConfig(ugs.game, ugs.playtype);

	const ratings = Object.entries(ugs.ratings) as [ProfileRatingAlgorithms[GPTString], number][];

	return (
		<MiniTable className="table-sm text-center" headers={["Player Stats"]} colSpan={2}>
			<>
				{(Object.keys(gptConfig.classes) as Classes[GPTString][])
					.sort(StrSOV((x) => x[0]))
					.filter((k) => ugs.classes[k] !== undefined)
					.map((k) => (
						<tr key={k}>
							<td>{UppercaseFirst(k)}</td>
							<td>
								<ClassBadge
									showSetOnHover={false}
									key={`${k}:${ugs.classes[k]}`}
									game={ugs.game}
									playtype={ugs.playtype}
									classSet={k}
									classValue={ugs.classes[k]!}
								/>
							</td>
						</tr>
					))}
				{ratings.map(([k, v]) => (
					<tr key={k}>
						<td>
							<QuickTooltip
								tooltipContent={
									<div>
										{gptConfig.profileRatingAlgs[k].description}
										{k in gptConfig.scoreRatingAlgs && (
											<>
												<Divider />({UppercaseFirst(k)}:{" "}
												{gptConfig.scoreRatingAlgs[k].description})
											</>
										)}
									</div>
								}
							>
								<div
									style={{
										textDecoration: "underline",
										textDecorationStyle: "dotted",
									}}
								>
									{UppercaseFirst(k)}
								</div>
							</QuickTooltip>
						</td>
						<td>{FormatGPTProfileRating(ugs.game, ugs.playtype, k as any, v)}</td>
					</tr>
				))}
			</>
		</MiniTable>
	);
}

export function UGPTClassBadge({
	ugs,
	className = "",
}: {
	ugs: UserGameStats;
	className?: string;
}) {
	const gptConfig = GetGamePTConfig(ugs.game, ugs.playtype);

	return (
		<>
			{(Object.keys(gptConfig.classes) as Classes[GPTString][])
				.sort(StrSOV((x) => x[0]))
				.filter((k) => ugs.classes[k] !== undefined)
				.map((k) => (
					<>
						<ClassBadge
							showSetOnHover={false}
							key={`${k}:${ugs.classes[k]}`}
							game={ugs.game}
							playtype={ugs.playtype}
							classSet={k}
							classValue={ugs.classes[k]!}
							className={className}
						/>
					</>
				))}
		</>
	);
}

export function UGPTPrimaryRating({ ugs, className }: { ugs: UserGameStats; className?: string }) {
	const gptConfig = GetGamePTConfig(ugs.game, ugs.playtype);

	const ratings = Object.entries(ugs.ratings).map(
		([k, v]) => [k, v] as [ProfileRatingAlgorithms[GPTString], number]
	);

	let ratingK: ProfileRatingAlgorithms[GPTString] | null = null;
	let ratingV: number | null = null;

	if (ratings.length === 1) {
		[[ratingK, ratingV]] = ratings;
	} else {
		[[ratingK, ratingV]] = ratings.reverse();
	}

	return (
		<>
			<QuickTooltip
				tooltipContent={
					<div>
						{gptConfig.profileRatingAlgs[ratingK].description}
						{ratingK in gptConfig.scoreRatingAlgs && (
							<>
								<Divider />({UppercaseFirst(ratingK)}:{" "}
								{gptConfig.scoreRatingAlgs[ratingK].description})
							</>
						)}
					</div>
				}
			>
				<span id={`${ratingK}`} className={className ?? `${className}`}>
					{UppercaseFirst(ratingK)}{" "}
					<>{FormatGPTProfileRating(ugs.game, ugs.playtype, ratingK, ratingV)}</>
				</span>
			</QuickTooltip>
		</>
	);
}

export function UGPTOtherRatings({ ugs, className }: { ugs: UserGameStats; className?: string }) {
	const gptConfig = GetGamePTConfig(ugs.game, ugs.playtype);

	const ratings = Object.entries(ugs.ratings).map(
		([k, v]) => [k, v] as [ProfileRatingAlgorithms[GPTString], number]
	);

	let otherRatings: [ProfileRatingAlgorithms[GPTString], number][] = [];

	if (ratings.length === 1) {
		return null;
	} else {
		otherRatings = ratings.slice(0, -1);
	}

	return (
		<>
			{otherRatings.map(([k, v]) => (
				<QuickTooltip
					tooltipContent={
						<div>
							{gptConfig.profileRatingAlgs[k].description}
							{k in gptConfig.scoreRatingAlgs && (
								<>
									<Divider />({UppercaseFirst(k)}:{" "}
									{gptConfig.scoreRatingAlgs[k].description})
								</>
							)}
						</div>
					}
				>
					<span id={`${k}`} className={className ?? `${className}`}>
						{UppercaseFirst(k)}{" "}
						<>{FormatGPTProfileRating(ugs.game, ugs.playtype, k, v)}</>
					</span>
				</QuickTooltip>
			))}
		</>
	);
}
