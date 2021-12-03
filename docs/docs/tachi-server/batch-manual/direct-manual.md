# Direct Manual

Direct Manual is a way of POSTing BATCH-MANUAL content straight to the server.

In short, this lets you implement your own IRs, with absolutely no input
from me.

## Flow

You need to send a POST request to `/ir/direct-manual/import`, with the body
of the request being a batch manual document.

You can set the `X-User-Intent` Header to true if the import was done with
user-intent (i.e. they clicked a button to fire this request, rather than it
being automated in the background).

## That's it!

Seriously -- that's it.