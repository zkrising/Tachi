# Chart Document

- Stored in `charts-${game}`

## Definition
```ts
interface ChartDocument {
	chartID: string;
	rgcID: string | null;
	songID: integer;
	level: string;
	levelNum: number;
	isPrimary: boolean;
	difficulty: __GPTSpecific;
	playtype: Playtype;
	data: __GPTSpecific;
	tierlistInfo: Record<__GPTSpecific, TierlistInfo>;
	versions: __GPTSpecific;
}
```

!!! note
	All properties marked `__GPTSpecific` have different values
	depending on what game and playtype this song/chart is for.

| Property | Description |
| :: | :: |
| `chartID` | A unique identifier for this chart. This is not a checksum, but rather 20 random bytes converted to hex.[^1] |
| `rgcID` | The RGC Identifier for this chart. This is slated for future integration with the RGC Service Backbeat. However, this has not happened yet, and as such all charts have this set to null. |
| `songID` | The corresponding parent [Song Document](./song.md)'s ID. |
| `level` | A string representing the level for this chart. This is a string because games use identifiers like '12+'. |
| `levelNum` | A number representing the level for this chart. This may be a decimal. |
| `isPrimary` | Whether this chart is primary or not. For more information on this, see [isPrimary](songs-../implementation-details/songs-charts.md#isPrimary)
`difficulty` | A string representing what difficulty this chart is for. The valid values for this field depend on the GPT. |
| `playtype` | What playtype this chart is for. |
| `data` | Additional GPT Specific data about this chart, such as inGameIDs or SHA hashes. |
| `tierlistInfo` | Information about the tierlist for this chart. The keys in this object depend on what tierlists this GPT supports. |
| `versions` | What versions of the game this chart is available in. Used to distinguish older charts from newer revisions in imports. |

## TierlistInfo

Although what tierlists supported by the GPT are GPTSpecific, the content of the tierlist is always the same:

```ts
interface ChartTierlistInfo {
	text: string;
	value: number;
	individualDifference?: boolean;
}
```

| Property | Description |
| :: | :: |
| `text` | A human readable string representing this tierlists value, such as "12A+" |
| `value` | A machine parsable float representing this tierlists actual value, such as 12.8. |
| `individualDifference` | Whether this tierlist value has individual difference (different players may find this value radically easier or harder) or not. |

## GPTSpecific

Since the chart document is inherited from by every GPT, some fields have different types and values.

### IIDX

#### Difficulties

- BEGINNER (Not valid for DP)
- NORMAL
- HYPER
- ANOTHER
- LEGGENDARIA
- Kichiku BEGINNER (Not valid for DP)
- Kichiku NORMAL
- Kichiku HYPER
- Kichiku ANOTHER
- Kichiku LEGGENDARIA
- Kiraku BEGINNER (Not valid for DP)
- Kiraku NORMAL
- Kiraku HYPER
- Kiraku ANOTHER
- Kiraku LEGGENDARIA
- All Scratch BEGINNER (Not valid for DP)
- All Scratch NORMAL
- All Scratch HYPER
- All Scratch ANOTHER
- All Scratch LEGGENDARIA

#### Data

```ts
type IIDXChartData = {
	notecount: integer;
	inGameID: integer | integer[];
	arcChartID: string | null;
	hashSHA256: string | null;
	"2dxtraSet": string | null;
}
```

| Property | Description |
| :: | :: |
| `notecount` | The amount of notes in this chart. |
| `inGameID` | The ID used in game. For charts that have multiple in game IDs, this is an array with all of them. |
| `arcChartID` | ARC's chartID for this chart. Null if t his is not known. |
| `hashSHA256` | A SHA256 checksum of the chart data. This is used for 2DXTra to identify charts, and is null for non-2dxtra implementations. |
| `2dxtraSet` | What 2dxtra set this chart belongs to, such as Kichiku, Kiraku or something else. This is null if the chart is part of the normal game. |

#### Tierlists

| Tierlist | Description |
| :: | :: |
| `kt-NC` | Kamaitachi Normal Clear ratings. These are sourced from sp12 and IIDXPEKR, with some custom data for omnimix. |
| `kt-HC` | Kamaitachi Hard Clear ratings. These are sourced from sp12 and IIDXPEKR, with some custom data for omnimix. |
| `kt-EXHC` | Kamaitachi EX-Hard Clear ratings. These are sourced from sp12, with some custom data for omnimix. |

#### Versions

The supported versions for this game are as follows:

```ts
"26", "27", "28", "29", "28-omni", "27-omni", "28-omni", "25",
"24", "23", "22", "21", "20", "inf", "27-2dxtra", "28-2dxtra",
"bmus", "26-omni", "16-cs", "15-cs", "14-cs", "13-cs", "12-cs",
"11-cs", "10-cs", "9-cs", "8-cs", "7-cs", "6-cs", "5-cs", "4-cs",
"3-cs"
```

### SDVX

#### Difficulties

- NOV
- ADV
- EXH
- MXM
- INF
- GRV
- HVN
- VVD

!!! note
	Some services store INF as the only 4th level difficulty (i.e. as any of INV, GRV, HVN, VVD). This is wrong. However, Tachi makes some adjustments for these services to make sure they import correctly.

#### Data

```ts
interface SDVXChartData {
	inGameID: integer;
	arcChartID: string | null;
}
```

| Property | Description |
| :: | :: |
| `inGameID` | The integer ID used in game for this chart. |
| `arcChartID` | ARC's chart ID for this chart. If not known, this is null. |

#### Tierlists

None.

!!! help
	If you would like to contribute a tierlist for this game. Feel free to write to me.

### MUSECA

#### Difficulties

- Green
- Yellow
- Red

#### Data

```ts
interface MusecaChartData {
	inGameID: integer;
}
```

| Property | Description |
| :: | :: |
| `inGameID` | The ID used in game for this chart. |

#### Tierlists

None.

### CHUNITHM

#### Difficulties

- BASIC
- ADVANCED
- EXPERT
- MASTER

!!! warning
	WORLD'S END is not supported by Tachi, as the site cannot support
	multiple charts with the same difficulty and playtype being different (and primary at the same time).

#### Data


```ts
interface CHUNITHMChartData {
	inGameID: integer;
}
```

| Property | Description |
| :: | :: |
| `inGameID` | The ID used in game for this chart. |

#### Tierlists

None.

### maimai

#### Difficulties

- Easy
- Basic
- Advanced
- Expert
- Master
- Re:Master

#### Data

```ts
interface MaimaiChartData {
	maxPercent: number;
	inGameID: number;
	inGameStrID: string;
}
```

| Property | Description |
| :: | :: |
| `maxPercent` | Every chart in maimai has a different maxPercent depending on the amount of break notes in the chart. This field allows this to be declared. |
| `inGameID` | The in game numerical ID for this chart. |
| `inGameStrID` | The game also has string IDs for charts. Not sure why, but we support that too. |

#### Tierlists

None.

### USC

#### Difficulties

- NOV
- ADV
- EXH
- INF

#### Data

```ts
interface USCChartData {
	hashSHA1: string | string[];
	isOfficial: boolean;
}
```

| Property | Description |
| :: | :: |
| `hashSHA1` | A SHA1 Hash identifying this chart. An array of SHA1 Hashes may be provided if this chart should need multiple (I.e. the chart is rereleased with a different hash.) |
| `isOfficial` | Whether this chart is an SDVX official or not. |

#### Tierlists

None.

### BMS

#### Difficulties

- CHART

!!! info
	This is weird. BMS actually only ever has one chart per song, as in BMS the only thing that actually matters is the charts MD5Sum. This redundant difficulty name -- CHART, is not displayed anywhere on the UI, nor does it really matter.

#### Data

```ts
interface BMSChartData {
	notecount: integer;
	hashMD5: string;
	hashSHA256: string;
	tableFolders: { table: string; level: string }[];
}
```

| Property | Description |
| :: | :: |
| `notecount` | The amount of notes in this chart. Note that charts with #RANDOM declarations are not supported by Tachi, and therefore this is guaranteed to be correct. |
| `hashMD5` | The MD5Sum for this chart. |
| `hashSHA256` | The SHA256Sum for this chart. |
| `tableFolders` | What table this chart is in. |

!!! example
	As an example for `tableFolders`, a chart may be in the Insane 14 folder, and the satellite 7 folder.

	That would be represented as the following:
	```js
	tableFolders: [{
		table: "sl",
		level: "7",
	}, {
		table: "★",
		level: "14",
	}]
	```

	This property being on charts allows us to make folders based on it.

#### Tierlists

| Tierlist | Description |
| :: | :: |
| `sgl-EC` | Sieglinde Easy Clear -- The sieglinde value you'd get for easy clearing this chart. |
| `sgl-HC` | Sieglinde Hard Clear -- The sieglinde value you'd get for hard clearing this chart. |

### WACCA

#### Difficulties

- NORMAL
- HARD
- EXPERT
- INFERNO

#### Data

```ts
interface WACCAChartData {
	isHot: boolean;
}
```

| Property | Description |
| :: | :: |
| `isHot` | Whether this chart is hot or not. Used for profile rating calculations. |

#### Tierlists

None.

### Pop'n

#### Difficulties

- Easy
- Normal
- Hyper
- EX

#### Data

```ts
interface PopnChartData {
	hashSHA256: string | null;
}
```

| Property | Description |
| :: | :: |
| `hashSHA256` | A SHA256 checksum of the chart file. |

#### Tierlists

None.

### jubeat

#### Difficulties

- BSC
- ADV
- EXT
- HARD BSC
- HARD ADV
- HARD EXT

!!! note
	We handle hard mode charts by treating them as completely separate charts. Not a mod or anything.
	
	This has the advantage of separating leaderboards and generally meshing better with the flow of the site.

#### Data

```ts
interface JubeatChartData {
	inGameID: integer;
	isHardMode: boolean;
}
```

| Property | Description |
| :: | :: |
| `inGameID` | The integer ID used by the game to identify this chart. |
| `isHardMode` | Whether this chart is a hard mode chart or not. Equivalent to difficulty.startsWith("HARD ") |

#### Tierlists

None.

### PMS

!!! note
	PMS is near identical to BMS. Most clients are just a thin layer over BMS with 9 buttons.

#### Difficulties

- CHART

!!! info
	This is weird. PMS, like BMS, actually only ever has one chart per song, as in BMS the only thing that actually matters is the charts MD5Sum. This redundant difficulty name -- CHART, is not displayed anywhere on the UI, nor does it really matter.

#### Data

```ts
interface BMSChartData {
	notecount: integer;
	hashMD5: string;
	hashSHA256: string;
	tableFolders: { table: string; level: string }[];
}
```

| Property | Description |
| :: | :: |
| `notecount` | The amount of notes in this chart. Note that charts with #RANDOM declarations are not supported by Tachi, and therefore this is guaranteed to be correct. |
| `hashMD5` | The MD5Sum for this chart. |
| `hashSHA256` | The SHA256Sum for this chart. |
| `tableFolders` | What table this chart is in. |

!!! example
	For an example of how the above properties work, see the BMS description above (the two games are incredibly similar.)

#### Tierlists

| Tierlist | Description |
| :: | :: |
| `sgl-EC` | Sieglinde Easy Clear -- The sieglinde value you'd get for easy clearing this chart. |
| `sgl-HC` | Sieglinde Hard Clear -- The sieglinde value you'd get for hard clearing this chart. |
