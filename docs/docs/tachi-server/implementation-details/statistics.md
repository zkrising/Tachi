# Statistic Implementation

This page documents the maths behind various algorithms
in Tachi.

*****

## BPI

Our implementation of Poyashi BPI is leveraged from [here](https://github.com/potakusan/iidx_score_manager/blob/f21ba6b85fcc0bf8b7ca888fa2239a3951a9c9c2/src/components/bpi/index.tsx#L120).

To be honest, I do not really understand *why* BPI looks
like this. I couldn't justify basically any line of this
function, nor any of the magic numbers it references.

## MFCP

MFCP is implemented as follows.

If the score is not an MFC, it is worth `null`.

If the score on a BEGINNER or BASIC chart, it is worth `null`.

If the level of the chart is worth less than 8, it is worth `null`.

Else, it follows this table:

| Levels | MFCP |
| :: | :: |
| 8, 9, 10 | 1 |
| 11, 12 | 2 |
| 13 | 4 |
| 14 | 8 |
| 15 | 15 |
| 16, 17, 18, 19, 20 | 25 |

## VF6

VF6 is calculated as follows.

The grade of the score is converted into a coefficent
according to this table.

```ts
const VF5GradeCoefficients = {
	S: 1.05,
	"AAA+": 1.02,
	AAA: 1.0,
	"AA+": 0.97,
	AA: 0.94,
	"A+": 0.91, // everything below this point (incl. this) is marked with a (?) in bemaniwiki.
	A: 0.88,
	B: 0.85,
	C: 0.82,
	D: 0.8,
};
```

Lamps are converted into a coefficent similarly.

```ts
const VF5LampCoefficients = {
	"PERFECT ULTIMATE CHAIN": 1.1,
	"ULTIMATE CHAIN": 1.05,
	"EXCESSIVE CLEAR": 1.02,
	CLEAR: 1.0,
	FAILED: 0.5,
};
```

Then, we perform the following calculation:

$$
f(l, p, c1, c2) = 2l * p * c1 * c2 * 0.01
$$

Where L is the chart's level, P is the percent of the score,
C1 is the grade coefficent, and C2 is the lamp coefficient.

For VF6, this result is returned floored to 3 decimal places.

For VF5, this result is returned floored to **2** decimal places.

## KtRating

KtRating is a generic exponential algorithm that takes
three tunable parameters. These are changed depending
on the game that uses this algorithm.

!!! note
	This is not meant to be a perfect algorithm for all
	scenarios. It's meant to cover for games that don't
	have a sensible default rating algorithm.

The three parameters are as follows:

| Parameter | Description |
| :: | :: |
| `pivotPercent` | The percent below which a score is considered a 'fail', and should be negatively punished. |
| `failHarshnessMultiplier` | By how much fails should be punished. A higher value implies fails are worth less. |
| `clearExpMultiplier` | How much to exponentially reward clears. A higher value implies that timing at the highest level is more difficult. |

If the score's percent is below the `pivotPercent`, the
fail calculator is invoked, which uses the following
function:

```ts
	percentDiv100 ** (parameters.failHarshnessMultiplier * levelNum) *
	(levelNum / parameters.pivotPercent ** (parameters.failHarshnessMultiplier * levelNum))
```

In mathematical notation, this is represented as:

$$
f(x, f, l, c) = \left(x^{f}\cdot\left(\frac{l}{c^{f}}\right)\right)
$$

Where X is the percent divided by 100,
F is the `failHarshnessMultiplier` multiplied by L,
L is the level of the chart and
C is the `pivotPercent`.

If the score is above the `pivotPercent`, then the
clear calculator is invoked, which uses the following
function:

```ts
	Math.cosh(
		parameters.clearExpMultiplier * levelNum * (percentDiv100 - parameters.pivotPercent)
	) +
	(levelNum - 1);
```

In mathematical notation, this is expressed as:

$$
f(x, c, l) = \cosh\left(n\left(x-c\right)\right)+l-1
$$

Where X is the percent divided by 100,
L is the level of the chart and
C is the `pivotPercent`.

Cosh is used because it's essentially e^x, and easier
to work with in this (contrived) scenario.

!!! note
	L will be replaced with the timing difficulty
	declared for that chart in the tierlists.

	If one does not exist, it will fall back to
	the provided level as a number.

## KtLampRating

Unlike KTRating, KTLampRating is a fairly sensible
function.

It has no tunable parameters.

It starts by getting the tierlist information for the
given chart.

If there is tierlist information, then we iterate
over the lamp ratings they declare.

We select the largest lamp rating that the lamp meets
the requirements of.
This is to fix things like Hard Clears sometimes being worth
less than Normal Clears (especially in IIDX). This also
means that we safely fall back to lower values if the
users lamp was unsupported - i.e. a FULL COMBO will fall
down to an EX HARD CLEAR.

If there is no tierlist data available for this chart,
we fall to a simple question of whether the score was
considered a clear or not. If it is, give the level
of the chart as a number as points.