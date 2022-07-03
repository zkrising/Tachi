#! /bin/bash

set -eo pipefail

BRANCH="${2:-develop}"
PROJECT="$1"

if [ -z "$PROJECT" ]; then
	echo "Please pass a tachi-X repo to meld with this repository."
	exit 1
fi

git remote add "$PROJECT" gh:/tng-dev/tachi-"$PROJECT" || echo "remote already mounted. continuing anyway."

git fetch "$PROJECT" --no-tags

git branch "$PROJECT-$BRANCH" "$PROJECT/$BRANCH" || echo "branch already exists. continuing anyway."

git remote remove "$PROJECT"

git switch "$PROJECT-$BRANCH"

mkdir -p "$PROJECT"

git filter-repo --to-subdirectory-filter "$PROJECT/" --refs "$PROJECT-$BRANCH" --force

git switch master

git merge --allow-unrelated-histories "$PROJECT-$BRANCH"