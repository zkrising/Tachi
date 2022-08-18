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

- [INTERNAL_REWORK] The entire codebase has been moved to a new eslint config, called Cadence. This is in preparation for an even larger refactor, but that likely won't happen for a while.
- [REWORK] Metronic CSS has been forced out of the repo, allowing us to go open source. Watch this space!
- [REWORK] We're now a monorepo! Way easier to make common changes now.

*****

- [FEAT] Add an endpoint for reverting imports.
- [FEAT] Rivals have been added.
- [FEAT] Goals have been added.
- [FEAT] Milestones have been added.
- [FEAT] Milestone Sets have been added.
- [FEAT] Batch Manual imports can now pass `classes`, to hand-declare certain classes, such as IIDX Dans, WACCA Stage Ups, or similar.
- [FEAT] Added support for an IIDX DP tierlist.
- [FEAT] Added support for exporting all of a users scores.
- [FEAT] Added support for reverting an import.
- [FEAT] Added support for retrieving a users imports, including by user-intent.
- [FEAT] Notifications can now be sent to users.
- [FEAT] Search implementation is massively improved (#713)
- [FEAT] BMS and PMS database changes are automatically backsynced to their parent seeds repository (#732)
- [FEAT] Support for the BMS AI Table.
- [INTERNAL_FEAT] Schemas have been moved into tachi-common and properly refactored.
- [INTERNAL_FEAT] Tachi-Server now has a migration engine, for applying database updates automagically.

*****

- [ENH] IIDX and BMS Dan gauge now displays in gray.
- [ENH] Showcase Stats now have the option to limit returned charts to just those you've played.
- [ENH] WACCA Internal decimal levels are now displayed on the song page.
- [ENH] Force Static Import now disables itself after doing one static import. This is a safety feature to prevent you from spamming your profile with pb imports.
- [ENH] Milestones will automatically update and resync off of database-seed changes.
- [ENH] The beatoraja IR now says how many people have played a chart on its way to de-orphaning.
- [ENH] Server administrators can now delete other's scores.
- [ENH] Server administrators can now revert other's imports.
- [ENH] You can now set Jubility targets.
- [ENH] Folder Showcase Stats are now removed from a player in the case of the folder being removed.
- [ENH] ARC SDVX Support has been bumped to EXCEED GEAR.
- [ENH] The AI table now automatically updates itself.
- [INTERNAL_ENH] Server version info is now read from package.json, removing redundancy.
- [INTERNAL_ENH] The commit the server is running under is now exposed publically in version info.

*****

- [BUG] Numeric level indicators no longer appear when the numeric level is 0 (For kichiku, kiraku, etc.)
- [BUG] 2dxtra charts now have more obvious shorthand.
