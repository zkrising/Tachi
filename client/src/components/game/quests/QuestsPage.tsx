import { EscapeStringRegexp } from "util/misc";
import { CreateGoalMap } from "util/data";
import useSetSubheader from "components/layout/header/useSetSubheader";
import ApiError from "components/util/ApiError";
import BigSearch from "components/util/BigSearch";
import DebounceSearch from "components/util/DebounceSearch";
import DebugContent from "components/util/DebugContent";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React, { useMemo, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { FormatGame, GetGameConfig, QuestDocument } from "tachi-common";
import { GamePT } from "types/react";
import { GPTQuestsReturn } from "types/api-returns";
import Quest from "components/quests/Quest";

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
			<QuestsSearchPage game={game} playtype={playtype} search={search} />
		</div>
	);
}

function QuestsSearchPage({ game, playtype, search }: { search: string } & GamePT) {
	const url = search === "" ? "/popular" : `?search=${search}`;

	const { data, error } = useApiQuery<GPTQuestsReturn>(
		`/games/${game}/${playtype}/targets/quests${url}`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const goalMap = CreateGoalMap(data.goals);

	return (
		<Row>
			{data.quests.map((e) => (
				<Col xs={12} lg={6} className="my-4" key={e.questID}>
					<Quest quest={e} goals={goalMap} />
				</Col>
			))}
		</Row>
	);
}
