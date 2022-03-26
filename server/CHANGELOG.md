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

# CURRENT

- [ENH] The LR2Hook now saves courses.
- [ENH] The LR2Hook now saves gauge information.

*****

- [BUG] Having less than 20 valid scores for BPI is no longer advantageous due to regression to 0 profile BPI.
- [BUG] Timelines now prefer scores with timestamps if present, instead of preferring scores with null timestamps.

# 2.1.10

- [BUG] Users can no longer permanently lock themselves out of an import by making an import while one is ongoing.

# 2.1.9

- [ENH] Add an endpoint on UGPT/folder/:folderID/stats. This returns lamp and grade distributions for this ugpt:folder combo.
- [ENH] The UGPT Folder timeline endpoint now also returns the folder it worked on.

*****

- [BUG] OAuth2 tokens are now properly expired.
- [BUG] ForceStaticImport is no longer always on, even if off.

# 2.1.4

- [BUG] IIDX, BMS and PMS scores can no longer get an invalid grade if they are exactly 77.7777...%

# 2.1.3

- [INTERNAL_FEAT] Database seeds can now be automatically updated from a controlling server (#658, et. al.).

*****

- [ENH] Batch Manual can now update your game classes (Thanks, cg505).

*****

- [BUG] PMS charts now automatically insert themselves into the database instead of crashing.

## 2.1.2

- [ENH] Properly capitalise some improperly capitalised error messages.

## 2.1.1

- [INTERNAL_REWORK] Scripts are now included inside `src/` instead of outside it.

## 2.1.0

- [FEAT] Added Jubeat Support. (#169)
- [FEAT] Added Pop'n Music Support. (#69)
- [FEAT] Added WACCA Support. (#598)
- [FEAT] Added support for Skye's pop'n hook. (#563)
- [FEAT] Added PMS Support. (#45)
- [FEAT] Users can now be banned. (#640)
- [FEAT] A new endpoint has been added for searching on BMS, PMS and USC chart hashes. (#630)
- [FEAT] A new endpoint has been added for seeing your recently used imports. (#642)
- [FEAT] Added support for the SDVX EXCEED GEAR Cloud hook. (#636)
- [INTERNAL_FEAT] Config is now served from the server instead of being cloned to the client.
- [INTERNAL_FEAT] Database seeds is now split for staging and production usage.

*****

- [REWORK] KtRating is no longer the default rating algorithm for IIDX. It has been removed, and the new default is ktLampRating. (#597)
- [REWORK] USC no longer applies 3-person Automatic Score Reification. Charts must now be manually whitelisted. Note that scores are still saved for charts that might not be in the database at that time.

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
- [ENH] Emails now go to spam significantly less often, and are more likely to actually go to your mailbox. (#460)
- [INTERNAL_ENH] Most dependencies have been updated.

*****

- [BUG] UpdateClass now records the class as being recently achieved (i.e. display Chuuden -> Kaiden on the UI) (#589)
- [BUG] CHUNITHM's rating calculator no longer over-rewards SS rank scores. (#615)
- [BUG] Folder timelines now pull the oldest score for a given chart, rather than the newest. (#610)
- [BUG] Fixed bug where good plays on 3y3s long would get dropped due to a misunderstanding of a field. (#602)