#!/bin/bash

cd "$(dirname "$0")" || exit 1

# Output stderr and stdout to the terminal, but only save stderr to a file
# Isn't bash wonderful?

ts-node test/collections.test.ts 2> >(tee failed-tests.log >&2)
ts-node test/id.test.ts 2> >(tee -a failed-tests.log >&2)
ts-node test/folder-id.test.ts 2> >(tee -a failed-tests.log >&2)
