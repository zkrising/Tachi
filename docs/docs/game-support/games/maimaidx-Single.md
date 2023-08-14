# maimai DX Support

This game has the internal GPTString of `maimaidx:Single`.

!!! note
	For information on what each section means, please see [Common Config](../common-config/index.md).

## Metrics

For more information on what metrics are and how they work, see [TODO]!

### Provided Metrics

| Metric Name | Type | Description |
| :: | :: | :: |
| `percent` | Decimal | The percent this score was worth. Sometimes called 'rate' in game. This is between 0 and 101. |
| `lamp` | "FAILED", "CLEAR", "FULL COMBO", "FULL COMBO+", "ALL PERFECT", "ALL PERFECT+" | The type of clear this score was. |

### Derived Metrics

| Metric Name | Type | Description |
| :: | :: | :: |
| `grade` | "D", "C", "B", "BB", "BBB", "A", "AA", "AAA", "S", "S+", "SS", "SS+", "SSS", "SSS+" | The grade this score was. |

### Optional Metrics

| Metric Name | Type | Description |
| :: | :: | :: |
| `fast` | Integer | The amount of mistakes in this score that were a result of hitting early. |
| `slow` | Integer | The amount of mistakes in this score that were a result of hitting late. |
| `maxCombo` | Integer | The largest combo in this score. |

## Judgements

The folowing judgements are defined:

- `pcrit`
- `perfect`
- `great`
- `good`
- `miss`

## Rating Algorithms

### Score Rating Algorithms

| Name | Description |
| :: | :: |
| `rate` | Rating as it's implemented in game. |

### Session Rating Algorithms

| Name | Description |
| :: | :: |
| `rate` | The average of your best 10 ratings this session. |

### Profile Rating Algorithms

The default rating algorithm is `naiveRate`.

| Name | Description |
| :: | :: |
| `naiveRate` | A naive rating algorithm that just sums your 50 best scores. |
| `rate` | Rating as it's implemented in game, taking 15 scores from the latest version and 35 from all old versions. |

## Difficulties

- `Basic`
- `Advanced`
- `Expert`
- `Master`
- `Re:Master`
- `DX Basic`
- `DX Advanced`
- `DX Expert`
- `DX Master`
- `DX Re:Master`

## Classes

| Name | Type | Values |
| :: | :: | :: |
| `colour` | DERIVED | WHITE, BLUE, GREEN, YELLOW, RED, PURPLE, BRONZE, SILVER, GOLD, PLATINUM, RAINBOW
| `dan` | PROVIDED | DAN_1, DAN_2, DAN_3, DAN_4, DAN_5, DAN_6, DAN_7, DAN_8, DAN_9, DAN_10, SHINDAN_1, SHINDAN_2, SHINDAN_3, SHINDAN_4, SHINDAN_5, SHINDAN_6, SHINDAN_7, SHINDAN_8, SHINDAN_9, SHINDAN_10, SHINKAIDEN, URAKAIDEN

## Versions

| ID | Pretty Name |
| :: | :: |
| `universeplus` | UNiVERSE PLUS |
| `festival` | FESTiVAL |
| `festivalplus` | FESTiVAL PLUS |

## Supported Match Types

- `songTitle`
- `tachiSongID`
