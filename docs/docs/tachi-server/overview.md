# Codebase Overview

This part of the documentation is for the [Tachi-Server](https://github.com/TNG-dev/Tachi/tree/staging/server) codebase.

## Codebase Documentation vs. Code Documentation

This is documentation for the **Codebase**. **NOT** documentation for the code.

The distinction is because we aren't writing a library here - there's no need to document function
signatures or what function calls are meant to do. That can all be done inline because no other
projects depend on our function calls!

This documentation is more meta-level. Why things are in certain folders, what certain enums
correspond to, how `thing` works, etc.

## Repos and Licenses

Tachi is made up of four components:

- `tachi-common`: Common types and values for Tachi. [GitHub](https://github.com/TNG-dev/Tachi/tree/staging/common). This is licensed under MIT.
- `tachi-server`: The API, IR implementations and 'business logic' behind Tachi. [GitHub](https://github.com/TNG-dev/Tachi/tree/staging/server). This is licensed under AGPLv3.
- `tachi-client`: The front-end code for Tachi. [GitHub](https://github.com/TNG-dev/Tachi/tree/staging/client). This is licensed under AGPLv3..
- `tachi-docs`: The documentation you're reading right now! [GitHub](https://github.com/TNG-dev/Tachi/tree/staging/docs). This is licensed under MIT.
