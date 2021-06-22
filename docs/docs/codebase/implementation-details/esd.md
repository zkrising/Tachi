# ESD Implementation

ESD uses the fact that [A binomial distribution can approximate a normal one](https://en.wikipedia.org/wiki/Central_limit_theorem) in order to derive an estimate for standard deviations.

*****

## Method Outline

Our overview is as follows. We are given a percent and
judgement windows for a game.

From that, we want to return the standard deviation that
would result in that percent - given that game's judgement
windows.

### Deriving Percent From Standard Deviation

We assume that the mean of the players hits is always 0.

Then, we work backwards. With the knowledge of
the judgement windows for a game, we can estimate the
percent a standard deviation would typically give.

We construct a distribution with a mean of 0 and a standard
deviation of S, and then see roughly where hits would
end up on that distribution.

We multiply how many hits we'd *expect* to be within a
certain judgement window by the value of that judgement.

So in our scenario of S standard deviation, we would
expect X% of hits to be between, say, -16.67 and +16.67 (IIDX's PGREAT window).

!!! note
	To calculate that percent we need to use the
	cumulative distribution function. That is not covered
	here, but guides are all over the internet.

We can multiply that percent by the value of a PGREAT (100%).

Then, we repeat for the great window at 50%, and so on.

When we've summed all that up, we get an estimate of
the percent this standard deviation is worth.

### Reversing That

This is good, but this is backwards!

Turns out, there's no algebraic way to reverse this function!

So, let's do a little approximating.

We can start with an ESD of 100, which is halfway between
the lowest ESD (0), and the highest (200).

```ts
for (let i = 0; i < MAX_ITERATIONS; i++) {
	const estimatedPercent = StdDeviationToPercent(judgements, estSD, largestValue);

	if (Math.abs(estimatedPercent - percent) < ACCEPTABLE_ERROR) {
		return estSD;
	}

	if (estimatedPercent < percent) {
		maxSD = estSD;
	} else {
		minSD = estSD;
	}

	if (estSD === (minSD + maxSD) / 2) {
		// if it isn't moving, just terminate
		break;
	}

	estSD = (minSD + maxSD) / 2;
}
```

This code is then ran to approximate the standard deviation
needed to get a percent *like* the one we were given.

`ACCEPTABLE_ERROR` is set to `0.001` by default.
`MAX_ITERATIONS` is set to `50`.

With this, we can "intelligently brute force" standard deviations,
getting closer to our provided percent until its
within 0.001%. Then, we can return the standard deviation
we used to get that percent!

!!! note
	Performance of this is incredibly fast, while
	"intelligently brute forcing" isn't ideal, 50
	iterations are almost never hit, and most ESDs
	are calculated in about 10 iterations.

	All of this happens in significantly under 1 milisecond,
	so it is not exactly a significant performance hit.
