# Search Implementation

Tachi's search implementation uses MongoDB's $text index. This breaks a query into words
and compares each of them to the provided text fields.

*****

## __textScore

For our code, we mutate the documents we want to return with a special field: `__textScore`.

This field declares how 'close' the provided query was to the $text fields in this document.

This is sometimes exposed in the API for sorting reasons.

!!! bug
	MongoDB's $text matching algorithm isn't great for fuzzy matches - It doesn't
	like song titles like 'A', as it thinks 'a' is an article, and doesn't match it properly as
	a word.

!!! info
	Why not regex for fuzzy matches?
	
	Regex has performance issues on larger datasets and we
	want to avoid it. Most regexes cannot use indexes, and therefore invoke a COLLSCAN, which
	we want to avoid.