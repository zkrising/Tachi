# Tachi Database Seeds

This repository contains some base "seed" files for the Tachi Database.

They are intended to be used with MongoDB, but since these are just a JSON export, you can
really do anything you want with them.

## Contribution Info

All work should be merged into `develop`. That branch is synced with the staging deploys of Tachi.

Changes will then be merged and cherry picked into `production` whenever is best. Production will
be reset as a branch every once in a while, and lose its history. This is fine. Don't worry about it.

## What Databases Are Here?

Nothing private, nothing pertaining to an instance of Tachi. These are backbone files, such
as songs, charts, and folders.

You can read more about what all these documents mean in [tachi-common](https://github.com/TNG-dev/tachi-common).

- `songs-{game}`

These contain the song documents for the provided game.

- `charts-{game}`

These contain the chart documents for the provided game.

- `folders`

This contains the set folders for all games.

- `tables`

This contains the set tables for all games.

- `bms-course-lookup`

BMS Dans that should be registered by the IR.

## How do I use this?

Depends what you want. If you're familiar with JSON, just
take the files and do whatever.

If you want to analyse this data in a more advanced fashion,
install `mongodb-tools` (You'll want mongoimport in `$PATH`) from your favourite location.

Then, run these commands:
```sh
cd scripts
pnpm install
node import -d your_db_name
```

Note that you'll need `pnpm` and `node` installed.

You can then use a tool like [MongoDB Compass](https://www.mongodb.com/products/compass) to analyse the data.

## Contribution

If your change involves inserting or removing records, you **must** run `node scripts/deterministic-collection-sort.js`.
This will ensure diffs stay somewhat sane.

## I want db dumps for things like scores and users!

Coming soon...

## Oddities

Yes. I force push `develop` to `production` from time to time. This is because `git cherry-pick` 
result in a diverging history. Some repositories do this by making a `release-vX.x.x` branch and
updating that, but I really don't need the archiving.
