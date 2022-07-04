The .patch file in this directory hijacks a waterfall install to also write a `zkldi.json`
file when caching charts. This is the easiest way to parse SM files in 100% certainty that
they're treated the way the game treats them, oddities and all.

It then just leverages simply love helper functions to format up interesting song data
and stuff.
all good!