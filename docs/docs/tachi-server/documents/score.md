# Score Document

- Stored in `scores`.

!!! info
	The same kind of score document is used for every game.
	As such, this document is rather complex.

	To make parsing this document easier, we're going to
	define the "Base Score" document, then define all
	the game-specific fields and properties that appear.

*****

## Definition

```ts
interface PublicUserDocument {
	service: string;
	game: "iidx" | "bms" // ...etc;
	playtype: __GameSpecific;
	userID: integer;
	scoreData: {
		score: number;
		lamp: __GameSpecific;
		percent: number;
		grade: __GameSpecific;
		lampIndex: integer;
		gradeIndex: integer;
		esd: number | null;
		judgements: __GameSpecific;
		hitMeta: __GameSpecific;
	};
	scoreMeta: __GameSpecific;
	calculatedData: __GameSpecific;
	timeAchieved: integer | null;
	songID: integer;
	chartID: string;
	isPrimary: boolean;
	highlight: boolean;
	comment: string | null;
	timeAdded: integer;
	scoreID: string;
	importType: ImportTypes | null;
}
```

!!! note
	All fields marked with __GameSpecific change
	depending on the game and playtype this score
	is for. We'll go over all of those in a bit.

The base score document is structured as follows:

| Property | Description |
| :: | :: |
| `game` | This is the game this score is for. |
| `service` | This is a humanised string for representing the place this score came from. This is primarily used by [Batch-Manual](../batch-manual/overview.md) formats to declare where the scores are coming from. |
| `userID` | The user that got this score. |
| `timeAchieved` | This is the time this score was actually achieved. This is **NOT NECESSARILY** the time this score was inserted into the database. If this is not known, it can be set to null. |
| `timeAdded` | This is the time the score was added to the Tachi database. This is **NOT NECESSARILY** the time the score was achieved. |
| `songID` | The song this score is on. Even though this can be derived from `chartID`, it's kept next to the score for certain query optimisations. You can read on the difference between charts and songs [here](../implementation-details/songs-charts.md). |
| `chartID` | The chart this score was achieved on. |
| `isPrimary` | Whether this score is was achieved on a "primary" chart or not. You can read more on what a primary chart is [here](../implementation-details/songs-charts.md#isPrimary). |
| `highlight` | Whether this individual score was highlighted or not by the user. This is one of the few mutable fields on the score document. |
| `comment` | A comment left by the user on this score. If one is not present, it is left as `null`. Comments are capped at 240 characters. |
| `scoreID` | A unique identifier for this score. Score IDs are prefixed with `R`. This identifier is derived from the content of the score, and thus can be used to dedupe scores. See [Score IDs](../implementation-details/score-id.md). |
| `importType` | The import type used to import this score. For more on this, see [Import Types](../import/import-types.md) |

Now, absolutely none of the above fields contain
information about the actual *score* the user got,
as in, the numbers they achieved! (Other than the
`timeAchieved` property, maybe).

That is stored in the below sub-documents.

### `scoreData`

The below table describes the properties of the `scoreData`
sub-document.

| Property | Description |
| :: | :: |
| `score` | A number describing the "score" the user got. Depending on the game, this may be bounded between various numbers. |
| `lamp` | The lamp the user got. For more information on what a lamp is, see [What are Lamps?](../../user/lamps.md)
| `percent` | The 'percent' the user got. That is, their score scaled to the total amount of score they could have possibly got. There are some oddities with this field.[^1]. |
| `grade` | The grade the user got. For most games, this is a set of discrete cutoffs for the score's `percent`.[^2] |
| `lampIndex`, `gradeIndex` | While `lamp` and `grade` are both strings, these are the raw enum values for those fields. This can be used for filters (select scores where lampIndex > lamps.HARD_CLEAR), or other query methods. |
| `esd` | Some games support ESD. This field contains the ESD for that score. For more information on what ESD is, see [What is ESD?](../../user/stats/esd.md)
| `judgements` | A record of Judgement->Integer values. The keys for this property depend on the game the score is for. |
| `hitMeta` | 'Meta' information about the user's *hits*. That is, things that aren't *literally* about the score, but are related to how well the user played. This contains properties such as `maxCombo` and `fast` and `slow` counts. All the fields here are optional and nullable. Some games extend this to provide things like `gauge`. |

### `scoreMeta`

The counterpart to `scoreData` is `scoreMeta`, which is
an entirely game-specific record containing meta information
about how the play was achieved.

!!! warning
	It's easy to confuse this with `hitMeta`.

	`hitMeta` is for meta information about **HOW**
	the user performed on the score. Things that
	aren't literally the score or percent, but are
	important properties nonetheless.

	`scoreMeta` is for completely meta information
	about the **PLAY** the user made, such as the
	mods and options they had on when playing.

Since `scoreMeta`'s properties are entirely game-specific,
they will be covered in more detail in the below section.

## Example Score

The below document is an example IIDX - SP score.

```json
{
	"service": "e-amusement",
	"comment": null,
	"game": "iidx",
	"importType": "file/eamusement-iidx-csv",
	"scoreMeta": {},
	"timeAchieved": 1608317520000,
	"scoreData": {
		"lampIndex": 7,
		"gradeIndex": 8,
		"esd": 10.15625,
		"score": 1729,
		"lamp": "FULL COMBO",
		"judgements": {
			"pgreat": 821,
			"great": 87
		},
		"hitMeta": {
			"bp": 0
		},
		"percent": 95,
		"grade": "MAX-"
	},
	"highlight": false,
	"timeAdded": 1623955294917,
	"userID": 1,
	"calculatedData": {
		"BPI": null,
		"K%": null,
		"ktRating": 9.110264135494702,
		"ktLampRating": 8
	},
	"songID": 212,
	"chartID": "efa36c73259409ea6a86c689f5750a2de395143b",
	"scoreID": "Rcf644b6c07830c0948d3a8b457427c1e449f22bf60a7bbed6c3970171e0fa969",
	"playtype": "SP",
	"isPrimary": true
}
```

## Game Specific

Every game has its own specific properties it adds to
or changes about the base score document.

For all games, the following changes are applied:

| Property | Change |
| :: | :: |
| `scoreData.lamp` | This field is restricted to only Lamps for that game. For more information, see [Game Enums](../implementation-details/game-configuration.md). |
| `scoreData.grade` | This field is restricted to only Grades for that game. For more information, see [Game Enums](../implementation-details/game-configuration.md). |
| `scoreData.judgements` | The keys of this field are set to only valid Judgements for that game. For more information, see [Game Judgements](../implementation-details/game-configuration.md).

!!! info
	All games implicitly have `fast`, `slow` and `maxCombo`
	as `integer | null` in their hitMeta.

!!! warning
	As mentioned above, all properties inside ScoreMeta
	and HitMeta are optional.

### IIDX:SP

```ts
interface HitMeta {
	bp: integer | null;
	gauge: number | null;
	gaugeHistory: (number | null)[] | null;
	scoreHistory: number[] | null;
	comboBreak: integer | null;
	gsm: {
		EASY: (number | null)[];
		NORMAL: (number | null)[];
		HARD: (number | null)[];
		EX_HARD: (number | null)[];
	} | null;
}
```

| Property | Description |
| :: | :: |
| `bp` | The total amount of bads this user got plus the total amount of poors. This is generally used by players as a more continuous form of evaluating lamp ability. |
| `gauge` | The gauge the user had at the end of the chart. |
| `gaugeHistory` | An array, describing the gauge the user had at each measure in the chart. If the user dies, null is used until the end of the array. |
| `scoreHistory` | An array describing the exscore the user had at each measure in the chart. |
| `comboBreak` | The amount of times this score broke combo. Only some poors actually cause combo breaks! |
| `gsm` | Data for GAUGE_SHIFT_MANEUVER. This is `gaugeHistory` replicated for all possible gauges at once. |

```ts
interface ScoreMeta {
	random: "NONRAN" | "RANDOM" | "R-RANDOM" | "S-RANDOM" | "MIRROR" | null;
	assist: "NO ASSIST" | "AUTO SCRATCH" | "LEGACY NOTE" | "FULL ASSIST" | null;
	range: "NONE" | "SUDDEN+" | "HIDDEN+" | "SUD+ HID+" | "LIFT" | "LIFT SUD+" | null;
	gauge: "ASSISTED EASY" | "EASY" | "NORMAL" | "HARD" | "EX HARD" | null;
}
```

| Property | Description |
| :: | :: |
| `random` | The RANDOM option that was used during this score. |
| `assist` | The ASSIST option that was used during this score. |
| `range` | The RANGE option that was used during this score. |
| `gauge` | The GAUGE option that was used during this score. |

### IIDX:DP

Same as IIDX:SP, but with the following changes to Hit Meta:

| Property | Description |
| :: | :: |
| `random` | Is now an array of [LEFT_HAND_RANDOM, RIGHT_HAND_RANDOM], instead of just the single option.

### SDVX

```ts
interface HitMeta {
	gauge: number | null;
	btnRate: number | null;
	holdRate: number | null;
	laserRate: number | null;
}
```

| Property | Description |
| :: | :: |
| `gauge` | The gauge the user had when the chart finished. |
| `btnRate`, `holdRate`, `laserRate` | The values the user had for the "rate" bars. These are not of much interest to anyone. |

```ts
interface ScoreMeta {
	inSkillAnalyser: boolean | null
}
```

| Property | Description |
| :: | :: |
| `inSkillAnalyser` | Whether or whether not this score was achieved inside the skill analyser mode. |

### USC

```ts
interface HitMeta {
	gauge: number | null;
	btnRate: number | null;
	holdRate: number | null;
	laserRate: number | null;
}
```

| Property | Description |
| :: | :: |
| `gauge` | The gauge the user had when the chart finished. |
| `btnRate`, `holdRate`, `laserRate` | The values the user had for the "rate" bars. These are not of much interest to anyone. |

```ts
interface ScoreMeta {
	noteMod: "NORMAL" | "MIRROR" | "RANDOM" | "MIR-RAN" | null;
	gaugeMod: "NORMAL" | "HARD" | null;
}
```

| Property | Description |
| :: | :: |
| `noteMod` | The NOTE modifier used on this score. |
| `gaugeMod` | The gauge modifier used on this score. |

### BMS:7K

```ts
type BMSJudgePermutations = `${"e" | "l"}${"bd" | "pr" | "gd" | "gr" | "pg"}`;

type BMSHitMeta = BASE_VALID_HIT_META &
	{
		[K in BMSJudgePermutations]: integer;
	} & {
		bp: integer | null;
		gauge: number | null;
	};
```

| Property | Description |
| :: | :: |
| `epg`, `lpg`... | These are the (E)arly and (L)ate judgements used by beatoraja internally. |
| `bp` | The total bads + the total poors of this score. |
| `gauge` | The gauge the user had at the end of this chart. |

```ts
interface ScoreMeta {
	random: "NONRAN" | "RANDOM" | "R-RANDOM" | "S-RANDOM" | "MIRROR" | null;
	inputDevice: "KEYBOARD" | "BM_CONTROLLER" | null;
	client: "LR2" | "beatoraja" | "lr2oraja";
	lntype: null | "LN" | "CN";
}
```

| Property | Description |
| :: | :: |
| `random` | The random option this user selected. |
| `inputDevice` | Whether this score was achieved on a keyboard or a beatmania controller. If null, this is not known. |
| `client` | What client this score was performed on. Scores achieved on beatoraja have a warning next to them indicating differences in their gauge implementation. |
| `lnType` | What type of LNs this user was using. This only applies to beatoraja and lr2oraja, where CNs are an option. |

### DDR, maimai, MÚSECA, CHUNITHM

These games have no extended properties on its `hitMeta` object.

These games also have no properties on its `scoreMeta` object.

*****

[^1]: SEGA games, such as maimai and CHUNITHM have percents that go greater than 100%. For this, we just let the field overflow 100. There's no reason it can't! It is still strange for a percent to be over 100, however. In some scenarios, the `score` property for a score may be identical to the `percent` property. This occurs when a games primary score indicator is also their percent property, or when their default `score` property is useless (such as in maimai).

[^2]: Some games, however, have special grade requirements, and that is why this is a separate field (and not just derived from `percent`.)