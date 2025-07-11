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
| `noteLamp` | "LOSS", "CLEAR", "FULL COMBO", "ALL BREAK", "ALL BREAK+" | The primary lamp. A clear is a draw or a win in-game. |
| `bellLamp` | "NONE", "FULL BELL" | Tracks whether all bells in the chart have been collected. |
| `platinumScore` | Integer | The Platinum Score value. |

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

## Judgements

The following judgements are defined:

- `cbreak` (critical break)
- `break` (red/regular break)
- `hit`
- `miss`

## Rating Algorithms

### Score Rating Algorithms

| Name | Description |
| :: | :: |
| `rating` | A rating value of this score, capping at +2.0 at SSS+. This is identical to the system used in bright MEMORY and earlier versions. |
| `scoreRating` | A rating value of this score, capping at +2.7 at 1,010,000. This is identical to the system used in Re:Fresh. |
| `starRating` | A rating value of this score, based on stars derived from Platinum Score. This is identical to the system used in Re:Fresh. |

### Session Rating Algorithms

| Name | Description |
| :: | :: |
| `naiveRating` | The average of your best 10 classic ratings this session. |
| `naiveScoreRating` | The average of your best 10 score ratings this session. |
| `starRating` | The average of your best 10 star ratings this session. |

### Profile Rating Algorithms

| Name | Description |
| :: | :: |
| `naiveRating` | The average of your best 45 classic ratings. This is a simpler variant of the rating algorithm used in bright MEMORY and earlier versions, without distinguishing between new and old charts, and without taking recent scores into account. |
| `naiveRatingRefresh` | A weighted sum of the average of your best 60 score ratings, and your best 50 star ratings. This is a simpler variant of the rating algorithm used in Re:Fresh, without distinguishing between new and old charts. |

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
| `brightMemory2Omni` | bright MEMORY Act.2 Omnimix |
| `brightMemory3` | bright MEMORY Act.3 |
| `brightMemory3Omni` | bright MEMORY Act.3 Omnimix |
| `refresh` | Re:Fresh |
| `refreshOmni` | Re:Fresh Omnimix |

## Supported Match Types

- `songTitle`
- `tachiSongID`
- `inGameID`

### Song Title Matching
There are numerous songs with non-unique names (e.g. Singularity, Singularity and Singularity), but this can be resolved by providing the `artist` field. The only exception is Perfect Shining, which uniquely has two LUNATIC charts and has to be matched by `inGameID`:

- LUNATIC 0 (Loctest chart) `inGameID: 8003`
- LUNATIC 13+ (Re:Master) `inGameID: 8091`
