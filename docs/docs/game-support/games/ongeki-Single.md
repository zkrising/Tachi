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
| `noteLamp` | "LOSS", "CLEAR", "FULL COMBO", "ALL BREAK" | The first lamp. A clear is either a draw or a win. |
| `bellLamp` | "FULL BELL" | The second lamp that tracks whether all bells in the chart have been collected. |

### Derived Metrics

| Metric Name | Type | Description |
| :: | :: | :: |
| `grade` | "D", "C", "B", "BB", "BBB", "A", "AA", "AAA", "S", "SS", "SSS", "SSS+" | The grade this score was. |

### Optional Metrics

| Metric Name | Type | Description |
| :: | :: | :: |
| `fast` | Integer | The number of mistakes in this score that were a result of hitting early. |
| `slow` | Integer | The number of mistakes in this score that were a result of hitting late. |
| `maxCombo` | Integer | The largest combo in this score. |
| `bellCount` | Integer | The numer of bells collected. |
| `damage` | Integer | The number of damage ticks received. |
| `platScore` | Integer | The Platinum Score value. Only exists in MASTER and LUNATIC charts. |

## Judgements

The folowing judgements are defined:

- `cbreak`
- `break`
- `hit`
- `miss`

Note: `pbreak`s are not tracked separately but can be deduced from `platScore`.

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
| `naiveRating` | The average of your best 45 ratings. |
| `lessNaiveRating` | The average of your best 15 scores from the latest version and 30 from all old versions. |

Note: O.N.G.E.K.I.'s in-game rating also takes recent scores into account, hence both algorithms are 'naive'.

## Difficulties

- `BASIC`
- `ADVANCED`
- `EXPERT`
- `MASTER`
- `LUNATIC`

Note: since bright MEMORY Act.3, "crazy" charts and "Re:MASTER" charts are in separate folders, but both ought to be tracked as LUNATIC.

## Classes

| Name | Type | Values |
| :: | :: | :: |
| `colour` | DERIVED | BLUE, GREEN, ORANGE, RED, PURPLE, COPPER, SILVER, GOLD, PLATINUM, RAINBOW |

## Versions

| ID | Pretty Name |
| :: | :: |
| `brightMemory2` | bright MEMORY Act.2 |
| `brightMemory3` | bright MEMORY Act.3 |

## Supported Match Types

- `songTitle`
- `tachiSongID`

