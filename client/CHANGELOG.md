<!-- This file is not automatically generated. We write this by hand. -->
<!-- You must update it by hand too! -->

# Syntax

|  Type  |                            Description                            |
| :----: | :---------------------------------------------------------------: |
|  BUG   |                        This was a bug fix.                        |
|  ENH   | This was an enhancement, An improvement to an existing behaviour. |
|  FEAT  |                          A new feature.                           |
| REWORK |             An existing feature was reworked/changed.             |

Anything prefixed with `INTERNAL_` has absolutely no bearing on end users, and should
not generally be shown to end users.

# Changelog

# Current

- [ENH] IIDX and BMS Dan gauge now displays in gray.
- [ENH] Showcase Stats now have the option to limit returned charts to just those you've played.
- [ENH] internal decimal levels are now displayed on the song page.

*****

- [BUG] Numeric level indicators no longer appear when the numeric level is 0 (For kichiku, kiraku, etc.)
- [BUG] 2dxtra charts now have more obvious shorthand.


# 2.1.7

I haven't been keeping this dilligently up to date.

- [ENH] Sessions now display their ratings.
- [ENH] BMS scores submitted by the LR2Hook now include graph data.

# 2.1.2

- [INTERNAL_ENH] Keys no longer *ever* use random ids. This was a fundamental misunderstanding of react on my part.

*****

- [BUG] The tierlist viewer no longer crashes if a change causes a bucket to be empty.

# 2.1.1

- [BUG] USC Searches no longer display (undefined) next to them.

## 2.1.0

- [FEAT] Added UI support for Jubeat, Pop'n, WACCA and PMS.
- [INTERNAL_FEAT] Config is now served from the server instead of being cloned to the client.

*****

- [ENH] Added a CHANGELOG.md file. (#81)
- [ENH] Rating algorithms now explain what they are in the UI.
- [ENH] Massively improved the display of BPI related stuff. (#82)
- [ENH] Showcase stats on charts now link to the chart in question.
- [ENH] Ranking info is now clickable to go to the leaderboard.
- [ENH] You can now set a BPI target.
- [ENH] You can now set a VOLFORCE target.
- [ENH] Song search now displays the table for the chart for BMS.
- [ENH] Song search now displays the effector for USC.
- [ENH] Banned users now know that they're banned.
- [ENH] Beatoraja IR instructions now include example `.bat` and `.sh` files for properly booting the IR.
- [ENH] Add a GDPR page.
- [ENH] Renamed "All Games" to "Global Info", should be clearer.
- [ENH] FAILED scores for SDVX and USC now visually display as "PLAYED" instead. Note that this is **PURELY** visual.
- [ENH] Import Scores now shows recently used import methods if no game is selected.

*****

- [BUG] Going from the ARC page to your profile no longer crashes the client.
- [BUG] Using userIDs instead of usernames in the URL no longer crashes the client.
- [BUG] The Switchboard graph now loads even if you have no sessions on the game.
- [BUG] Charts without tierlist information now still render at the bottom of tierlist view.
- [BUG] The PBs indicator underneath a session is now correct, and not just the amount of scores you had.