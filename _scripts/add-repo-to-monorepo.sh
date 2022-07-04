#! /bin/bash

set -eo pipefail
set -x

BRANCH="${2:-develop}"
PROJECT="$1"

if [ -z "$PROJECT" ]; then
	echo "Please pass a tachi-X repo to meld with this repository."
	exit 1
fi

git remote add "$PROJECT" gh:/tng-dev/tachi-"$PROJECT"

git fetch "$PROJECT" --no-tags

git branch "$PROJECT-$BRANCH" "$PROJECT/$BRANCH"

git switch "$PROJECT-$BRANCH"

mkdir -p "$PROJECT"

git filter-repo --to-subdirectory-filter "$PROJECT/" --refs "$PROJECT-$BRANCH"

git switch master

git merge --allow-unrelated-histories "$PROJECT-$BRANCH"