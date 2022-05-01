#!/bin/bash

# Output stderr and stdout to the terminal, but only save stderr to a file
# Isn't bash wonderful?

# I can't figure out how to make it write to failed-tests.log instead of appending
# so, whatever.
# look. I don't like bash much.
# I'd rather spend 0% of my time here.
rm failed-tests.log -f

ts-node test/collections.test.ts 2> >(tee -a failed-tests.log >&2)
ts-node test/id.test.ts 2> >(tee -a failed-tests.log >&2)
ts-node test/folder-id.test.ts 2> >(tee -a failed-tests.log >&2)