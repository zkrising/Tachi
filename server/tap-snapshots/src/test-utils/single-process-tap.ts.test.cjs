
/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: abs with countNum but charts.type == single 1`] = `
Invalid countNum for goal with criteria.mode of 'abs'. Expected a whole number less than the total amount of charts available and greater than 1.
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: abs without countNum 1`] = `
[criteria.countNum] Expected number to be greater than or equal to 0. (Received nothing)
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: charts.data array of chartIDs that don't exist 1`] = `
Expected charts.data to match 2 charts. Instead, it only matched 1. Are all of these chartIDs valid?
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: charts.data array of identical chartIDs 1`] = `
Expected charts.data to match 2 charts. Instead, it only matched 1. Are all of these chartIDs valid?
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: charts.data array of single chartID 1`] = `
[charts.data] Expected an array of 2 to 5 strings in charts.data due to charts.type being 'multi'. (Received c2311194e3897ddb5745b1760d2c0141f933e683)
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: charts.data array when type == single 1`] = `
[charts.data] Expected a string in charts.data due to charts.type being 'single'. (Received c2311194e3897ddb5745b1760d2c0141f933e683,c2311194e3897ddb5745b1760d2c0141f933e683)
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: charts.data folder refers to folder that doesn't exist 1`] = `
A folder with id fake-folder does not exist for iidx:SP.
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: charts.data when type == any 1`] = `
[charts.data] Invalid charts.data for type 'any'. Must not have any data! (Received foo)
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: negative percent 1`] = `
[criteria.value] Expected number to be greater than or equal to 0. (Received -1)
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: nonsense charts.data 1`] = `
A chart with id nonsense does not exist for iidx:SP.
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: nonsense charts.type 1`] = `
[charts.type] Expected any of single, multi, folder, any. (Received nonsense)
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: nonsense mode 1`] = `
[criteria.mode] Expected any of single, abs, proportion. (Received nonsense)
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: percent greater than 100 1`] = `
Invalid value of 100.1 for percent goal. Percents must be between 0 and 100.
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: percent of 0 is a non-goal 1`] = `
Invalid value of 0 for percent goal. Percents must be between 0 and 100.
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: proportion without countNum 1`] = `
[criteria.countNum] Expected number to be greater than or equal to 0. (Received nothing)
`

exports[`src/test-utils/single-process-tap.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: single with countNum 1`] = `
[criteria.countNum] Invalid countNum for mode 'single'. Must not have one! (Received 123)
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: abs with countNum but charts.type == single 1`] = `
Invalid countNum for goal with criteria.mode of 'abs'. Expected a whole number less than the total amount of charts available and greater than 1.
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: abs without countNum 1`] = `
[criteria.countNum] Expected number to be greater than or equal to 0. (Received nothing)
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: charts.data array of chartIDs that don't exist 1`] = `
Expected charts.data to match 2 charts. Instead, it only matched 1. Are all of these chartIDs valid?
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: charts.data array of identical chartIDs 1`] = `
Expected charts.data to match 2 charts. Instead, it only matched 1. Are all of these chartIDs valid?
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: charts.data array of single chartID 1`] = `
[charts.data] Expected an array of 2 to 5 strings in charts.data due to charts.type being 'multi'. (Received c2311194e3897ddb5745b1760d2c0141f933e683)
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: charts.data array when type == single 1`] = `
[charts.data] Expected a string in charts.data due to charts.type being 'single'. (Received c2311194e3897ddb5745b1760d2c0141f933e683,c2311194e3897ddb5745b1760d2c0141f933e683)
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: charts.data folder refers to folder that doesn't exist 1`] = `
A folder with id fake-folder does not exist for iidx:SP.
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: charts.data when type == any 1`] = `
[charts.data] Invalid charts.data for type 'any'. Must not have any data! (Received foo)
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: negative percent 1`] = `
[criteria.value] Expected number to be greater than or equal to 0. (Received -1)
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: nonsense charts.data 1`] = `
A chart with id nonsense does not exist for iidx:SP.
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: nonsense charts.type 1`] = `
[charts.type] Expected any of single, multi, folder, any. (Received nonsense)
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: nonsense mode 1`] = `
[criteria.mode] Expected any of single, abs, proportion. (Received nonsense)
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: percent greater than 100 1`] = `
Invalid value of 100.1 for percent goal. Percents must be between 0 and 100.
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: percent of 0 is a non-goal 1`] = `
Invalid value of 0 for percent goal. Percents must be between 0 and 100.
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: proportion without countNum 1`] = `
[criteria.countNum] Expected number to be greater than or equal to 0. (Received nothing)
`

exports[`src/server/router/api/v1/users/_userID/games/_game/_playtype/targets/goals/router.test.ts TAP POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal Should reject invalid goals. > Invalid Goal: single with countNum 1`] = `
[criteria.countNum] Invalid countNum for mode 'single'. Must not have one! (Received 123)
`
