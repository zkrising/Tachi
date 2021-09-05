# Contributing
A basic overview of code-style & preferred methods of doing things.

If you have any questions or suggestions, please create a ticket. We are open to suggestions.

# Styleguides
## Git commit messages
- Be explicit about what you changed. ("Fixed bug" vs "Fixed bug relating to incorrect import") 
- reference issue numbers if possible ("Fixed incorrect env var as reported in #3") 

## Code preferences
These are not strictly necessary however it is nice to have a codebase where everyone's code looks the same

Verboseness is preferred, be explicit with your types and interfaces.
If you use an object more than once or pass it around, create an interface or type.

### Enums
enums are preferred due to their nicer accessor patterns as well as making potential refactors easier.

```ts
/** Preferred */
export enum LoggerLayers {
	client = "client",
	slashCommands = "slashCommands"
}

const logger = createLayeredLogger(LoggerLayers.client)
```
```ts
/** Allowed but not preferred */
export type loggerLayer = "client" | "server"
const logger = createLayeredLogger("client")
```

### Prettier
Prettier should be run on save and before committing.

### ESLint
Eslint should be run on save and before committing.

### Try & Catch
Functions where any form of complex actions occur should be wrapped in try catch blocks. Errors preferably must be handled.
```ts
const myComplexFunc = async (): myReturnValue => {
	try {
		logger.info("Describe whats happening");

		const foo = await callNetworkingFunction("bar", "baz");
		return foo.zoo
	} catch (e) {
		/** if 'e' is more complex handle different error messages */
		logger.error("Describe what went wrong", e);
	} finally {
		logger.info("Describe what succeeded");
	}	
}
```

### Tabs vs Spaces
Tabs, ESLint enforces this.
