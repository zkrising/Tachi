# Song Document

- Stored in `songs-${game}`

## Definition
```ts
interface SongDocument {
	id: integer;
	title: string;
	artist: string;
	searchTerms: string[];
	altTitles: string[];
	data: __GameSpecific;
}
```

!!! note
	The `data` field is GameSpecific. This means -- depending on
	the game, the data stored there is different. This is intended
	for handling game specific data, like genre fields.

| Property | Description |
| :: | :: |
| `id` | An integer ID corresponding to this songs songID. |
| `title` | A string which has this songs title. |
| `artist` | The person who wrote this song. |
| `searchTerms` | An array of strings that corresponds to other things users may search for when looking for this song. Useful for handing SDVXs insane usage of unicode. |
| `altTitles` | Alternative titles that may **actually** be used for this song. **THIS AFFECTS SCORE IMPORT TITLE LOOKUP!** This is intended for when multiple services have different ideas of what a song should be called. |
| `data` | An object containing data specific to the game this song is for, such as genre fields. |

## Game Specific Data

### IIDX
```ts
type IIDXSongData = { genre: string; displayVersion: string | null };
```

| Property | Description |
| :: | :: |
| `genre` | The genre for this song. |
| `displayVersion` | A string corresponding to what 'version' this song appears as from in IIDX. Such as "28" for bistrover, and "inf" for infinitas. Null if this is somehow not applicable. |

### MUSECA

```ts
type MUSECASongData = { titleJP: string; artistJP: string; displayVersion: string };
```

| Property | Description |
| :: | :: |
| `titleJP` | The title for this song in Japanese. |
| `artistJP` | The artist for this song in Japanese. |
| `displayVersion` | What version folder this song is included in. Used for UI stuff. |

### Maimai

```ts
type maimaiSongData = { titleJP: string; artistJP: string; displayVersion: string };
```

| Property | Description |
| :: | :: |
| `titleJP` | The title for this song when the game is in Japanese locale. |
| `artistJP` | The artist for this song when the game is in Japanese locale. |
| `displayVersion` | The version of the game that this song was released in. |

### Jubeat

```ts
type jubeatSongData = { displayVersion: string };
```

| Property | Description |
| :: | :: |
| `displayVersion` | The version of the game that this song was released in. |

### SDVX

```ts
type SDVXSongData = { displayVersion: string };
```

| Property | Description |
| :: | :: |
| `displayVersion` | The version of the game that this song was released in. |

### USC

Empty Object.

### BMS

```ts
type BMSSongData = { genre: string | null; subtitle: string | null; subartist: string | null };
```

| Property | Description |
| :: | :: |
| `genre` | This songs #GENRE. If one is not set, this is null. |
| `subtitle` | This songs #SUBTITLE. If one is not set, this is null. |
| `subartist` | This songs #SUBARTIST. If one is not set, this is null. |

### CHUNITHM

```ts
type CHUNITHMSongData = { genre: string; displayVersion: string };
```

| Property | Description |
| :: | :: |
| `genre` | The genre for this song in game. |
| `displayVersion` | What version of the game this song came out in. |

### GITADORA

```ts
type GITADORASongData = { isHot: boolean; displayVersion: string }
```

| Property | Description |
| :: | :: |
| `isHot` | Whether this song is marked as HOT by GITADORA or not. |
| `displayVersion` | What version folder this song is in in game. |

### WACCA

```ts
type WACCASongData = {
	titleJP: string;
	artistJP: string;
	genre: string;
	displayVersion: string | null
}
```

| Property | Description |
| :: | :: |
| `titleJP` | The japanese title for this song. |
| `artistJP` | The japanese artist for this song. |
| `genre` | The genre this song is under. |
| `displayVersion` | What version of the game this appeared in. Null if unknown. |

### Pop'n

```ts
type PopnSongData = { displayVersion: string | null; genre: string };
```

| Property | Description |
| :: | :: |
| `genre` | The genre this song is under. |
| `displayVersion` | What version of the game this appeared in. Null if unknown. |

### jubeat

```ts
type JubeatSongData = { displayVersion: string };
```

| Property | Description |
| :: | :: |
| `displayVersion` | What version of the game this appeared in. |

### PMS

```ts
type PMSSongData = {
	genre: string | null;
	subtitle: string | null;
	subartist: string | null
};
```

| Property | Description |
| :: | :: |
| `genre` | What genre this song is. Null if one is not set in the pms file. |
| `subtitle` | What the subtitle for this song is. Null if one is not set in the pms file. |
| `subartist` | What the subartist for this song is. Null if one is not set in the pms file. |
