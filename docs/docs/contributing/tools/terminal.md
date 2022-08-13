# Terminal Guide

!!! info
	This is an excerpt/early draft from The Long Guide, a guide `zkldi` is writing to
	teach people programming from zero. Feedback is very much appreciated.

	As a result, this is also wrote in a far less Tachi-specific tone.

	The Long Guide also makes liberal use of "Detours". These paragraphs provide context
	or history for the things that are going on. Reading them will help!

The terminal is **the most important** tool to know as a programmer. That might sound like a bold claim, but **everything** you want a computer to do is done via the terminal - graphical interfaces are typically just buttons that hide terminal commands.

When it comes to programming tools, we typically *don't* make graphical interfaces for our tools. As such, it's necessary to learn the terminal to be able to launch your tools!

In this guide, we'll cover the terminal - one of **the most important** pieces of kit you'll use.

## Operating System Stuffs

This guide is intended for a Unix system - that's Linux, MacOS or [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install).

For Windows users, this can be a bit of a pain to get set up with. If you're not comfortable installing the Windows Subsystem for Linux, you can always run Linux in a VM.

### Detour: Virtual Machine

If you're opting to install Linux in a virtual machine, Ubuntu maintain a [straightforward guide](https://ubuntu.com/tutorials/how-to-run-ubuntu-desktop-on-a-virtual-machine-using-virtualbox#1-overview) for getting a Virtual Machine up and running.

Once you've got a Unix system available, we can get started!

### Detour: What's wrong with the Windows Command Line?

In short, Windows is the only major OS that isn't derived from something called Unix.

In long, a history lesson:

Unix is an **old** operating system - as in, it started development before the moon landing.
It was developed primarily by Ken Thompson and Dennis Ritchie; these guys also made the C programming language, which Unix was almost entirely wrote in.

It was designed for programmers (well, they were the only people really using computers in the 70s), and grew very popular in those circles. As a result, *to this day*, most programming tools are developed using Unix's tools with a Unix environment.

Unix's influence on computing *cannot* be understated, but Unix itself is not ran much anymore.

MacOS is derived from Unix, and Linux is similarly so.

Windows - however - comes from an entirely different family tree: MS-DOS. As such, the Windows environment is different in a bunch of significant ways.

Of course for regular users, this doesn't matter - they're hardly tinkering with internals!
But for programmers, the differences are *very* significant. Everything from what command lists the files in a folder, to *what a filename even is* is different.

Due to this, and Unix's programmer-centric design, Windows is a second-class citizen to a lot of programming tools.

## Opening the Terminal

Your operating system will come with a "Terminal" application.

On MacOS, this is called `Terminal.app`.

On Windows, you can install [Windows Terminal](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701?hl=en-gb&gl=GB). It has significantly better integration with WSL, which you'll need to follow this guide.

On Linux, there are many available terminal. Generally, searching for `Terminal` in your list of installed applications should come up with atleast one. If you're using a Linux system on your main PC.

Open a terminal, and we'll get started running some commands!

## Files, Folders, Paths

As you might've guessed, the terminal is *text only*. There's no pointing and clicking, and there's no buttons to click on.

However, very often in the terminal (or in code!), we'll be interacting with files and folders, and navigating the filesystem!

So before we dive right in, let's talk for a bit about the idea of files and folders.

Hell, this chapter might seem like a meaningless diversion, you've used files and folders all the time! However, properly understanding folders and files is **crucial** to understanding the terminal.

## Folders

Folders are the simplest thing to understand. A folder contains files, or more folders.

```
My Documents/
	Work Documents/
		some-code.js
		cv.docx
	
	poems.txt
```

In the above example, `My Documents` is a folder that contains two items:

- A *file* called `poems.txt`
- and another folder called `Work Documents`, which contains some more stuff.

## Files

Files contain *data*. This is a tad complex, but for the time being all we need to know is this:

- A file's extension is just a suggestion. It has no bearing on the content of the file.

Lets say we have a file called `file.pdf`.
If we rename it to `file.mp3`, the *data* inside the file actually stays *exactly the same*.

Of course, trying to listen to it in an mp3 player won't work, but if you were to `Open With...` that `.mp3` with something that views `.pdf`s, it will load perfectly fine!

We'll actually prove this later, so keep this in mind!

- A file just stores data.

### Detour: How do we go from bytes to text?

!!! note
	If you're not familiar with hexadecimal (or binary), [a quick rundown is available here](http://www.emulator101.com/introduction-to-binary-and-hex.html).

You might already know that computers can only store 0s and 1s. How do we go from 0s and 1s as bytes into text we can read?

Well, we have *literally* assigned a number to every single character in every single alphabet.

No, seriously. It's called Unicode, and you can [check it out.](https://www.fileformat.info/info/charset/UTF-8/list.htm)

When a program wants to display a file as text (notepad, a code editor, etc.), it goes through every byte in the file and converts it using that above table.

So technically, when you store `hello world!` in a file,
it's actually storing `68 65 6c 6c 6f 20 77 6f 72 6c 64 21 0a`.

A hex value of `68` corresponds to `h`, `65` corresponds to `e`... and so on!

!!! note
	For further reading, Tom Scott has an *excellent* video on this, [check it out](https://www.youtube.com/watch?v=MijmeoH9LT4).

## Filepaths

We want to refer to files on our computer in text form. This is *really* common if you're writing code that reads a file, or doing *literally anything* in a terminal.

There are two kinds of file paths:

### Absolute

Absolute filepaths are defined from the *root* (like, the top level folder) of the filesystem, and **always start with a slash (`/`)**.

As an example, the path `/home/someone/Documents/file.txt` refers to the file located at:
```
home/
	someone/
		Documents/
			file.txt
```

These are great, but they can get cumbersome. If I'm doing stuff in my documents folder, I don't want to start all of my filepaths with `/home/someone/Documents/whatever_file_i_want_to_work_on`!

### Relative

Relative file paths are *relative* to the folder you're currently in. **They can start with anything, but NEVER a slash (`/`)**.

As an example, lets say I'm working in the `/home/someone` folder. I want to refer to the same file as above: I could do it with the path `Documents/file.txt`.

We can also refer to files *outside* of the folder we're currently working in. A file called `..` is special, it means "go up a folder".

In our case, if I wanted to open the file `/home/someone_else/file.txt`, and I was still working in the `/home/someone` folder, I could do it with the path `../someone_else/file.txt`!

## OK, enough noise, lets get writing commands.

Open a terminal, if you don't have one open already.

The first word you write in a terminal is the program you wish to run. On a Unix system, most useful programs are stored in the `/bin` folder.

Let's check what type of operating system we're running on, using the `/bin/uname` command.

```sh
/bin/uname
```

Great! This should have output some text back into your terminal. It's not very useful, but it's a good sanity check.

Every word after the command you write is passed to the program. For example, `/bin/touch` creates a file at the path provided.

```sh
/bin/touch some_file
```

`/bin/ls` will list all of the files in the folder we're currently in. Do that to see your newly created file!

Let's put some content into it. Find this file on your system (you can use `/bin/pwd` to find out what folder your terminal is open in), and put some text into it using a notepad app.

!!! tip
	You can also use notepads inside the terminal - the proper term for them is "Text Editor", because, well, they edit text!

	`/bin/nano` is one of the more intuitive terminal text editors. You can use that to
	write some data into your file, then use `Ctrl-O` to save, and `Ctrl-X` to quit.

	If those keybindings seem arcane to you, it's because `nano` is from the 1980s.

Once you've got some data in the file, use `/bin/cat` to read the data.

```sh
/bin/cat some_file
```

Finally, we can use `cd` to move around the filesystem (to `c`hange `d`irectories). Interestingly, `cd` is *not* a command stored on the filesystem, but is actually *built in* to the shell. It's weird, and we'll understand it better later.

```sh
# Change what folder we're in to the root of the filesystem.
cd /

# you can use /bin/ls to list what files and folders are here.
/bin/ls

# ...and cd into one of them!
cd home
```

Excellent. This covers moving around in the terminal and poking around with files.

## Echoes, Variables

`/bin/echo` is a seemingly useless command. It repeats what you say to it.

```sh
/bin/echo hello world!
```

This will just spit out "hello world!" exactly as you wrote it. This program has to be useless, right? Nope. It's actually *really* helpful.

Let's talk about variables. In the shell, variables are a name that you can assign a value to.

Let's create a variable called `NAME` which contains our name. We do that with the `=` operator.

```sh
# The lack of space between NAME and = is significant. Otherwise, it tries to read it as
# running a program called NAME. The shell is old, and stupid.
NAME=yourname
```

We can then use echo to spit this variable back out. By using a `$`, we state that the following text is a variable, and should spit out that variable's value instead!
```sh
/bin/echo My name is... $NAME
```

This should spit out your name!

Of course, this isn't mighty useful. However, variables *are* useful to the programs we run. Programs can actually acce

Not all variables have to be defined by us. Some are defined by the shell itself. One of those, is `$PATH`.

Wanna check all the variables set right now on your system? Use `/bin/env`.

## No more /bin/

Ok, I'll come clean. I've been making you do something the hard way for a while now. Nobody writes out `/bin/` before every single command. Can you *imagine* how tiring that would be?
Well, you don't have to, since I made you do it up until this point.

Nope, instead, the shell uses a variable called `$PATH` to do some lookup magic.

Let's read what's in `$PATH`.

```sh
/bin/echo $PATH
```

Interesting. It's a bunch of file paths, but with `:` splitting them up.

You might get some output that looks like this.
```
/usr/local/sbin:/bin:/usr/local/bin:/usr/bin:
```

`$PATH` is a special variable, and the shell listens to it. It's actually more like an automatic prefix for commands.

When you refer to a program in the shell, it checks *all* of the folders defined in `$PATH` to see if it has a program called whatever you looked for. So actually, we can just write...

```sh
ls

# instead of /bin/ls all the time!
```

And the shell will check `/usr/local/sbin/ls`. If there's an `ls` there, it will run it. If not, it will try the next one, `/bin/ls`.
We know that exists, and it'll run perfectly fine!

If it doesn't find the requested command anywhere in those folders, it'll error. Try it by running a command that definitely doesn't exist, like `scrimbly`.

```sh
scrimbly
# bash: scrimbly: command not found
```

## What commands actually exist?

Well, it depends on what's installed on your system, but we actually know enough about
the shell to figure this out ourselves!

Lets use `ls` to list the files in all those folders in `$PATH`!

```sh
ls /bin
```

should tell us a *buuunch* of files. That's already a hell of a lot of commands!

You can use `man COMMAND_NAME` to learn more about a command. You can also just google about it, as `man` info tends to be a little... obtuse.

Also, commands you run in the terminal aren't *just* limited to things that output text.

You can run something like `firefox` (or `safari`/`chrome`). That really will open an instance of your browser!

Remember, literally *all* programs can be ran by the shell!

!!! tip
	If you actually just launched a browser, you might notice that your terminal is in use.

	You can break out of this in a couple of ways.
	
	You can close the browser, and you'll get the prompt to type a command back.

	Alternatively, while in the terminal, you can hit `Ctrl-C`. This will *kill* the currently running process in the terminal, and should give you a prompt back.

	This is useful for a bunch of commands that don't exit on their own, like `top`.

## Flags

As one last thing, lets talk about flags. These aren't actually special to the shell in any way, but it's more of a convention.

Programs typically support something called flags, which allow you to change what the program does.

These come in two forms. Short form flags look like `-l`, and long form flags start with two hyphens, and typically have longer names, like `--list`

For example, we've used `ls` quite a bit to list files. But what if we wanted to list all of the files vertically, rather than horizontally?

```sh
# This will list all the things in `/` horizontally.
ls /

# This passes a flag called l to ls. This will result in the output being vertical.
ls -l /
```

OK, this is bizarre. How were you ever supposed to know that? Well, typical convention is that if a program is passed `-h` or `--help`, it'll give you help (`h` for help, right?), and list all the flags.

Let's just write `ls -h` to get some help aaand...

Uh. It didn't give us any help.

Here's another important takeaway. **Some programs don't follow conventions.**

No worries, let's use `ls --help`.

Oh boy, that sure is a lot of information. If you scroll up a bit, you should be able to see all the flags that `ls` can take. There's a *hell* of a lot, and I personally only know about three of them.

## That's the basics!

That wasn't too bad, but the shell is a slightly confusing beast at times. I mean, it's been around since the 70s. It's had a lot of time to accumulate dust and mess.

## Summary

- A filepath refers to a file on your PC.
- An absolute filepath starts with `/`, like `/home/users/robert/file.txt`.
- A relative path looks like `robert/file.txt`, and is relative to the folder you're currently working in.
- You can "go up a folder" with `..`, like `../joey/file.txt`. This will go up a folder, then get `joey/file.txt`, relative to where it is now.
- You can go up a folder as much as you want. `../../../../foo/bar.txt`.

And as for the shell...

- You can use `ls` to list files, and `cd` change what folder your terminal is in.
- You can use flags like `-s` and `--scrimble` after writing a command to modify what it does a bit.
- Everything wrote after the program is passed to the program, so `echo hello!` will result in `hello!` being passed to `echo`.
- You can run literally anything from the shell, like `firefox`.
- To kill the thing you're running and get back to the prompt, you can use `Ctrl-C`.
- You can set variables in the shell, and read them with `$VARIABLE_NAME`.

This is more than enough info to be able to use and navigate around comfortably in the terminal. There's still a lot more complexity to the shell, but for now, this is enough!