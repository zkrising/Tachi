# User Goal Document

The user goal document represents a user's subscription
to a goal.

!!! warning
	This does not describe the goal or its criteria,
	for that - see [Goal Document](./goal.md).

*****

## Definition

```ts
interface UserGoalDocument {
	goalID: string;
	userID: integer;
	game: Game;
	playtype: Playtypes[Game];
	achieved: boolean;
	timeSet: integer;
	timeAchieved: Integer | null;
	lastInteraction: Integer | null;
	progress: number | null;
	progressHuman: string;
	outOf: number;
	outOfHuman: string;
}
```

| Property | Description |
| :: | :: |
| `goalID` | This is the goal the user is subscribed to in this document. |
| `userID` | This is the user this goal subscription belongs to. |
| `game`, `playtype` | These fields are both *technically* redundant. However, for optimisation reasons, they are copied over from the goal document field. |
| `achieved` | Whether this goal has been achieved or not. |
| `timeSet` | The time the user set this goal. |
| `timeAchieved` | The time this user achieved this goal. If the user has not achieved this goal, it is set as `null`. |
| `progress` | The user's raw progress towards this goal. This is a number, and should not be displayed to the user. |
| `outOf` | The value this goal is out of - this is a number, and should not be displayed to the user. |
| `progressHuman`, `outOfHuman` | These are humanised, stringified versions of the above two fields. These convert things like the enum value of lamps to their string equivalents. |
