# Style

This document explains the code style rules for the repo.

Please make sure any changes you commit adhere to the defined linting rules.

For style, we use ESLint + Prettier. We have some options set for prettier, and a lot of ESLint rules set.

Since it's redundant (You should just read the eslint docs), and mostly just personal preference, each individual rule isn't going to be explained here.

ESLint is set up to automatically perform all of these changes when ran.

!!! info
	You can run ESLint in the repo any time with `pnpm lint` or `eslint ./src --ext .ts --fix`.

*****

## Prettier Rules

- 4 Spaces Indenting.

I'd prefer to use tabs, honestly, but Prettier and JSDoc like to align things with spaces and it messes with them.

- Semicolons.

No-Semicolons causes issues with IIFEs.

- Try to keep things under 100 characters.

Absolutely do not insert random line breaks to keep stuff under 100 characters. It's fine for things to go a bit over.

Prettier has its own opinions on where these line breaks should happen, just trust them.

- Double Quotes instead of Single Quotes

JSON does it and that's pretty much the only reason why.

- Line Break is LF, not CRLF

Your editor will handle this properly. If it does not
automatically set, check the bottom right of your editor.
For Atom, VSCode and some others it will let you switch between
CRLF and LF.

## Commenting Style

The Tachi-Server codebase handles code comments against these rules:

1. Do not write redundant comments.
2. Return signatures are obvious from TypeScript most of the time. If they aren't, declare them.
3. Most of the time, comments should describe *why* code does something.
4. The exception is when a line or function **needs** to do something complicated - in which case, comments can be *how*.
5. That said, code should be self-explanatory.
6. If it isn't, it should be refactored until it is.
7. If that isn't possible (The logic is complex for good reason), the documentation should be next to the code.

### Example

For this example, we're going to write a function for calculating
[Standard Deviation](https://en.wikipedia.org/wiki/Standard_deviation).

```ts
function sd(arr: number[]) {
	const m = arr.reduce((a, r) => a + r) / arr.length;

	return Math.sqrt(arr.reduce((a, r) => (r + m) ** 2) / arr.length);
}
```

This is bad code. Very bad code. It is not at all clear what
this code does from any of the variable names, and the function signature barely helps.

Lets try and make this code more self documenting.

We'll give everything proper variable names, and then
expand the second `reduce` call into a simpler for loop.

```ts
function CalculateStandardDeviation(dataset: number[]) {
	const mean = arr.reduce((a, r) => a + r) / dataset.length;

	let variance = 0;

	for (const value of dataset) {
		variance += (value - mean) ** 2;
	}

	return Math.sqrt(variance / dataset.length);
}
```

Now that is much cleaner, but it's still perfect.

For example, what if someone didn't know what the standard deviation was?
Standard Deviation is *external knowledge*, and as such, we should document what this is.

The lazy way, is just this:
```ts
/**
 * @see {@link https://en.wikipedia.org/wiki/Standard_deviation}
 */
function CalculateStandardDeviation(dataset: number[]) {
	// ...
}
```

This is a perfectly acceptable way to document code. We
don't need to describe any returns or even the function here. As always, use your head to judge whether something needs external knowledge or not.

## Comment Directives

Tachi uses comment directives to allow for quick searching
of certain comments. Directives are used like this:

```ts
// @todo A bug with the foo is here.
1 + 1;
```

The list of directives and their meaning is here:

| Directive | Description |
| :: | :: |
| `@todo` | This line has a bug or something unfinished that needs to be done. A GitHub issue should be created about this. |
| `@danger` | The below code is dangerous, and if called wrong could cause issues. This directive should make the programmer act cautiously around the code before making changes. |
| `@hack` | A hack is used here. |
| `@optimisable` | This code is optimisable, and how to optimise it is known, but has not been implemented yet. |
| `@inefficient` | This code is slow, and how to optimise it is not figured out yet. |

!!! info
	TypeScript also uses comment directives for things
	like `@ts-expect-error`. What these do is documented
	in [TypeScript's documentation](https://www.typescriptlang.org).

## Strictness

Don't worry about this too much, At the end of the day, as
long as the code is understandable and the linter is happy,
it's good.
