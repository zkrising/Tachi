import { UppercaseFirst } from "util/misc";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
import React from "react";
import { Badge } from "react-bootstrap";
import { Classes, GPTString, GetGPTString, GetGamePTConfig } from "tachi-common";
import { GamePT } from "types/react";

export default function ClassBadge<GPT extends GPTString = GPTString>({
	game,
	playtype,
	classSet,
	classValue,
	className = "",
	showSetOnHover = true,
}: {
	classSet: Classes[GPT];
	classValue: string;
	className?: string;
	showSetOnHover?: boolean;
} & GamePT) {
	const classStyle =
		// @ts-expect-error hepl i'm trapped in a type factory
		GPT_CLIENT_IMPLEMENTATIONS[GetGPTString(game, playtype)].classColours[classSet][classValue];

	const data = GetGamePTConfig(game, playtype).classes[classSet].values.find(
		(e) => e.id === classValue
	);

	if (!data) {
		return (
			<>
				{classSet} {classValue} (messed up!)
			</>
		);
	}

	let badgeComponent;

	if (classStyle === null) {
		badgeComponent = (
			<Badge className={className} bg={"black"}>
				{data.display}
			</Badge>
		);
	} else if (typeof classStyle === "string") {
		badgeComponent = (
			<Badge className={className} bg={classStyle}>
				{data.display}
			</Badge>
		);
	} else {
		badgeComponent = (
			<Badge className={className} bg={""} style={classStyle}>
				{data.display}
			</Badge>
		);
	}

	if (data.hoverText && showSetOnHover) {
		return (
			<QuickTooltip tooltipContent={`${UppercaseFirst(classSet)}: ${data.hoverText}`}>
				{badgeComponent}
			</QuickTooltip>
		);
	} else if (data.hoverText) {
		return <QuickTooltip tooltipContent={data.hoverText}>{badgeComponent}</QuickTooltip>;
	} else if (showSetOnHover) {
		<QuickTooltip tooltipContent={UppercaseFirst(classSet)}>{badgeComponent}</QuickTooltip>;
	}

	return badgeComponent;
}
