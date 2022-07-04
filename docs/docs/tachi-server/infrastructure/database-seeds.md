# Database Seeds

Tachi uses a separate git repository called the [Database Seeds](https://github.com/tng-dev/tachi-database-seeds) to maintain 'static' databases.

The databases in question aren't (normally) altered by the server code. We essentially overload git and its CI tools to version control parts of our database.

## What's in the seeds?

The seeds contain all the [SongDocument](../documents/song.md)s and [ChartDocument](../documents/chart.md)s for all of the games supported by Tachi.

They also include all Folder Documents, Table Documents and BMS Course Documents.

## Synchronisation

When pushes are made to `develop` (the main branch), our running staging servers will automatically update to that new bit of data.

When pushes are made to `production`, our running *production* servers will automatically update in the same way.

## Why bother?

Making all of this data public and easily accessible is one of the best ways to help out other people making rhythm game tools.

The database seeds are an invaluable resource for other programmers who don't want to scrape data themselves.

It's also very useful for Tachi. Having charts on a public git repo allows anyone to trivially PR things they know to be wrong.
This level of openness to contribution is great, and has resulted in a lot of good work being done by the community.
