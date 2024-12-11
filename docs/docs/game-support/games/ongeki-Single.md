# O.N.G.E.K.I. Support

This game has the internal GPTString of `ongeki:Single`.

!!! note
	For information on what each section means, please see [Common Config](../common-config/index.md).

## Metrics

For more information on what metrics are and how they work, see [TODO]!

### Provided Metrics

| Metric Name | Type | Description |
| :: | :: | :: |
| `score` | Integer | Known in-game as 'Technical Score'. It ranges between 0 and 1,010,000, where notes are worth 950,000, and bells 60,000. |
| `noteLamp` | "LOSS", "CLEAR", "FULL COMBO", "ALL BREAK" | The primary lamp. A clear is a draw or a win in-game. |
| `bellLamp` | "NONE", "FULL BELL" | Tracks whether all bells in the chart have been collected. |

### Derived Metrics

| Metric Name | Type | Description |
| :: | :: | :: |
| `grade` | "D", "C", "B", "BB", "BBB", "A", "AA", "AAA", "S", "SS", "SSS", "SSS+" | The grade this score was. |

### Optional Metrics

| Metric Name | Type | Description |
| :: | :: | :: |
| `fast` | Integer | The number of non-critical mistakes in this score that were a result of hitting early. |
| `slow` | Integer | The number of non-critical mistakes in this score that were a result of hitting late. |
| `maxCombo` | Integer | The largest combo in this score. |
| `damage` | Integer | The number of damage ticks received. |
| `bellCount` | Integer | The number of bells collected. |
| `totalBellCount` | Integer | The maximum number of bells that could have been obtained at the time of the play's end. |
| `platScore` | Integer | The Platinum Score value. Only exists in MASTER and LUNATIC charts. |

## Judgements

The folowing judgements are defined:

- `cbreak`
- `break`
- `hit`
- `miss`

## Rating Algorithms

### Score Rating Algorithms

| Name | Description |
| :: | :: |
| `rating` | The rating value of this score. This is identical to the system used in game. |

### Session Rating Algorithms

| Name | Description |
| :: | :: |
| `naiveRating` | The average of your best 10 ratings this session. |

### Profile Rating Algorithms

| Name | Description |
| :: | :: |
| `naiveRating` | The average of your best 45 scores. |

## Difficulties

- `BASIC`
- `ADVANCED`
- `EXPERT`
- `MASTER`
- `LUNATIC`

## Classes

| Name | Type | Values |
| :: | :: | :: |
| `colour` | DERIVED | BLUE, GREEN, ORANGE, RED, PURPLE, COPPER, SILVER, GOLD, PLATINUM, RAINBOW

## Versions

| ID | Pretty Name |
| :: | :: |
| `brightMemory3` | bright MEMORY Act.3 |
| `brightMemory3Omni` | bright MEMORY Act.3 Omnimix |

## Supported Match Types

- `songTitle`
- `tachiSongID`
- `inGameID`

### Song Title matching
There are numerous songs with non-unique names (e.g. Singularity, Singularity and Singularity), but this can be resolved by providing the `artist` field. The only exception is Perfect Shining, which uniquely has two LUNATIC charts and has to be matched by `inGameID`:

- LUNATIC 0 (Loctest chart) `inGameID: 8003`
- LUNATIC 13+ (Re:Master) `inGameID: 8091`