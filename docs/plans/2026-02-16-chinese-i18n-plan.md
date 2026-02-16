# Chinese i18n Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Simplified/Traditional Chinese to the PokeMMO damage calculator with a runtime language toggle.

**Architecture:** Build-time script extracts translations from PokeMMO game data dump XML files into JSON. A thin runtime i18n module translates display text on demand. The calc engine stays English internally — translation is display-only. Language toggle in the header switches all visible text without page reload.

**Tech Stack:** Node.js (build script, XML parsing), vanilla JS (runtime i18n module), jQuery (existing UI framework)

**Environment:** Run all npm/node commands via `toolbox run --container pokemmo-calc bash -c "..."`. Tests: `toolbox run --container pokemmo-calc bash -c "cd calc && npx jest 2>&1"` (baseline: 4 fail, 2 pass). Compile: `toolbox run --container pokemmo-calc bash -c "npm run compile 2>&1"`.

**Design doc:** `docs/plans/2026-02-16-chinese-i18n-design.md`

---

### Task 1: Build-time i18n extraction script

**Goal:** Parse PokeMMO XML string files and JSON game data to produce `zh.json` and `zh-Hant.json` translation maps.

**Files:**
- Create: `scripts/build-i18n.js`
- Create: `src/js/data/i18n/zh.json` (output, generated)
- Create: `src/js/data/i18n/zh-Hant.json` (output, generated)

**Data sources (read-only, do NOT modify):**
- `/var/home/user/Projects/IdeaProjects/claude-allowed-projects/pokemmo_data_dump/strings/dump_strings_zh.xml`
- `/var/home/user/Projects/IdeaProjects/claude-allowed-projects/pokemmo_data_dump/strings/dump_strings_zh-Hant.xml`
- `/var/home/user/Projects/IdeaProjects/claude-allowed-projects/pokemmo_data_dump/strings/dump_strings_en.xml`
- `/var/home/user/Projects/IdeaProjects/claude-allowed-projects/pokemmo_data_dump/resources/dump/info/monsters.json`
- `/var/home/user/Projects/IdeaProjects/claude-allowed-projects/pokemmo_data_dump/resources/dump/info/skills.json`
- `/var/home/user/Projects/IdeaProjects/claude-allowed-projects/pokemmo_data_dump/resources/dump/info/items.json`

**Step 1: Write the extraction script**

The script must:
1. Parse XML files to build `stringId → translatedText` maps for zh and zh-Hant
2. Parse `monsters.json` — for each monster, look up `name` in the English calc species data (`calc/src/data/species.ts` keys) and map it to the Chinese string from the XML using the monster's string ID. The JSON `monsters.json` doesn't have a `name_string_id` field directly, but the pattern is: monster ID maps to string ID `150000 + id` for the name. Verify this by checking that `dump_strings_en.xml` string `150001` = "Bulbasaur".
3. Parse `skills.json` — moves map to string ID `110000 + id` for the English name. Look up the same ID in the zh XML. If the zh XML has a different string at that ID, that's the Chinese name.
4. Parse `items.json` — items have a `name_string_id` field. Look up that ID in zh XML.
5. Abilities: IDs 210000-210164 in the XML. The calc's ability list (`calc/src/data/abilities.ts`) is an array of English names. Map each ability name to its ID by looking up in `dump_strings_en.xml`, then find the Chinese translation at the same ID in zh XML.
6. Types: IDs 230000-230017 in zh XML. Hardcode the mapping since there are only 17:
   ```
   Normal→230000, Fighting→230001, Flying→230002, Poison→230003, Ground→230004,
   Rock→230005, Bug→230006, Ghost→230007, Steel→230008, Fire→230010,
   Water→230011, Grass→230012, Electric→230013, Psychic→230014, Ice→230015,
   Dragon→230016, Dark→230017
   ```
   Note: 230009 is "???", there is no Fairy type in PokeMMO.
7. Natures: IDs 180000-180024 in zh XML. Format is "固执(Adamant)" — extract just the Chinese part before the parenthesis.
8. UI strings: Hardcode a manual mapping for ~40 calc-specific terms:
   ```javascript
   const UI_ZH = {
     "Attack": "攻击", "Defense": "防御", "Speed": "速度",
     "Sp. Atk": "特攻", "Sp. Def": "特防", "HP": "HP",
     "Level": "等级", "Nature": "性格", "Ability": "特性", "Item": "道具",
     "Status": "状态", "Forme": "形态", "Gender": "性别",
     "Weight (kg)": "体重 (kg)", "Current HP": "当前HP",
     "Base": "种族值", "IVs": "个体值", "EVs": "努力值",
     "Singles": "单打", "Doubles": "双打",
     "One vs One": "单挑", "One vs All": "一对全部", "All vs One": "全部对一",
     "Healthy": "健康", "Poisoned": "中毒", "Badly Poisoned": "剧毒",
     "Burned": "灼伤", "Paralyzed": "麻痹", "Asleep": "睡眠", "Frozen": "冰冻",
     "Physical": "物理", "Special": "特殊",
     "Crit": "要害", "Field": "场地",
     "Sun": "晴天", "Rain": "雨天", "Sand": "沙暴", "Hail": "冰雹",
     "Harsh Sunshine": "大晴天", "Heavy Rain": "大雨", "Strong Winds": "强风",
     "Reflect": "反射壁", "Light Screen": "光墙",
     "Stealth Rock": "隐形岩", "Spikes": "撒菱",
     "Protect": "守住", "Helping Hand": "帮助",
     "Tailwind": "顺风", "Gravity": "重力",
     "Aurora Veil": "极光幕", "Leech Seed": "寄生种子",
     "Loading...": "加载中...", "Copied": "已复制",
     "Type": "属性", "Male": "♂", "Female": "♀",
     "(none)": "(无)", "(other)": "(其他)",
     "PokeMMO Damage Calculator": "PokeMMO 伤害计算器",
     "Pokemon 1": "宝可梦 1", "Pokemon 2": "宝可梦 2",
   };
   ```
   For zh-Hant, use Traditional Chinese equivalents (many are the same, some differ).

**Output format:** Write JSON to `src/js/data/i18n/zh.json`:
```json
{
  "pokemon": { "Bulbasaur": "妙蛙种子", ... },
  "moves": { "Tackle": "撞击", ... },
  "items": { "Potion": "伤药", ... },
  "abilities": { "Overgrow": "茂盛", ... },
  "types": { "Normal": "一般", "Fire": "火", ... },
  "natures": { "Hardy": "勤奋", "Adamant": "固执", ... },
  "ui": { "Attack": "攻击", ... }
}
```

**Step 2: Run the script and verify output**

Run: `toolbox run --container pokemmo-calc bash -c "node scripts/build-i18n.js 2>&1"`

Verify:
- `zh.json` exists and has all sections (pokemon, moves, items, abilities, types, natures, ui)
- Spot-check: `jq '.pokemon.Bulbasaur' src/js/data/i18n/zh.json` → "妙蛙种子"
- Spot-check: `jq '.types.Fire' src/js/data/i18n/zh.json` → "火"
- Spot-check: `jq '.natures.Adamant' src/js/data/i18n/zh.json` → "固执"
- `zh-Hant.json` exists similarly

**Step 3: Commit**

```bash
git add scripts/build-i18n.js src/js/data/i18n/
git commit -m "Add build-time i18n extraction script for Chinese translations"
```

**Important notes for the implementer:**
- The XML parsing can use Node's built-in modules or a simple regex approach (the XML format is very regular: `<string id="NUMBER">TEXT</string>`)
- String IDs for monsters: verify the pattern by checking `dump_strings_en.xml` ID 150001 = "Bulbasaur", 150004 = "Charmander", etc. If the pattern doesn't hold, fall back to building a reverse English→ID map from `dump_strings_en.xml`, then looking up those IDs in `dump_strings_zh.xml`
- Nature strings in zh XML have format "固执(Adamant)" — split on "(" and take the first part, trimmed
- Some Chinese strings may have zero-width spaces or other Unicode artifacts (the Dragon type had `​​龙` with zero-width spaces) — trim these
- The English strings file may also have been overwritten with Chinese (the user updated the dump). If `dump_strings_en.xml` doesn't have English strings, use the English names from the calc data directly and build the mapping via string IDs from the JSON game data files

---

### Task 2: Runtime i18n module

**Goal:** Create a thin JS module that loads translation JSON and exposes `I18N.t(category, key)` for runtime translation.

**Files:**
- Create: `src/js/i18n.js`
- Modify: `src/index.template.html` (add script tag)

**Step 1: Write `src/js/i18n.js`**

```javascript
var I18N = (function() {
  var currentLang = localStorage.getItem('pokemmo-calc-lang') || 'en';
  var data = {};
  var listeners = [];

  function t(category, key) {
    if (currentLang === 'en' || !data[category]) return key;
    return data[category][key] || key;
  }

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('pokemmo-calc-lang', lang);
    if (lang === 'en') {
      data = {};
      notifyListeners();
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', './i18n/' + lang + '.json', true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          data = JSON.parse(xhr.responseText);
          notifyListeners();
        }
      };
      xhr.send();
    }
  }

  function onLanguageChange(fn) {
    listeners.push(fn);
  }

  function notifyListeners() {
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]();
    }
  }

  function getCurrentLang() {
    return currentLang;
  }

  // Load saved language on startup
  if (currentLang !== 'en') {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './i18n/' + currentLang + '.json', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        data = JSON.parse(xhr.responseText);
        // Listeners will be registered by the time this async load completes
        notifyListeners();
      }
    };
    xhr.send();
  }

  return {
    t: t,
    setLanguage: setLanguage,
    onLanguageChange: onLanguageChange,
    getCurrentLang: getCurrentLang
  };
})();
```

**Step 2: Add script tag to HTML template**

In `src/index.template.html`, add BEFORE the `shared_controls.js` script tag (around line 1608):
```html
<script type="text/javascript" src="./js/i18n.js?"></script>
```

Also add to `src/honkalculate.template.html` in the equivalent location.

**Step 3: Verify compile works**

Run: `toolbox run --container pokemmo-calc bash -c "npm run compile 2>&1"`

Check: `dist/js/i18n.js` exists.

**Step 4: Commit**

```bash
git add src/js/i18n.js src/index.template.html src/honkalculate.template.html
git commit -m "Add runtime i18n module with lazy JSON loading"
```

---

### Task 3: Language toggle UI

**Goal:** Add a language switcher dropdown in the header bar.

**Files:**
- Modify: `src/index.template.html` (add toggle markup)
- Modify: `src/css/main.css` (style the toggle)
- Modify: `src/js/shared_controls.js` (wire up toggle behavior)

**Step 1: Add toggle markup**

In `src/index.template.html`, after the `<span class="title-text main-title-text">` line (~line 57), add:
```html
<select id="lang-selector" class="lang-selector" title="Language">
    <option value="en">EN</option>
    <option value="zh">简中</option>
    <option value="zh-Hant">繁中</option>
</select>
```

**Step 2: Wire up the toggle in `shared_controls.js`**

Add near the `$(document).ready` block:
```javascript
// Language selector
$('#lang-selector').val(I18N.getCurrentLang());
$('#lang-selector').change(function() {
  I18N.setLanguage($(this).val());
});
```

**Step 3: Add minimal CSS**

In `src/css/main.css`, add:
```css
.lang-selector {
  float: right;
  margin: 5px 10px;
  font-size: 14px;
}
```

**Step 4: Verify compile, check visually**

Compile and verify the toggle appears in the header. No translation wiring yet — just the UI control.

**Step 5: Commit**

```bash
git add src/index.template.html src/css/main.css src/js/shared_controls.js
git commit -m "Add language toggle UI (EN / 简中 / 繁中)"
```

---

### Task 4: Translate HTML static labels

**Goal:** Add `data-i18n` attributes to all static labels in the HTML template, and write the refresh function that translates them.

**Files:**
- Modify: `src/index.template.html` (add data-i18n attributes)
- Modify: `src/js/shared_controls.js` (add label refresh function)

**Step 1: Add `data-i18n` attributes to static text in `src/index.template.html`**

For every translatable label/text, add a `data-i18n` attribute. The attribute value is the UI key. Examples:

```html
<!-- Before -->
<label>Type</label>
<!-- After -->
<label data-i18n="Type">Type</label>

<!-- Before -->
<th scope="col">Base</th>
<!-- After -->
<th scope="col" data-i18n="Base">Base</th>
```

Apply to ALL of these elements (both Pokemon 1 and Pokemon 2 panels — they're duplicated):
- Title: "PokeMMO Damage Calculator" → `data-i18n="PokeMMO Damage Calculator"`
- Legends: "Pokemon 1", "Pokemon 2" → `data-i18n="Pokemon 1"` etc.
- Labels: "Type", "Level", "Weight (kg)", "Nature", "Ability", "Item", "Status", "Forme", "Gender", "Current HP"
- Table headers: "Base", "IVs", "EVs"
- Stat labels: "HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"
- Button/radio labels: "One vs One", "One vs All", "All vs One", "Singles", "Doubles", "Crit"
- Field labels: "Sun", "Rain", "Sand", "Hail"
- Status options: Don't add data-i18n to `<option>` tags — those are handled separately by the dropdown translation code
- Nature options in the hardcoded `<select>`: same — handled separately
- Move category options: "Physical", "Special"

Also add to weather/field labels, screen labels (Reflect, Light Screen, etc.), and any other static text.

**Step 2: Write the label refresh function in `shared_controls.js`**

```javascript
function refreshI18nLabels() {
  $('[data-i18n]').each(function() {
    var key = $(this).attr('data-i18n');
    $(this).text(I18N.t('ui', key));
  });
}

I18N.onLanguageChange(refreshI18nLabels);
```

**Step 3: Compile and test**

Switch language, verify labels change. Switch back to EN, verify they revert.

**Step 4: Commit**

```bash
git add src/index.template.html src/js/shared_controls.js
git commit -m "Add data-i18n attributes and label refresh for Chinese translation"
```

---

### Task 5: Translate dropdown options (types, natures, statuses, moves, items, abilities)

**Goal:** When language switches, update the display text of all `<option>` elements in dropdowns while preserving English `value` attributes.

**Files:**
- Modify: `src/js/shared_controls.js`

**Step 1: Modify `getSelectOptions()` to use i18n**

Current code (line ~1237):
```javascript
function getSelectOptions(arr, sort, defaultOption) {
  if (sort) { arr.sort(); }
  var r = '';
  for (var i = 0; i < arr.length; i++) {
    r += '<option value="' + arr[i] + '" ' + (defaultOption === i ? 'selected' : '') + '>' + arr[i] + '</option>';
  }
  return r;
}
```

The display text `arr[i]` needs to pass through `I18N.t()`. But we need to know which category (types, moves, items, abilities). Add a `category` parameter:

```javascript
function getSelectOptions(arr, sort, defaultOption, i18nCategory) {
  if (sort) { arr.sort(); }
  var r = '';
  for (var i = 0; i < arr.length; i++) {
    var display = i18nCategory ? I18N.t(i18nCategory, arr[i]) : arr[i];
    r += '<option value="' + arr[i] + '" ' + (defaultOption === i ? 'selected' : '') + '>' + display + '</option>';
  }
  return r;
}
```

Update all callers:
- Types (line ~1129): `getSelectOptions(Object.keys(typeChart), false, undefined, 'types')`
- Moves (line ~1133): `getSelectOptions(Object.keys(moves), true, undefined, 'moves')`
- Abilities (line ~1135): `getSelectOptions(abilities, true, undefined, 'abilities')`
- Items (line ~1137): `getSelectOptions(items, true, undefined, 'items')`

**Step 2: Translate nature dropdown**

Natures are hardcoded in HTML `<option>` tags. Write a function that updates their display text:

```javascript
function refreshNatureOptions() {
  $('select.nature option').each(function() {
    var englishName = $(this).val();
    if (!englishName) return;
    var translated = I18N.t('natures', englishName);
    // Preserve the +Stat/-Stat notation
    var originalText = $(this).text();
    var boostMatch = originalText.match(/\(.*\)/);
    $(this).text(translated + (boostMatch ? ' ' + boostMatch[0] : ''));
  });
}
```

**Step 3: Translate status dropdown**

```javascript
function refreshStatusOptions() {
  $('select.status option').each(function() {
    var val = $(this).val();
    $(this).text(I18N.t('ui', val));
  });
}
```

**Step 4: Translate move category options**

```javascript
function refreshMoveCatOptions() {
  $('select.move-cat option').each(function() {
    var val = $(this).val();
    $(this).text(I18N.t('ui', val));
  });
}
```

**Step 5: Write the master dropdown refresh and register it**

```javascript
function refreshI18nDropdowns() {
  // Rebuild type/move/ability/item dropdowns with translated text
  var typeOptions = getSelectOptions(Object.keys(typeChart), false, undefined, 'types');
  // Save current selections before rebuilding
  $("select.type1, select.move-type").each(function() {
    var current = $(this).val();
    $(this).find("option").remove().end().append(typeOptions).val(current);
  });
  $("select.type2").each(function() {
    var current = $(this).val();
    $(this).find("option").remove().end()
      .append('<option value="">' + I18N.t('ui', '(none)') + '</option>' + typeOptions)
      .val(current);
  });

  var moveOptions = getSelectOptions(Object.keys(moves), true, undefined, 'moves');
  $("select.move-selector").each(function() {
    var current = $(this).val();
    $(this).find("option").remove().end().append(moveOptions).val(current);
  });

  var abilityOptions = getSelectOptions(abilities, true, undefined, 'abilities');
  $("select.ability").each(function() {
    var current = $(this).val();
    $(this).find("option").remove().end()
      .append('<option value="">' + I18N.t('ui', '(other)') + '</option>' + abilityOptions)
      .val(current);
  });

  var itemOptions = getSelectOptions(items, true, undefined, 'items');
  $("select.item").each(function() {
    var current = $(this).val();
    $(this).find("option").remove().end()
      .append('<option value="">' + I18N.t('ui', '(none)') + '</option>' + itemOptions)
      .val(current);
  });

  refreshNatureOptions();
  refreshStatusOptions();
  refreshMoveCatOptions();
}

I18N.onLanguageChange(refreshI18nDropdowns);
```

**Step 6: Update select2 search to match both English and Chinese**

In the `loadDefaultLists()` function, the `query` callback searches by `pokeName.toUpperCase()`. Add Chinese name matching:

```javascript
// In the query function for set-selector (~line 1361):
var pokeNameZh = I18N.t('pokemon', option.pokemon).toUpperCase();
// Add to the search condition:
|| pokeNameZh.indexOf(term) >= 0
```

Similarly for the move-selector matcher (~line 1438):
```javascript
matcher: function (term, text) {
  var val = $(this).val ? $(this).val() : text;
  var zhText = I18N.t('moves', text).toUpperCase();
  return text.toUpperCase().indexOf(term.toUpperCase()) === 0
    || text.toUpperCase().indexOf(" " + term.toUpperCase()) >= 0
    || zhText.indexOf(term.toUpperCase()) >= 0;
}
```

**Step 7: Compile and test**

Switch to Chinese, verify all dropdowns show Chinese names. Type English or Chinese in search — both should match. Switch back to EN, verify everything reverts.

**Step 8: Commit**

```bash
git add src/js/shared_controls.js
git commit -m "Translate dropdowns (types, moves, items, abilities, natures, statuses)"
```

---

### Task 6: Translate Pokemon set selector display

**Goal:** The set selector (select2) shows Pokemon names in its display. Translate the display while keeping English values for the calc engine.

**Files:**
- Modify: `src/js/shared_controls.js`

**Step 1: Update `formatResult` in `loadDefaultLists()`**

In `loadDefaultLists()` (~line 1347), the `formatResult` callback returns the Pokemon/set name. Wrap Pokemon names with `I18N.t()`:

```javascript
formatResult: function (object) {
  if ($("#randoms").prop("checked")) {
    return I18N.t('pokemon', object.pokemon);
  } else {
    return object.set
      ? ("&nbsp;&nbsp;&nbsp;" + object.set)
      : ("<b>" + I18N.t('pokemon', object.text) + "</b>");
  }
},
```

Also update `loadCustomList()` (~line 1395) similarly.

**Step 2: On language change, reinitialize select2**

```javascript
I18N.onLanguageChange(function() {
  loadDefaultLists();
  $(".set-selector").val(getFirstValidSetOption().id);
  $(".set-selector").change();
});
```

**Step 3: Commit**

```bash
git add src/js/shared_controls.js
git commit -m "Translate Pokemon set selector display names"
```

---

### Task 7: Translate damage result text

**Goal:** Post-process the English damage description string to replace Pokemon/move/item/ability names and stat abbreviations with Chinese equivalents.

**Files:**
- Modify: `src/js/shared_controls.js`

**Step 1: Write the result translation function**

Find where the result text is set. Search for `#mainResult` in `shared_controls.js` and any `index_controls.js` or similar. The result text comes from `result.desc()` or `result.fullDesc()` and is inserted into the DOM.

The post-processing function:

```javascript
function translateResultText(text) {
  if (I18N.getCurrentLang() === 'en') return text;

  // Replace Pokemon names (longest first to avoid partial matches)
  var pokeNames = Object.keys(pokedex).sort(function(a, b) { return b.length - a.length; });
  for (var i = 0; i < pokeNames.length; i++) {
    var zh = I18N.t('pokemon', pokeNames[i]);
    if (zh !== pokeNames[i]) {
      text = text.split(pokeNames[i]).join(zh);
    }
  }

  // Replace move names
  var moveNames = Object.keys(moves).sort(function(a, b) { return b.length - a.length; });
  for (var i = 0; i < moveNames.length; i++) {
    var zh = I18N.t('moves', moveNames[i]);
    if (zh !== moveNames[i]) {
      text = text.split(moveNames[i]).join(zh);
    }
  }

  // Replace item names
  var itemNames = Object.keys(calc.ITEMS[gen] || {}).sort(function(a, b) { return b.length - a.length; });
  for (var i = 0; i < itemNames.length; i++) {
    var zh = I18N.t('items', itemNames[i]);
    if (zh !== itemNames[i]) {
      text = text.split(itemNames[i]).join(zh);
    }
  }

  // Replace ability names
  var abilityNames = (calc.ABILITIES[gen] || []).slice().sort(function(a, b) { return b.length - a.length; });
  for (var i = 0; i < abilityNames.length; i++) {
    var zh = I18N.t('abilities', abilityNames[i]);
    if (zh !== abilityNames[i]) {
      text = text.split(abilityNames[i]).join(zh);
    }
  }

  // Replace stat abbreviations
  text = text.replace(/\bAtk\b/g, I18N.t('ui', 'Attack'));
  text = text.replace(/\bDef\b/g, I18N.t('ui', 'Defense'));
  text = text.replace(/\bSpA\b/g, I18N.t('ui', 'Sp. Atk'));
  text = text.replace(/\bSpD\b/g, I18N.t('ui', 'Sp. Def'));
  text = text.replace(/\bSpe\b/g, I18N.t('ui', 'Speed'));
  text = text.replace(/\bvs\.\b/g, 'vs.');

  return text;
}
```

**Step 2: Hook into result display**

Find all places that set `#mainResult` text and wrap with `translateResultText()`. This is likely in `shared_controls.js` or a separate calc trigger handler. Search for `mainResult` and `damageValues` assignments.

**Step 3: On language change, re-run the current calculation**

```javascript
I18N.onLanguageChange(function() {
  // Trigger recalculation which will re-render results
  $(".calc-trigger").first().change();
});
```

**Step 4: Compile and test**

Run a damage calculation. Switch to Chinese. Verify Pokemon names, move names, stat labels etc. in the result text are translated. Switch back to EN, verify English.

**Step 5: Commit**

```bash
git add src/js/shared_controls.js
git commit -m "Post-process damage result text for Chinese translation"
```

---

### Task 8: Integrate i18n into build pipeline

**Goal:** Make `npm run compile` automatically generate i18n JSON files and copy them to dist.

**Files:**
- Modify: `build` (the Node.js build script at project root)

**Step 1: Add i18n generation to the build script**

In the `build` file, before the `cpdir('src', 'dist')` call (line ~68), add:
```javascript
// Generate i18n files
require('child_process').execSync('node scripts/build-i18n.js', { stdio: 'inherit' });
```

Also add a `cpdir` or `mkdir` + copy for the i18n directory:
```javascript
// After cpdir('src', 'dist'):
cpdir('src/js/data/i18n', 'dist/i18n');
```

**Step 2: Verify full build**

Run: `toolbox run --container pokemmo-calc bash -c "npm run compile 2>&1"`

Check: `dist/i18n/zh.json` and `dist/i18n/zh-Hant.json` exist.

**Step 3: Commit**

```bash
git add build
git commit -m "Integrate i18n JSON generation into build pipeline"
```

---

### Task 9: End-to-end testing and polish

**Goal:** Verify everything works together, fix edge cases.

**Files:** Various (whatever needs fixing)

**Step 1: Run calc tests**

Run: `toolbox run --container pokemmo-calc bash -c "cd calc && npx jest 2>&1"`

Expected: Same baseline (4 fail, 2 pass). The i18n changes are display-only and should not affect calc tests.

**Step 2: Full compile and manual test**

Run: `toolbox run --container pokemmo-calc bash -c "npm run compile 2>&1"`

Start server and test:
1. Page loads in English by default
2. Language toggle appears and works
3. Switch to 简中:
   - All labels change to Chinese
   - Pokemon dropdown shows Chinese names (妙蛙种子, etc.)
   - Searching "妙蛙" in the Pokemon dropdown finds Bulbasaur
   - Searching "Bulbasaur" still works
   - Move dropdown shows Chinese names
   - Type selectors show Chinese
   - Nature dropdown shows Chinese
   - Status dropdown shows Chinese
   - Damage result text shows Chinese names
   - Field labels (Sun, Rain, etc.) show Chinese
4. Switch to 繁中: Same as above with Traditional characters
5. Switch back to EN: Everything reverts
6. Refresh page: Language preference persisted via localStorage
7. Select a custom PokeMMO monster (Pumpking-Phase1): Name stays English (no Chinese translation available) — this is expected fallback behavior

**Step 3: Fix any issues found**

**Step 4: Final commit**

```bash
git add -A
git commit -m "Polish i18n integration and fix edge cases"
```
