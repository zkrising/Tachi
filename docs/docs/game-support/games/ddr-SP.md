# DDR (SP) Support

This game has the internal GPTString of `ddr:SP`.

!!! note
	For information on what each section means, please see [Common Config](../common-config/index.md).

## Metrics

For more information on what metrics are and how they work, see [TODO]!

### Provided Metrics

| Metric Name | Type | Description |
| :: | :: | :: |
| `score` | Integer | The score value. This is between 0 and 1 million. |
| `lamp` | "FAILED", "ASSIST", "CLEAR", "FULL COMBO", "GREAT FULL COMBO", "PERFECT FULL COMBO", "MARVELOUS FULL COMBO", "LIFE4" | The type of clear this user got. |

### Derived Metrics

| Metric Name | Type | Description |
| :: | :: | :: |
| `grade` | "E", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+", "AA-", "AA", "AA+", "AAA" | The grade this score was. Note that grades are capped at F if this was a fail. |
| `percent` | Decimal | The % value this score was worth. This is a number between 0 and 100. |

### Optional Metrics

| Metric Name | Type | Description |
| :: | :: | :: |

## Judgements

The following judgements are defined:

- `MARVELOUS`
- `PERFECT`
- `GREAT`
- `GOOD`
- `MISS`
- `OK`

## Rating Algorithms

### Score Rating Algorithms

| Name | Description |
| :: | :: |
| `flareSkill` | Flare Skill as it's implemented in DDR World. |

### Session Rating Algorithms

| Name | Description |
| :: | :: |
| `flareSkill` | Average of your 10 best Flare Points this session |

### Profile Rating Algorithms

| Name | Description |
| :: | :: |
| `flareSkill` | Flare Skill as it's implemented in DDR World, taking 30 best flare points from 3 different categories: CLASSIC (DDR 1st～X3 vs 2ndMIX), WHITE (DDR(2013)～DDR A), GOLD (DDR A20～WORLD). |

## Difficulties

- `BEGINNER`
- `BASIC`
- `DIFFICULT`
- `EXPERT`
- `CHALLENGE`

## Classes

| Name | Type | Values |
| :: | :: | :: |

## Versions

| ID | Pretty Name |
| :: | :: |
| `a` | A |
| `a20` | A20 |
| `a20plus` | A20+ |
| `a3` | A3 |
| `world` | WORLD |
| `konaste` | Konaste |

## Supported Match Types

- `inGameID`
- `songTitle`
- `tachiSongID`
- `ddrSongHash`
