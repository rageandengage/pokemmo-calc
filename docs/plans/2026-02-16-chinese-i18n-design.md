# Chinese i18n for PokeMMO Damage Calculator

## Goal

Add Simplified Chinese (zh) and Traditional Chinese (zh-Hant) to the damage calculator with a runtime language toggle. All text — UI chrome, Pokemon names, move names, ability names, item names, type names, nature names — is translated. The calc engine stays English internally; translation is display-only.

## Data Source

PokeMMO's own string dump files at `pokemmo_data_dump/strings/`:
- `dump_strings_zh.xml` — Simplified Chinese
- `dump_strings_zh-Hant.xml` — Traditional Chinese
- `dump_strings_en.xml` — English (for building reverse mappings)

String ID ranges in the XML files:
- **Pokemon names**: Referenced via `name_string_id` in `monsters.json` (150XXX range)
- **Move names**: Referenced via string IDs in `skills.json` (110XXX range for English, custom moves in 111XXX)
- **Item names**: Referenced via `name_string_id` in `items.json` (240XXX range)
- **Ability names**: 210XXX range
- **Type names**: 230000-230017
- **Nature names**: 180000-180024 (format: "固执(Adamant)" — Chinese with English in parens)
- **Stat names**: IDs 501-505 (攻击, 防御, 速度, 特攻, 特防)
- **Battle terms**: IDs 100-108 (单打对战, 双打对战), ID 1711/1779 (等级)

## Architecture

### Build-time: `scripts/build-i18n.js`

Node script that parses the XML dump files and JSON game data to produce translation JSON files.

**Input:** XML string files + JSON game data (monsters.json, skills.json, items.json)

**Output:** `src/js/data/i18n/zh.json`, `src/js/data/i18n/zh-Hant.json`

```json
{
  "pokemon": { "Bulbasaur": "妙蛙种子", "Charmander": "小火龙", ... },
  "moves": { "Tackle": "撞击", "Earthquake": "地震", ... },
  "items": { "Potion": "伤药", "Leftovers": "吃剩的东西", ... },
  "abilities": { "Overgrow": "茂盛", "Blaze": "猛火", ... },
  "types": { "Normal": "一般", "Fire": "火", "Water": "水", ... },
  "natures": { "Hardy": "勤奋", "Adamant": "固执", "Timid": "胆小", ... },
  "ui": {
    "Attack": "攻击",
    "Defense": "防御",
    "Speed": "速度",
    "Sp. Atk": "特攻",
    "Sp. Def": "特防",
    "HP": "HP",
    "Level": "等级",
    "Nature": "性格",
    "Ability": "特性",
    "Item": "道具",
    "Singles": "单打",
    "Doubles": "双打",
    "IVs": "个体值",
    "EVs": "努力值",
    "Base": "种族值",
    "Healthy": "健康",
    "Poisoned": "中毒",
    "Badly Poisoned": "剧毒",
    "Burned": "灼伤",
    "Paralyzed": "麻痹",
    "Asleep": "睡眠",
    "Frozen": "冰冻",
    "Gender": "性别",
    "Weight (kg)": "体重 (kg)",
    "Crit": "要害",
    "Field": "场地",
    "Sun": "晴天",
    "Rain": "雨天",
    "Sand": "沙暴",
    "Hail": "冰雹",
    "Reflect": "反射壁",
    "Light Screen": "光墙",
    "Stealth Rock": "隐形岩",
    "Spikes": "撒菱",
    "Protect": "守住",
    "Helping Hand": "帮助",
    "Tailwind": "顺风",
    "Gravity": "重力"
  }
}
```

The `ui` section is partially extracted from the dump (stats, battle terms) and partially uses standard community translations for calc-specific terms (个体值, 努力值, 种族值). These are hardcoded in the build script since there are only ~40 strings.

### Runtime: `src/js/i18n.js`

Thin translation module loaded before `shared_controls.js`.

```javascript
var I18N = {
  currentLang: localStorage.getItem('pokemmo-calc-lang') || 'en',
  data: {},  // populated when zh.json or zh-Hant.json is loaded

  t: function(category, key) {
    if (this.currentLang === 'en' || !this.data[category]) return key;
    return this.data[category][key] || key;
  },

  setLanguage: function(lang) {
    this.currentLang = lang;
    localStorage.setItem('pokemmo-calc-lang', lang);
    if (lang === 'en') {
      this.data = {};
      this.refresh();
    } else {
      // Load JSON, then refresh
      fetch('./i18n/' + lang + '.json')
        .then(r => r.json())
        .then(data => { this.data = data; this.refresh(); });
    }
  },

  refresh: function() {
    // Re-render all translated elements
    refreshDropdowns();
    refreshLabels();
    refreshResults();
  }
};
```

### Display layer changes

**1. HTML template labels** — Add `data-i18n="ui.Attack"` attributes to static labels. On language switch, `querySelectorAll('[data-i18n]')` and replace `textContent` with `I18N.t('ui', key)`.

**2. Dropdowns** (Pokemon, moves, items, abilities, natures) — `<option value="Bulbasaur">` keeps English value (for calc engine). Display text becomes `I18N.t('pokemon', 'Bulbasaur')`. Select2 custom matcher searches both English and translated text so users can type in either language.

**3. Type selectors** — Display `I18N.t('types', typeName)`, value stays English.

**4. Damage result post-processing** — After the calc engine produces English description text, run a replacement pass:
- Pokemon names → `I18N.t('pokemon', name)`
- Move names → `I18N.t('moves', name)`
- Item names → `I18N.t('items', name)`
- Ability names → `I18N.t('abilities', name)`
- Stat abbreviations (Atk, Def, etc.) → Chinese equivalents
- "vs." → Chinese equivalent

### Language toggle UI

Small dropdown in the header bar: `EN | 简中 | 繁中`. Stores preference in localStorage. Defaults to English.

## What stays English

- Internal calc engine (all computations use English keys)
- `<option value="">` attributes (English keys for data lookup)
- Console/debug output
- Source code comments

## Custom PokeMMO monsters

The 53 custom monsters (Pumpking, Elfbots, etc.) won't have entries in the standard dump string files. Two options:
1. The build script outputs them as-is (English fallback)
2. If the Chinese dump has translations for custom monster string IDs, those are used

The `I18N.t()` fallback-to-key behavior handles this gracefully — untranslated names show in English.

## Build integration

`npm run compile` should run `scripts/build-i18n.js` first (or as part of the compile step), outputting JSON files to `dist/i18n/`. The JSON files are loaded lazily on language switch — no impact on initial page load for English users.
