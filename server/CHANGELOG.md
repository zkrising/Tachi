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

## 2.1.0 (Ongoing Development)

- [FEAT] Added Jubeat Support. (#169)
- [FEAT] Added Pop'n Music Support. (#69)
- [FEAT] Added WACCA Support. (#598)
- [FEAT] Added support for Skye's pop'n hook. (#563)
- [FEAT] Added PMS Support. (#45)
- [INTERNAL_FEAT] Config is now served from the server instead of being cloned to the client.
- [FEAT] Users can now be banned. (#640)

*****

- [REWORK] KtRating is no longer the default rating algorithm for IIDX. It has been removed, and the new default is ktLampRating. (#597)

*****

- [ENH] Added a CHANGELOG.md file. (#627)
- [ENH] BATCH-MANUAL now supports the `percent` field for jubeat only. (#620)
- [ENH] Add support for jubility. (#163)
- [ENH] Move BPI related data (Kaiden Average and BPI) to IIDX charts, instead of being in a separate collection. This lets us display more stats on the UI. (#599)
- [ENH] Add game specific indexes. (#606)
- [ENH] Ratings are nullable now. (#611)
- [ENH] Pre-HV Leggendaria songIDs are now properly resolved. (#487)
- [ENH] IIDX Imports are now significantly faster.
- [ENH] GITADORA now supports `naiveSkill` -- Although GITADORA support isn't actually on yet. (#624)

*****

- [BUG] UpdateClass now records the class as being recently achieved (i.e. display Chuuden -> Kaiden on the UI) (#589)
- [BUG] CHUNITHM's rating calculator no longer over-rewards SS rank scores. (#615)
- [BUG] Folder timelines now pull the oldest score for a given chart, rather than the newest. (#610)
- [BUG] Fixed bug where good plays on 3y3s long would get dropped due to a misunderstanding of a field. (#602)