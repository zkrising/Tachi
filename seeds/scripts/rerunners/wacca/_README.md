# parse-wplus.js

### How to get the songlist

Get the songlist from the webui. Open your dev tools, look for a big .js with the song data inside of it.
Download it.
Then you can add this at the bottom of the .js :
```js
const fs = require('fs');
fs.writeFileSync('songlist.json', JSON.stringify(e));
```
Then run the .js with node.

Clearly not ideal, but it just works.

If the above addition doesn't work, you can try adding the following instead (without the triple quotes):
"""
import fs from 'fs';
fs.writeFileSync('songlist.json', JSON.stringify(a.concat(t)));
"""
where 'a' and 't' are the 2 consts in the original .js.