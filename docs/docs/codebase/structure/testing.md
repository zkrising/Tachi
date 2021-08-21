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

!!! bug
	This may or may not impact you depending on how
	dependencies install, but `tap` requires `ts-node`
	and `typescript` to also be installed.

	Otherwise, you will get a
	`cannot use import outside of module`
	error, which indicates that our typescript hasn't
	been transpiled.

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