import QuickTooltip from "components/layout/misc/QuickTooltip";
import React from "react";
import { Badge } from "react-bootstrap";
import { GetGamePTConfig, IDStrings, integer } from "tachi-common";
import { GameClassSets } from "tachi-common/js/game-classes";
import { GamePT } from "types/react";
import { UppercaseFirst } from "util/misc";

export default function ClassBadge<I extends IDStrings = IDStrings>({
	game,
	playtype,
	classSet,
	classValue,
	showSetOnHover = true,
}: {
	classSet: GameClassSets[I];
	classValue: integer;
	showSetOnHover?: boolean;
} & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const data = gptConfig.classHumanisedFormat[classSet][classValue];

	if (!data) {
		throw new Error(`Unknown class value ${classSet}:${classValue}`);
	}

	let badgeComponent;
	if (data.variant) {
		badgeComponent = <Badge variant={data.variant}>{data.display}</Badge>;
	} else if (data.css) {
		badgeComponent = <Badge style={data.css}>{data.display}</Badge>;
	} else {
		badgeComponent = <Badge variant="secondary">{data.display}</Badge>;
	}

	if (data.mouseover && showSetOnHover) {
		return (
			<QuickTooltip text={`${UppercaseFirst(classSet)}: ${data.mouseover}`}>
				{badgeComponent}
			</QuickTooltip>
		);
	} else if (data.mouseover) {
		return <QuickTooltip text={data.mouseover}>{badgeComponent}</QuickTooltip>;
	} else if (showSetOnHover) {
		<QuickTooltip text={UppercaseFirst(classSet)}>{badgeComponent}</QuickTooltip>;
	}

	return badgeComponent;
}
