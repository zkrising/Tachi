# Score Oddities

Writing a score tracker is easy. Dealing with 20 years of questionable score storage habits is not.

Here's a collection of weird things that have reared their head. If you've been
linked here, it's to warn you about this.

## LR2 Auto Scratch Easy Clear

Before ASSIST CLEAR was a dedicated clear type in IIDX, AutoScr would degrade
the score back down to an EASY CLEAR. This is fine normally, as the score would
also have a BP of -1 or NULL. You could easily tell when a score was AutoScr
and correct it.

However. If you then get **ANY SCORE** on the chart without Auto Scratch, your
BP will be set to a normal value, rather than -1 or NULL. This means that...

```
EASY CLEAR, BP -1
then...
FAILED, BP: 140
becomes
EASY CLEAR, BP: 140
```

And there's no longer any way to determine the score was auto scratched!

## Beatoraja + LR2 DP Random

Beatoraja and LR2 only store the left hand random. They completely ignore
the right hand one and never store or send it anywhere.

## ARC PB Only

ARC only exports the users best scores for an individual chart. This means
you can't access individual scores properly, and Tachi has to just assume that
they were valid individual scores. This means that...

```
If you get
EASY CLEAR, 88%
and then
HARD CLEAR, 30%

ARC will send
HARD CLEAR, 88%
and Tachi will have to assume that is a single score.
```
