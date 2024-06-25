import ClassBadge from "components/game/ClassBadge";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import MiniTable from "components/tables/components/MiniTable";
import DebugContent from "components/util/DebugContent";
import React from "react";
import { Classes, FormatGame, GetGameConfig, GetGamePTConfig, GPTString } from "tachi-common";
import { GamePT } from "types/react";

export default function GPTDevInfo({ game, playtype }: GamePT) {
	useSetSubheader(
		["Games", GetGameConfig(game).name, playtype, "Dev Info"],
		[game, playtype],
		`${FormatGame(game, playtype)} Dev Info`
	);

	const gameConfig = GetGameConfig(game);
	const gptConfig = GetGamePTConfig(game, playtype);

	return (
		<>
			<Card header="Game Configuration">
				<DebugContent data={gameConfig} />
			</Card>
			<Card className="mt-4" header="GPT Configuration">
				<DebugContent data={gptConfig} />
			</Card>
			<Card className="mt-4" header="Class Badges">
				<div className="d-flex w-100 justify-content-center" style={{ gap: "30px" }}>
					{Object.entries(gptConfig.classes).map(([classSet, conf]) => (
						<div key={classSet}>
							<MiniTable headers={[classSet]} colSpan={2}>
								{conf.values.map((e) => (
									<tr key={e.id}>
										<td>{e.id}</td>
										<td>
											<ClassBadge
												classSet={classSet as Classes[GPTString]}
												classValue={e.id}
												game={game}
												playtype={playtype}
											/>
										</td>
									</tr>
								))}
							</MiniTable>
						</div>
					))}
				</div>
			</Card>
		</>
	);
}
