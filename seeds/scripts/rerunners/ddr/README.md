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

# Update stepCounts

1) Download csv files for Single and Double from https://docs.google.com/spreadsheets/d/10NT1VPYV8JHEpi68SBCTApOO5mWEjIAbJP3C5Csthyk/edit?gid=1455718580#gid=1455718580
2) Use any CSV to JSON converter to convert the files to JSON, keeping only the following columns : Title, Difficulty (converted to uppercase), Artist, Steps, O.K.s (Lines With Holds+Shock Arrows) (column 87). It should be an array with elements that looks like this :

```json
[
	{
		"Title": "Butterfly",
		"Difficulty": "BASIC",
		"Artist": "SMILE.dk",
		"Steps": 164,
		"O.K.s (Lines With Holds+Shock Arrows)": 0
	},
	...
]
```

3) Name your files `single.json` for singles and `double.json` for doubles. Add them to the same directory as the script.
4) Run `ts-node add-stepCounts.ts`
