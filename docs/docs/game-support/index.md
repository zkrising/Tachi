# Game Support

Tachi is a *modular* score tracker. What that means is that you can define your own
support for games in Tachi, and as long as the module is loaded, that support will
be enabled on this Tachi instance.

## What games are supported?

In the Tachi repo, the following games have modules:

- [beatmania IIDX](./games/iidx.md)
- [MUSECA](./games/museca.md)
- [SDVX](./games/sdvx.md)
- [BMS](./games/bms.md)
- [CHUNITHM](./games/chunithm.md)
- [USC](./games/usc.md)
- [WACCA](./games/wacca.md)
- [pop'n music](./games/popn.md)
- [jubeat](./games/jubeat.md)
- [PMS](./games/pms.md)
- [GITADORA](./games/gitadora.md)
- [maimai DX](./games/maimaidx.md)
- [ITG](./games/itg.md)

For more information on what each module has (such as score metrics, chart specific data, etc.), click on the game.

## How do I write support for a game?

Adding support for a game requires configuration in three places and a loading of `database-seeds`.

You will need:

- [A configuration in `common/`](./config/common.md)
- [A configuration in `server/`](./config/server.md)
- [A configuration in `client/`](./config/client.md)
- [Some database seeds for songs and charts](./config/seeds.md)

For more information on how to write each module and what they contain, click on the specific item.