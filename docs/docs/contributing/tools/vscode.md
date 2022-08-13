# VSCode Guide

!!! info
	This is an excerpt/early draft from The Long Guide, a guide `zkldi` is writing to
	teach people programming from zero. Feedback is very much appreciated.

	As a result, this is also wrote in a far less Tachi-specific tone.

	The Long Guide also makes liberal use of "Detours". These paragraphs provide context
	or history for the things that are going on. Reading them will help!

[VSCode](https://code.visualstudio.com) is an excellent tool for programming. It has everything I've ever wanted, and it's pretty easy to understand. The below content is more like VSCode tips than it is a guide, as the software is fairly approachable.

## Command Palette

With `Ctrl-Shift-P`, you can open the command palette. This will let you search *all* possible commands available in VSCode.

You can search pretty fuzzily, and this means you never really have to memorise keyboard shortcuts (unless you use something a lot, at which point you'll just memorise it anyway!)

For example, if you type in `Split Editor`, it'll come up with all the commands for splitting your editor in half. In general, if you want to do something in VSCode and don't remember the shortcut, search for it in here!

## Quick File

With `Ctrl-P`, you can jump to any file in the folder you have open.

## Quick Switch

With `Ctrl-R`, you can switch what project you have open. If you're holding shift, this will open it in a new instance of VSCode.

## Terminal

VSCode comes with a built-in terminal. You can open and close it with `Ctrl-J`.

## Settings

Everything about VSCode is configurable. Open the settings (You can use `Ctrl-Shift-P` and search for Settings UI!), and twiddle with all the things!

## Enable Whitespace Viewing

This is extremely useful in my opinion. Turn on Whitespace Viewing via `View: Toggle Render Whitespace` in the command palette. It's great for finding annoying whitespace bugs in languages where that matters.

## Extensions

Finally, VSCode can be extended with extensions. You can grab new themes and colour schemes here (change them by searching for "change theme" in the command palette.)

You can also add useful extensions, like those that add better support for languages.

For Tachi contributions, I highly recommend the `ESLint` plugin, as we use `ESLint` to highlight a lot of common errors in our codebase.