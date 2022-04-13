#! /bin/bash

# This script is intended to be used as follows
# ./snap-single-file.sh path/to/test.TAP_SNAPSHOT
# This will result in that individual file being snapped.

# Of course, we need to do this like this because we are abusing
# single process tap to get our tests done faster.

# Put us in the directory this script is in.
cd "$(dirname "$0")" || exit 1

# So, TAP wont exit when ran on a single file because we never close it.
# This can be fixed another time, but until then I'm going to do this insane hack.
onsigint()
{
	node ./merge-snap.js "$1"
}

# When we recieve a sigint, trap it and call our sigint handler.
# of course, this is bash, so trap onsigint doesn't do what you want.
# instead, we do 'onsigint "$@"', which means call onsigint with arguments like $1.
trap 'onsigint "$@"' SIGINT

# Snapshot the argument.
TAP_SNAPSHOT=1 tap "$1"

