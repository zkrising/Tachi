import { APIFetchV1 } from "util/api";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import React, { createContext, useEffect, useState } from "react";
import { GoalSubscriptionDocument, QuestSubscriptionDocument } from "tachi-common";
import { UGPTTargetSubs } from "types/api-returns";
import { JustChildren } from "types/react";

export const TargetsContext = createContext<{
	questSubs: Map<string, QuestSubscriptionDocument>;
	goalSubs: Map<string, GoalSubscriptionDocument>;
	reloadTargets: () => Promise<void>;
}>({
	questSubs: new Map(),
	goalSubs: new Map(),
	// eslint-disable-next-line require-await
	reloadTargets: async () => void 0,
});

export function TargetsContextProvider({ children }: JustChildren) {
	const { settings } = useLUGPTSettings();

	const [questSubs, setQuestSubs] = useState<Map<string, QuestSubscriptionDocument>>(new Map());
	const [goalSubs, setGoalSubs] = useState<Map<string, GoalSubscriptionDocument>>(new Map());

	const reloadTargets = async () => {
		if (!settings) {
			setQuestSubs(new Map());
			setGoalSubs(new Map());
			return;
		}

		await APIFetchV1<UGPTTargetSubs>(
			`/users/${settings.userID}/games/${settings.game}/${settings.playtype}/targets/all-subs`
		).then((r) => {
			if (!r.success) {
				setQuestSubs(new Map());
				setGoalSubs(new Map());
				return;
			}

			const questSubMap = new Map<string, QuestSubscriptionDocument>();
			const goalSubMap = new Map<string, GoalSubscriptionDocument>();

			for (const qSub of r.body.questSubs) {
				questSubMap.set(qSub.questID, qSub);
			}
			for (const gSub of r.body.goalSubs) {
				goalSubMap.set(gSub.goalID, gSub);
			}

			setQuestSubs(questSubMap);
			setGoalSubs(goalSubMap);
		});
	};

	// fetch the target subscriptions from the api.
	useEffect(() => {
		reloadTargets();
	}, [settings]);

	return (
		<TargetsContext.Provider value={{ goalSubs, questSubs, reloadTargets }}>
			{children}
		</TargetsContext.Provider>
	);
}
