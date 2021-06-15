# Tests

Tachi makes extensive use of tests to ensure code
is of high quality when its released.

*****

## Running Tests

Tests are ran with [node-tap](https://node-tap.org).

You can run the server test suite with the following script:

```
pnpm fulltest
```

This will execute every test, and also perform coverage
analysis.

## Parallel Tests

You can run tests in parallel with:
```
pnpm paralleltest
```

!!! danger
	**DO NOT RUN THIS ON YOUR LOCAL DEVELOPMENT SETUP**!

	This will flood your MongoDB installation with nonsense
	collections.

	This is intended for things like GitHub Actions, where
	the environment itself is ephemeral and fine to be
	destroyed.

This provides slight performance benefits, but as mentioned
in the warning above, is only for ephemeral environments.

## Writing Tests

Tests should be located in the same folder as the file they're testing, and tests should only ever test
exports from one file at a time.

Tests should call things like `ResetDBState` and `CloseAllConnections` as lifecycle hooks to ensure
the file exits.

Tests should use the extension `.test.ts`, and keep
the same filename as the file they are testing.

## Coverage

Coverage should be kept above 80%. New code should be tested.

Pull Requests will be rejected if they contain significant
changes that are untested!