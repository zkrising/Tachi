# Session Document

- Stored in `sessions`

## Definition
```ts
interface SessionDocument {
	userID: integer;
	sessionID: string;
	scoreInfo: SessionScoreInfo[];
	name: string;
	desc: string | null;
	game: Game;
	playtype: AnyPlaytype;
	// This field is allowed to be null for compatibility with kamaitachi1 sessions, where import types didn't exist.
	importType: ImportTypes | null;
	timeInserted: integer;
	timeStarted: integer;
	timeEnded: integer;
	calculatedData: Partial<Record<__GPTSpecific, number | null>>;
	highlight: boolean;
	views: integer;
}
```

| Property | Description |
| :: | :: |
| `userID` | The user who this session belongs to. |
| `sessionID` | A unique identifier for this session. |
| `scoreInfo` | An array of information about the scores in this session. Described in more detail below. |
| `name` | The name of this session. Session names default to some random adjectives and nouns conjoined. |
| `desc` | A Description for this session. Session descriptions default to null. |
| `game` | The game this session was for. |
| `playtype` | The playtype this session was for. |
| `importType` | The [Import Type](../import/import-types.md) that produced this session. Sessions converted from Kamaitachi 1 are given an importType of null. |
| `timeInserted` | The time this session was inserted into the database. This is **NOT** when the session started. |
| `timeStarted` | The time the session started. |
| `timeEnded` | The time the session ended. Note that if this is less than 2 hours ago, the session may still be extended by future scores. |
| `calculatedData` | Calculated Statistics about this session. The keys in this object depend on the game and playtype. For more information, see [Statistics](../../user/stats/tachi.md).
| `highlight` | Whether this session was highlighted or not by the user. |
| `views` | How many people have viewed this session. |

## Score Info

Score Info is an array inside the session document which holds some information about the actual scores in the session.

Its length is equivalent to the amount of scores inside this session.

```ts
interface SessionScorePBInfo {
	scoreID: string;
	isNewScore: false;
	scoreDelta: number;
	gradeDelta: integer;
	lampDelta: integer;
	percentDelta: number;
}

interface SessionScoreNewInfo {
	scoreID: string;
	isNewScore: true;
}

type SessionScoreInfo = SessionScorePBInfo | SessionScoreNewInfo;
```

If a the user has never played the chart before, then `isNewScore` is set to true, and no more information about the score is stored.

If the user already had scores on the chart, some information about how the score compared to the users PB **at the time of session creation** is stored alongside the score.

!!! warning
	This is a small oddity with sessions. The delta information is compared against your PB at the time the score is being inserted into the session.

	This means if you import scores from the past (say, 2015), and already have scores from more recently (say, 2019), the scoreInfo will compare against your PBs from 2019, even though that's technically from the future!

	This is not really a bug, and is more of an oddity. It is unlikely to affect anything.

| Property | Description |
| :: | :: |
| `isNewScore` | See above. |
| `scoreDelta` | The difference between this score's score value and the current PBs. Negative implies this score is worse. |
| `gradeDelta` | The difference between this score's gradeIndex and the current PBs. Negative implies this grade is worse. |
| `lampDelta` | The difference between this score's lampIndex and the current PBs. Negative implies this lamp is worse. |
| `percentDelta` | The difference between this score's percent and the current PBs. Negative implies this percent is worse. |

