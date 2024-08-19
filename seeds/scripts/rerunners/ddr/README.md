# Import DDR Gamedata

1) Generate gamedata under the following XML format :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mdb>
	<music>
		<mcode __type="u32">999</mcode>
		<basename>randomsong</basename>
		<title>This song doesn't exist</title>
		<title_yomi>thissongdoesntexist</title_yomi>
		<artist>Some Artist</artist>
		<bpmmax __type="u16">120</bpmmax>
		<series __type="u8">2</series>
		<bemaniflag __type="u32">1</bemaniflag>
		<limited_cha __type="u8">1</limited_cha>
		<diffLv __type="u8" __count="10">3 5 6 9 0 0 6 8 8 0</diffLv>
	</music>
	<music>
		...
	</music>
	...
</mdb>
```

File must be stored in the same folder as the script with the name `musicdb.xml`

2) At the last line of the script, eventually change the version if necessary. Current supported versions are `a3` and `konaste` (which are very similar since konaste is based on a3)
3) Run `ts-node parse-gameData-xml.ts`
