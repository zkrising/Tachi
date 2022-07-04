# What is ESD?

ESD is short for "Estimated Standard Deviation".

Standard deviation is a way of measuring how *dispersed*
data is. [Wikipedia](https://en.wikipedia.org/wiki/Standard_deviation) explains what this is and why it works.

!!! warning
	ESD is not publically displayed on Tachi at the moment for any game.
	This page is technically redundant.

*****

## Motivation

Standard Deviation is an interesting statistic for rhythm
games, as the dispersion of a users hits is quite interesting.

That is, if a user is hitting all over the place timing wise,
they probably aren't doing very good. Vice versa,
if a user has incredibly close together hits timing wise,
they're probably good.

ESD let's us derive standard deviation from just the *percent*
of a score, and the judgement windows for a game!

It's surprisingly accurate, and is a useful statistic
to derive other statistics from.

!!! note
	Only some games support ESD. These are only games that
	have strict hit windows that correlate perfectly with
	percent.

	An example would be IIDX, where percent is only
	derived from EX Score, and hit windows are constant.

	BMS cannot support ESD as it has dynamic hit windows,
	depending on the chart.

	GITADORA cannot support ESD as it's percent is influenced
	by combo-based scoring.

	SDVX cannot support ESD because things like holds
	count as multiple repeated hits, but you do not have
	to time those repeated hits!

	In short, one hit needs to correspond to one judgement,
	and every hit has to involve a timing window.

For details on the implementation of ESD, you can see
[here](../../tachi-server/implementation-details/esd.md).

!!! warning
	Implementation details about ESD require some
	external knowledge about statistics and distributions.