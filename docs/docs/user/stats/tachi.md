# Tachi Statistics

Tachi has a lot of statistics involved. This page documents all of the
statistics used for each game, and what they mean.

!!! note
	These explainations brush over the technical details a bit. If you're interested
	in that, you might want to see the [Implementation Details](../../tachi-server/implementation-details/statistics.md).

*****

## Statistics Overview

Tachi needs statistics in three main places. The first
place is on each *individual* score.

As an example, if I get a score, it should have a rating
attached onto it.

The second place it needs a rating algorithm is for
a user's profile. This is likely to be combined from
individual score statistics, either by averaging or
totalling.

The third place it needs a rating algorithm is for
a user's sessions. This is also likely to be combined
from individual score statistics.

## Score Statistics

The below statistics apply to individual scores.

!!! note
	Every game needs to have a default rating algorithm. A default rating
	algorithm needs to work well on all scores from all skill levels.

	This means that some more 'top player' oriented statistics cannot be the default.

	Some games might not have *any* rating algorithms. If we dont have
	a good built-in contender for a default rating algorithm, we will have to invent our own.

*****

### BPI (IIDX)

Pros:

- Estimates timing difficulty for a chart reasonably.
- Is an understood standard by Kaiden and Post-Kaiden players.

Cons:

- Depends on Kaiden Average and World Record, which can be highly fluctuative.
- Not able to accurately cross-compare values (i.e. 20BPI on one song is often not equivalent in 'skill'[^1] to 20BPI on another.)
- Only practically works on 12s. It can be extended to 11s, but it doesn't work as well. It does not work at all below 11.

There are two implementations of BPI - We'll call them Nori BPI and Poyashi BPI, Tachi uses the
more recent Poyashi BPI.

!!! info
	As mentioned above in the cons of BPI, Kaiden Average and WR can be rather unreliable estimates
	of difficulty. When HV came out, 120hz caused almost all WRs to jump up significantly, which
	pretty much completely broke Nori's BPI. To fix this, some parameters were adjusted for
	poyashi's BPI, which is implemented [here](https://bpi.poyashi.me).
	Namely, reducing the impact of high WRs on average BPI.

	As a consequence, Poyashi BPI is significantly easier than Nori BPI in every circumstance.
	Whether this is an issue or not is up to you, but I think most players enjoy seeing the
	larger number.

BPI looks at the kaiden average and world record for a chart, and constructs an exponential
graph between the two points. A BPI of 0 is equivalent to Kaiden Average, a BPI of 100 is
equivalent to the world record.

!!! info
	For scores less than the Kaiden Average, Poyashi BPI uses a negative extension that caps
	at -15. This capping decision appears to be arbitrary.

	For Nori BPI, scores less than the Kaiden Average become [Complex Numbers](https://en.wikipedia.org/wiki/Complex_number).

BPI is intended for use for kaidens and players significantly beyond kaiden. For that, it works
decently. As mentioned above in the cons, BPI is not very cross-comparable. 20BPI on one song
is not necessarily as good as 20BPI on another.

!!! example
	At the time of writing, 20BPI on Verflucht Leggendaria is AAA+66. 20BPI on FAKE TIME is also AAA+66.
	Experienced players will notice a problem here.

*****

### ktLampRating (IIDX)

- **Default for IIDX SP and IIDX DP**

Pros:

- Corresponds 100% with well-agreed-upon tierlists
- Works on all charts, and uses tierlists down to SP10.

Cons:

- Does not support additional points for Full Combos (will give EXHard points) or Easy Clears (will give 0).

KtLampRating (Kamaitachi Lamp Rating) is a generic algorithm that gives points based
on the quality of the lamp.

This is entirely done with tierlists that are converted into decimal form. So, if a chart
is marked as 11.3 for Hard Clear, HCing it will give 11.3 points.

BP is not taken into account, and the only lamps that give rating are Normal, Hard and EXHard.

!!! note
	In the scenario where, say, a NC is worth more than a HC, HCing the chart will give the NC rating.

	This also applies to EXHCs.

*****

### VF6 (SDVX, USC)

- **Default for SDVX and USC**

Pros:

- Built-in to the game, and understood by all players.
- Unlike VF4, doesn't massively reward fails on high level charts
- Unlike VF5, has more than 33 unique values.

Cons:

- Values on an individual score are small decimals, which can be difficult to parse.

VF6 (Volforce 6) is the Volforce algorithm used in SDVX 6.
This algorithm is identical to VF5, but with the addition
of another decimal place. This fixes a long standing issue
with VF5 where there were only 33 possible values for a
given score, which made the function painfully discrete.

!!! note
	VF5 and VF4 are deprecated in Tachi, and not displayed
	anywhere.

	VF5 is deprecated because VF6 is strictly better.

	VF4 is deprecated because it's 4 years old at this
	point, and its flaws make it incredibly abusable.

*****
<!--
### ktRating (DDR)

- **Default for DDR SP and DDR DP**

Pros:

- Works on all scores.
- Takes tierlists into account.

Cons:

- Isn't good at evaluating scores at all.

In a similar vein to [IIDX's KTRating](#ktrating-iidx),
we need a generic rating algorithm for DDR's scores.

However, I don't play DDR at all, and have no idea
of how to properly rate scores.

!!! help
	If you want to help out with Tachi, have a bit
	of maths knowledge and also play DDR, feel free
	to make an issue describing a new default DDR
	algorithm.

*****

### MFCP (DDR)

Pros:

- Understood by the community because of its inclusion in [LIFE4](https://life4ddr.com/).

Cons:

- Too Discrete.
- Only applies to a very small subset of scores.

MFCP (Marvelous Full Combo Points) are a scoring system
used by LIFE4 for its challenges. As the name implies,
you only get points for MFCs on a chart. And of that, the
chart must be DIFFICULT or higher, and rated higher than
level 8.

As such, it only applies to a rather small subset of
players and an even smaller subset of their scores.

***** -->
<!--
### KtRating (maimai)

- **Default for maimai**

Pros:

- Works for all scores.
- Doesn't reward weak passes on high rated charts.
- Takes tierlists into account.

Cons:

- Not well understood by players.
- Not amazingly accurate when it comes to high acc scores.
- Hypothetically broken by charts with lots (lots) of breaks.

In a similar vein to [IIDX's KTRating](#ktrating-iidx),
we need a generic rating algorithm for maimai's scores.

Maimai has a built-in rating algorithm, but it is not
implemented, nor is it known to me how it works.

This is an adapted version of IIDX's KTRating to work
for maimai. Since maimai is a very accuracy oriented game,
it punishes low-accuracy scores heavily.

Scores below 90% are heavily nerfed. Timing is rewarded
significantly. Clear type is ignored.

***** -->

### KtRating (MÚSECA)

- **Default for MÚSECA**

Pros:

- Works on all scores.
- Doesn't reward weak passes on high rated charts.
- Takes tierlists into account.

Cons:

- Not well understood by players.

We need a generic rating algorithm for MÚSECA's scores.

MÚSECA's built-in CURATOR RANK is built in a similar
vein to Volforce, but is broken by some
questionable chart rating decisions. This makes it
undesirable for score comparison.

This is the KTRating algorithm, with parameters tuned for MÚSECA.

Scores below 900k are heavily nerfed. Timing is rewarded
significantly. Clear type is ignored.

*****

### Sieglinde (BMS, PMS)

- **Default for BMS 7K, BMS 14K, and PMS**

Pros:

- Derives how difficult a lamp is to get by scores on LR2IR.
- An update to walkure without certain vulnerabilities.
- Only gives rating for popular tables.

Cons:

- Does not support Groove Clears, EX Hard Clears or FCs.
- Likely contentious for individual difference stuff. (What algorithm isn't!)

Sieglinde is a modern implementation of Walkure which
aims to fix a couple of issues with Walkure as an
individual score rating algorithm.

It uses data from IRs to derive an EC and HC value for
a chart, which is then given if you get EC or HC
respectively.

!!! note
	Due to poor data on LR2IR, and complete lack of support
	in LR2, Groove Clears and EX Hard Clears will be
	treated as Easy Clears and Hard Clears, respectively.

	Full Combos are similarly removed due to incredibly
	poor data. Grinding Full Combos on low level insane
	charts was the best way to raise your walkure!

!!! info
	For 7K, the currently supported tables are:

	- Insane1
	- Insane2
	- Normal1
	- Normal2
	- Satellite
	- Stella
	- Overjoy

	For 14K, no tables are currently supported.

*****

### Rating (CHUNITHM)

- **Default for CHUNITHM**

Pros:

- Built-in to the game.
- Universally understood by players.

Cons:

- ???

Rating refers to CHUNITHM's built-in rating algorithm.
This takes into account an internal tierlist, and looks
at the accuracy of the provided score.

!!! note
	I don't play CHUNITHM, so I don't really know the
	implementation flaws of this algorithm for individual
	scores.

*****

### Skill (Gitadora)

- **Default for GITADORA**

Pros:

- Built-in to the game.
- Universally understood by players.

Cons:

- Algorithm is very naive, and doesn't increase exponentially with respect to accuracy.

Gitadora's Skill algorithm is the in-game algorithm
for determining a players 'skill' on a given chart.

The algorithm itself is incredibly simple, and likely
breaks horribly for a lot of scenarios, but, it works
decently for what it is.

!!! note
	Unlike almost every other algorithm on this page,
	the GITADORA Skill algorithm can be expressed in a single line.

	$$
		f(p,l) = 0.01p * 20l
	$$

	Where P is the users percent, and L is the level
	of the chart.

*****

### Rate (WACCA)

- **Default for WACCA**

Pros:

- Built-in to the game.
- Generally well-understood by players.
- Uses the game's internal precise chart rating.

Cons:

- Significant favors good performance on charts released in
  the most recent version of the game.
- Uses wide cutoffs that don't reward AMs over SSS+.

Although a better score statistic could be implemented, Rate
is preferred since it is well-understood and can get the job
done.

*****

## Profile Statistics

This section explains the statistics on a user's profile.
These are almost always derived from individual score
statistics as listed above.

*****

### IIDX

The below statistics apply to SP and DP.

- BPI

The average of your highest 20 BPIs.

- KtLampRating **(Default)**

The average of your highest 20 ktLampRatings.

*****

### SDVX, USC

The below statistics apply to both SDVX and USC.

- VF6 **(Default)**

Your highest 50 VF6s added together. This has the benefit
of making VF6 not a small decimal, and is generally how
people talk about their volforce.

*****
<!--
### DDR

The below statistics apply to both SP and DP.

- MFCP

**ALL** of your MFCP added together.

- KtRating **(Default)**

The average of your highest 20 ktRatings.

***** -->

### MUSECA

The below statistics apply to maimai and museca.

- KtRating **(Default)**

The average of your highest 20 ktRatings.

*****

### BMS, PMS

- Sieglinde **(Default)**

The average of your best 50 Sieglinde scores.

*****
### CHUNITHM

- Naive Rating **(Default)**

The average of your highest 20 CHUNITHM Ratings.

!!! warning
	This is *different* to what you'd expect! CHUNITHM
	has a built-in profile rating mechanism, but it has
	some awful flaws with respect to losing rating after
	playing poorly, and is generally *very* hard to
	implement.

*****

### GITADORA

- Skill **(Default)**

Your profile skill as it appears in game. This is the
sum of all your skills on 50 HOT songs and 50 'NOT HOT'
songs.

!!! info
	This might be slightly different to your in-game
	skill. This may be due to rerates or things like
	certain songs no longer being hot.

*****

### WACCA

- Rate

The sum of your best 15 Rate scores from the most recent
version of the game, and your best 35 Rate scores from
previous versions of the game.

- Naive Rate **(Default)**

The sum of your best 50 Rate scores.

!!! info
	Your Rate should pretty much match what you see
	in-game. However, the in-game Rate advantages players on
	the newest version of the game by weighting those charts
	much more heavily, which is kind of dumb. NaiveRate
	should eliminate this bias. In practice, for active
	players on the newest version of the game, these values
	are usually quite similar.

*****

## Session Ratings

This section explains the statistics on a session.
These are almost always derived from individual score
statistics as listed above.

If a session has less than 10 scores, all of the below
statistics are marked as N/A except for MFCP.

*****

### IIDX

The below information applies to SP and DP.

- BPI, KtLampRating

The average of your highest 10 values for that statistic.

*****

### SDVX, USC

- VF6

The average of your highest 10 VF6's that session.

- Profile VF6 **(Default)**

The above statistic, but multiplied by 50. This is
to scale it up to what you'd normally see on a profile.

The reason for this multiplication is that, generally,
people don't like dealing with decimals. Furthermore,
SDVX players generally talk about their profile volforce,
rather than their individual volforce.
<!-- 
*****

### DDR

The below information applies to SP and DP.

- MFCP

The total MFCP you achieved this session.

!!! warning
	Unlike all other statistics, this is not marked
	as N/A if you have less than 10 scores.

- KtRating **(Default)**

The average of the highest 10 KtRatings that session. -->

*****

### maimai, MÚSECA

- KtRating **(Default)**

The average of the highest 10 KtRatings that session.

*****

### BMS, PMS

The below information applies to both 7K and 14K (and all of PMS).

- Sieglinde **(Default)**

The average of the highest 10 Sieglinde ratings that session.

*****

### CHUNITHM

- Naive Rating **(Default)**

The average of the highest 10 ratings that session.

*****

### GITADORA

- Skill **(Default)**

The average of the highest 10 skills achieved that session.

!!! note
	Unlike SDVX, we do not have a ProfileSkill here.
	There's no good reason for this, though.

	If people want it, it can be added! Feel
	free to report it as an issue if you think it
	should be added.

*****

### WACCA

- Rate **(Default)**

The average of the highest 10 Rates achieved that session.

[^1]: Skill is obviously very loosely used here. If there was a consensus on what "skill" something was, we would already have a perfect rating algorithm.
