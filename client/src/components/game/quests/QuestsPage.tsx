import useSetSubheader from "components/layout/header/useSetSubheader";
import DebounceSearch from "components/util/DebounceSearch";
import Divider from "components/util/Divider";
import React, { useState } from "react";
import { Col, Form } from "react-bootstrap";
import { FormatGame, GetGameConfig } from "tachi-common";
import { GamePT } from "types/react";

export default function QuestsPage({ game, playtype }: GamePT) {
	useSetSubheader(
		["Games", GetGameConfig(game).name, playtype, "Quests"],
		[game, playtype],
		`${FormatGame(game, playtype)} Quests`
	);

	const [search, setSearch] = useState("");

	return (
		<div>
			<DebounceSearch
				className="form-control-lg"
				setSearch={setSearch}
				placeholder="Search Quests..."
			/>
			<Divider />
		</div>
	);
}

// function QuestsSearchPage({ game, playtype, search }: { search: string } & GamePT) {}
