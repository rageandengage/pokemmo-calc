# PokeMMO Damage Calculator

A damage calculator for [PokeMMO](https://pokemmo.com/), forked from [smogon/damage-calc](https://github.com/smogon/damage-calc).

## What's Different

- Tuned for PokeMMO's mechanics (Gen 5-9 hybrid, no Fairy type, no gen 6+ species)
- 167 star skills (☆) with custom base power values from game data
- 53 custom PokeMMO event monsters
- PokeMMO-specific item renames (Punching Gloves, Covert Mantle, Pure Amulet, etc.)
- Various fixes for PokeMMO's mechanics, like Gem multiplier set to 1.5x
- Backported ability support (Reactive Gas, Protean, Defiant, Snow Plow, etc.)
- Chinese localization (Simplified & Traditional) pulled from PokeMMO's game files

## Building

Requires Node.js.

```sh
npm install
cd calc && npm install && cd ..
node build
```

The `dist/` folder is the output. It's a static site — serve it with any web server or open `dist/index.html` directly.

For development:

```sh
node build view   # skip calc/ recompile, faster if you only changed src/
```

## Deploying

`dist/` contains all the files needed. Tar it up and drop it on your web server:

```sh
cd dist && tar -czf ../output.tar.gz ./*
```

## i18n

Chinese translations are extracted from PokeMMO's XML string files at build time via `scripts/build-i18n.js`. The script looks for the game's data dump in several common locations, or you can set the `POKEMMO_DATA_DUMP` environment variable. The generated JSON files land in `src/js/data/i18n/`.

## Credits

Originally created by Honko and maintained by Austin at [smogon/damage-calc](https://github.com/smogon/damage-calc). PokeMMO adaptations by rageandengage.

## License

[MIT](LICENSE)
