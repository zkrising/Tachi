# Setup

This page documents how to get the `tachi-server` up and running.

This guide assumes that you are running on some
flavour of Linux.
`tachi-server` is not tested on Windows, but it is likely
to work, as we don't depend on any OS specific calls.

## Externals

`tachi-server` depends on some external projects (mainly databases) in order to work.

### 1. Run MongoDB

The easiest way to do this is through `docker`.

```
docker pull mongo
docker run -d -p 27017:27017 --name mongodb mongo
```

### 2. Run Redis

See [Redis QuickStart](https://redis.io/topics/quickstart).

### 3. Get NodeJS and NPM.

```
sudo apt-get install nodejs
```

!!! info
	`tachi-server` has not been tested on anything other than NodeJS v14, v15 and v16.

	Given that these are all the latest versions of NodeJS,
	this shouldn't be an issue.

### 4. Pull the code.

```
git clone https://github.com/zkldi/tachi-server
cd tachi-server
```

### 5. Install Dependencies

We use `pnpm` instead of NPM. You can read why [here](../infrastructure/toolchain.md).

Ironically, NPM is the easiest way to install PNPM.
NPM should come bundled with your install of NodeJS.

```
npm install -g pnpm
```

Then we can install our dependencies.

```
pnpm install
```

### 6. Setup the `tachi-server` config.

We use a file called `conf.json5` in the top level
of the repository to handle configuration of the
server.

The config file we use for running tests can be found in `.github/test.conf.json5`

You can read more on how this config file works at [Configuration Info](./config.md)


### 7. Run!

```
pnpm build
pnpm start
```

This will build the server TypeScript into JS under `/js`,
and run it. The port it runs on is determined by the config
file.
