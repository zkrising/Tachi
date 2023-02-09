# Setting up a Local Development Environment

Before you can contribute to Tachi, it'll help to have a functional setup on your machine.

You don't *necessarily* need to have a working install to contribute - you could easily
make documentation contributions without having anything running on your machine - but
it's extremely helpful to be able to run Tachi's things while working on them.

## 0. Get some developer tools.

If you're an experienced programmer, you won't need this bit.

### Editor

You'll need an editor to work in!

If you've only done a bit of programming in school,
you might be used to something like Visual Studio.

Sadly, Visual Studio is *not* a great editor for a codebase like Tachi. Visual Studio is
really good at writing C# (a language we don't use at all),
but its integration with TypeScript (the language we use) is quite poor.

We **highly** recommend that you get [VSCode](https://code.visualstudio.com/). Especially
if you're a beginner! It's an extremely good editor, and has remarkably good integration
with everything we use.

### Terminal

You'll need a terminal to run commands in. For Linux and Mac users, you can just open
a Terminal app.

However, for Windows users we recommend installing the [Windows Terminal](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701?hl=en-gb&gl=GB).

With a terminal open you can proceed to the next steps!

## 1. Getting Node and Docker.

You'll need `node` and `npm` in order to run Tachi. Install this from [the official NodeJS website](https://nodejs.org).

!!! info
	If you are on linux, NodeJS will be provided by your package manager instead.
	
	You may wish to use that instead. It honestly doesn't matter all too much.

Check that the install has worked by running `npm -v`. If you get an error message saying that `npm` was not found, try restarting the terminal.

To set everything else up for local development, we'll use [Docker](https://docker.com).

=== "Windows, WSL Ubuntu"
	You should install [Docker Desktop](https://docs.docker.com/desktop/) instead.
	Docker doesn't work well inside WSL.

=== "Debian"
	[Please use the official Docker install guide.](https://docs.docker.com/engine/install/debian/)

=== "Ubuntu"
	[Please use the official Docker install guide.](https://docs.docker.com/engine/install/ubuntu/)

=== "Arch, Manjaro"
	```sh
	sudo pacman -S docker docker-compose
	```

=== "MacOS"
	```sh
	brew install docker docker-compose
	```

!!! info
	Docker is like a VM[^1]. It runs an entire Linux box to contain your software in, and generally sidesteps the whole "works on my machine" problem, by just shipping the entire machine.

## 2. Fork and pull the repo.

Since you can't just commit straight to someone elses codebase (that would be a massive security issue), you need to make a fork of Tachi - One owned by you!

Go to [the Tachi repository](https://github.com/TNG-dev/Tachi) and click the Fork button in the top right (Make sure you're signed in).

Now, back to the terminal:

!!! tip
	It's good organisation to make a folder on your PC for codestuffs.
	
	If you do that, make sure you open the terminal in that folder,
	so your Tachi repo will save there!

```sh
# This will create a folder called Tachi on your PC.
# It'll create it wherever your terminal is currently open in.
git clone https://github.com/YOUR_GITHUB_USERNAME/Tachi

# Open this repository in VSCode!
code Tachi
```

## 3. Authenticate with Github.

You'll need to authenticate with GitHub before you can actually push changes back
to your repository.

There's a remarkably easy way to do this, using GitHub's `gh` tool.

=== "Debian, Ubuntu, WSL Ubuntu"
	[Use the official Linux instructions.](https://github.com/cli/cli/blob/trunk/docs/install_linux.md)

=== "Arch, Manjaro"
	```sh
	sudo pacman -S gh
	```

=== "MacOS"
	```sh
	brew install gh
	```

Once you've installed it, type `gh auth` and follow the instructions.
You should now be properly authenticated!

## 4. Start Tachi!

With a terminal open inside the `Tachi` folder you just cloned, run `npm start`.

The frontend will be running on `http://127.0.0.1:3000`.
The backend will be running on `https://127.0.0.1:8080`.

!!! danger
	The backend **always runs on HTTPS** in local development. This is because browsers
	tend to *really* hate HTTP mode nowadays, and it causes so many problems.

	You **need** to navigate to your running instance of the backend in a browser, and tell
	the browser that you trust these certificates. Otherwise, all client requests to
	the server will silently be chomped by the browser.

## 5. Editor Plugins

If you're using VSCode as your editor (I *really* recommend it!) You'll want a couple
plugins.

Namely, Install the ESLint plugin, and enable "Format On Save" in your settings. We use an [incredibly strict](https://github.com/CadenceJS/Cadence) plugin for ESLint, which catches a *ton* of programming errors and mistakes. By having it run in your editor, you can see your mistakes before you ever run the code, and have them automatically fix on save!

!!! tip
	With `Ctrl-Shift-P`, you can open VSCodes "Command Palette". This will let you search
	for all the possible things VSCode can do. To open the settings, you can use `Ctrl-Shift-P` and search for "Settings".

	It's ridiculously convenient, and there's a bunch of other stuff that VSCode helps with.

## 8. OK, Now what.

Now that you've got a working version of Tachi running on your local PC, you should go check out the [component-specific contribution guides](./components.md)!

[^1]: Docker is not actually a VM, it's significantly smarter and does some Linux jail cgroup nonsense. All you need to care about is that we're using it to spawn Linux VMs on your host system.
