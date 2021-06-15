# Codebase Overview

This part of the documentation is for the [Tachi-Server](https://github.com/zkldi/tachi-server) codebase.

!!! info
	This is *ONLY* documentation for `tachi-server`.
	
	As mentioned below, `tachi-client` is closed source,
	and does not have public codebase documentation.

## Codebase Documentation vs. Code Documentation

This is documentation for the **Codebase**. **NOT** documentation for the code.

The distinction is because we aren't writing a library here - there's no need to document function
signatures or what function calls are meant to do. That can all be done inline because no other
projects depend on our function calls!

This documentation is more meta-level. Why things are in certain folders, what certain enums
correspond to, how `thing` works, etc.

## Repos and Licenses

Tachi is made up of three components:

- `tachi-common`: Common types and values for Tachi. [GitHub](https://github.com/zkldi/tachi-common). This is licensed under MIT.
- `tachi-server`: The API, IR implementations and 'business logic' behind Tachi. [GitHub](https://github.com/zkldi/tachi-server). This is licensed under AGPLv3.
- `tachi-client`: The front-end code for Tachi. This is closed source.

### What's with `tachi-client`?

The original plan was to have the entire codebase be open source. However, I've decided to make the
front-end code for Tachi be closed source. This is to reduce the amount of low-effort forks Tachi
may receive by virtue of being open source.

Other rhythm game projects as of recently have had a massive influx of low-effort forks that just
change the name of the project, rehost it, break the license, and don't upload any code back upstream.

It's disheartening, and the reason that the client is not publically available.

I picked the server code instead of the client code to open source because I think it's of significantly
more interest to other programmers in the scene.

### Why even bother with open source then?

I'm proud of the code, and I think other people will be interested in it.

Also, it's nice to give back to the community.

### What's with `tachi-common`?

Some things are common between the client and server.
It's pretty much just one very large types.ts file that needs to be split up.


