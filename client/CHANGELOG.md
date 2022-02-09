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