# Goal Document

Goals are stored in `goals`.

!!! warning
	This document describes a goal, but does not describe
	a user's "subscription" to that goal. For that, see
	[User Goal Document](./user-goal.md).

*****

## Definition

A base goal document is defined as follows.

```ts
interface BaseGoalDocument {
	game: Game;
	playtype: Playtypes[Game];
	timeAdded: integer;
	createdBy: integer;
	title: string;
	goalID: string;
	criteria: GoalSingleCriteria | GoalCountCriteria;
}
```

| Property | Description |
| :: | :: |
| `game` | The game this goal is for. |
| `playtype` | The playtype this goal is for. Must be a valid playtype for the above game. |
| `timeAdded` | The time this goal was added to the database. |
| `createdBy` | The ID of the user that originally made this goal. |
| `title` | A humanised name for this goal. |
| `goalID` | A hash of the criteria and chart set for this goal. Used to de-dupe goals. |

### Criteria

Criteria is defined as follows:

```ts
interface GoalCriteria {
	key: "scoreData.percent" | "scoreData.lampIndex" | "scoreData.gradeIndex" | "scoreData.score";
	value: number;
}

interface GoalSingleCriteria extends GoalCriteria {
	mode: "single";
}

interface GoalCountCriteria extends GoalCriteria {
	mode: "abs" | "proportion";
	countNum: number;
}
```

| Property | Description |
| :: | :: |
| `key` | Defines the key this goal is for - these correspond to keys in a [Score Document](./score.md). |
| `value` | The value this goal must hit in order for it to be achieved. What this value is interpreted as depends on `key`. |
| `mode` | If single, this just means the user only has to have one score that meets the above criteria on the defined set of charts. If abs or proportion, the user must hit `countNum` amount of scores on the set of charts (or that percent). |
| `countNum` | If mode is abs, this defines an absolute amount of scores the user must get. If proportion, the user must get this percent of the set of charts achieved. |

### Charts

The set of charts this goal applies to is added onto the
goal document under the `charts` key.

There are four types of goal.

```ts
interface GoalDocumentSingle extends BaseGoalDocument {
	charts: {
		type: "single";
		data: string;
	};
}

interface GoalDocumentMulti extends BaseGoalDocument {
	charts: {
		type: "multi";
		data: string[];
	};
}

interface GoalDocumentFolder extends BaseGoalDocument {
	charts: {
		type: "folder";
		data: string;
	};
}

interface GoalDocumentAny extends BaseGoalDocument {
	charts: {
		type: "any";
	};
}
```

For single and multi, the data field is a chartID, or an
array of chartIDs respectively.

For the folder type, the data field is a folderID.