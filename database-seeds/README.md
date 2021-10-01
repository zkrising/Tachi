# Tachi Database Seeds

This repository contains some base "seed" files for the Tachi Database.

They are intended to be used with MongoDB, but since these are just a JSON export, you can
really do anything you want with them.

## What Databases Are Here?

Nothing private, nothing pertaining to an instance of Tachi. These are backbone files, such
as songs, charts, and folders.

You can read more about what all these documents mean in [tachi-common](https://github.com/TeamNewGuys/tachi-common).

- `songs-{game}`

These contain the song documents for the provided game.

- `charts-{game}`

These contain the chart documents for the provided game.

- `folders`

This contains the set folders for all games.

- `tables`

This contains the set tables for all games.

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

## I want db dumps for things like scores and users!

Coming soon...

## Oddities

`git diff` on this repo will likely be horrifically broken. There's not much we can do
about that, since git absolutely was not designed for this. Ah well.
