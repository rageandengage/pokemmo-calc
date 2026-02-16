#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Paths to data sources (read-only).
// The pokemmo-calc directory may be accessed via a symlink, so __dirname can
// resolve to the real path rather than the symlink path.  We try several
// candidate locations for the data dump directory.
function findDataDump() {
  if (process.env.POKEMMO_DATA_DUMP) {
    return process.env.POKEMMO_DATA_DUMP;
  }
  const candidates = [
    // Sibling via symlink-aware PWD (e.g. claude-allowed-projects/pokemmo_data_dump)
    process.env.PWD && path.resolve(process.env.PWD, '../pokemmo_data_dump'),
    // Sibling via resolved __dirname
    path.resolve(__dirname, '../../pokemmo_data_dump'),
    // Sibling in claude-allowed-projects (from IdeaProjects/pokemmo-calc)
    path.resolve(__dirname, '../../claude-allowed-projects/pokemmo_data_dump'),
    // Sibling in claude-allowed-projects (from deeper nesting)
    path.resolve(__dirname, '../../../claude-allowed-projects/pokemmo_data_dump'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'strings'))) {
      return candidate;
    }
  }
  // Fallback to first candidate and let it fail with a clear error
  throw new Error(
    'Could not find pokemmo_data_dump directory. Tried:\n' +
    candidates.map(c => '  ' + c).join('\n') +
    '\nSet POKEMMO_DATA_DUMP env variable to override.'
  );
}

const DATA_DUMP = findDataDump();
const ZH_XML = path.join(DATA_DUMP, 'strings/dump_strings_zh.xml');
const ZH_HANT_XML = path.join(DATA_DUMP, 'strings/dump_strings_zh-Hant.xml');
const MONSTERS_JSON = path.join(DATA_DUMP, 'resources/dump/info/monsters.json');
const SKILLS_JSON = path.join(DATA_DUMP, 'resources/dump/info/skills.json');
const ITEMS_JSON = path.join(DATA_DUMP, 'resources/dump/info/items.json');

// Output paths
const OUTPUT_DIR = path.resolve(__dirname, '../src/js/data/i18n');
const ZH_OUTPUT = path.join(OUTPUT_DIR, 'zh.json');
const ZH_HANT_OUTPUT = path.join(OUTPUT_DIR, 'zh-Hant.json');

// Type name mapping (hardcoded IDs — no Fairy in PokeMMO)
const TYPE_IDS = {
  'Normal': 230000, 'Fighting': 230001, 'Flying': 230002, 'Poison': 230003,
  'Ground': 230004, 'Rock': 230005, 'Bug': 230006, 'Ghost': 230007,
  'Steel': 230008, 'Fire': 230010, 'Water': 230011, 'Grass': 230012,
  'Electric': 230013, 'Psychic': 230014, 'Ice': 230015, 'Dragon': 230016,
  'Dark': 230017,
};

// Nature names in order (IDs 180000-180024)
const NATURE_NAMES = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky',
];

// Hardcoded UI strings — Simplified Chinese
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
  "Stealth Rock": "隐形岩", "Spikes": "撒菱", "3 Spikes": "3 撒菱",
  "Protect": "守住", "Helping Hand": "帮助",
  "Tailwind": "顺风", "Gravity": "重力",
  "Aurora Veil": "极光幕", "Leech Seed": "寄生种子",
  "Loading...": "加载中...", "Copied": "已复制",
  "Type": "属性", "Male": "♂", "Female": "♀",
  "(none)": "(无)", "(other)": "(其他)",
  "PokeMMO Damage Calculator": "PokeMMO 伤害计算器",
  "Pokemon 1": "宝可梦 1", "Pokemon 2": "宝可梦 2",
  "Flower Gift": "花之礼物", "Power Trick": "力量戏法",
  "Friend Guard": "友情防守", "Power Spot": "能量点",
  "Battery": "蓄电池", "Switching Out": "交换中",
  "Foresight": "识破", "+1 All Stats": "+1 全能力",
  "Magic Room": "魔法空间", "Wonder Room": "奇妙空间",
  "Health": "生命值", "None": "无",
  "Total": "合计",
  "Snowscape": "雪景", "Snow": "雪",
  "Level 100": "等级 100", "Level 50": "等级 50", "Level 5": "等级 5",
  "Export": "导出", "Import / Export": "导入 / 导出",
  "Custom Set": "自定义配置",
  "Only show imported sets": "仅显示导入配置",
  "Clear Imported Sets": "清除导入配置",
  "Pokemon 1's Moves": "宝可梦 1 的招式",
  "Pokemon 2's Moves": "宝可梦 2 的招式",
  "(select one to show detailed results)": "(选择一个查看详细结果)",
  "Never": "从不", "4 times": "四次", "5 times": "五次",
  "hits": "次", "hit": "次",
  "Once": "一次", "Twice": "两次", "3 times": "三次",
  "Atk": "攻击", "Def": "防御", "SpA": "特攻", "SpD": "特防", "Spe": "速度",
  "Attack Blank Set": "攻击空白配置", "Blank Set": "空白配置",
  "possibly the worst move ever": "可能是最差的招式",
  "Possible damage amounts": "可能的伤害值",
  "nice move": "好招式",
  "Click for Dark Theme": "切换至深色主题", "Click for Light Theme": "切换至浅色主题",
  "(No Move)": "(无招式)",
  "Smogon analysis": "Smogon 分析",
  "'s Moves": " 的招式",
  "Import": "导入",
};

// Hardcoded UI strings — Traditional Chinese
const UI_ZH_HANT = {
  "Attack": "攻擊", "Defense": "防禦", "Speed": "速度",
  "Sp. Atk": "特攻", "Sp. Def": "特防", "HP": "HP",
  "Level": "等級", "Nature": "性格", "Ability": "特性", "Item": "道具",
  "Status": "狀態", "Forme": "形態", "Gender": "性別",
  "Weight (kg)": "體重 (kg)", "Current HP": "當前HP",
  "Base": "種族值", "IVs": "個體值", "EVs": "努力值",
  "Singles": "單打", "Doubles": "雙打",
  "One vs One": "單挑", "One vs All": "一對全部", "All vs One": "全部對一",
  "Healthy": "健康", "Poisoned": "中毒", "Badly Poisoned": "劇毒",
  "Burned": "灼傷", "Paralyzed": "麻痺", "Asleep": "睡眠", "Frozen": "冰凍",
  "Physical": "物理", "Special": "特殊",
  "Crit": "要害", "Field": "場地",
  "Sun": "晴天", "Rain": "雨天", "Sand": "沙暴", "Hail": "冰雹",
  "Harsh Sunshine": "大晴天", "Heavy Rain": "大雨", "Strong Winds": "強風",
  "Reflect": "反射壁", "Light Screen": "光牆",
  "Stealth Rock": "隱形岩", "Spikes": "撒菱", "3 Spikes": "3 撒菱",
  "Protect": "守住", "Helping Hand": "幫助",
  "Tailwind": "順風", "Gravity": "重力",
  "Aurora Veil": "極光幕", "Leech Seed": "寄生種子",
  "Loading...": "載入中...", "Copied": "已複製",
  "Type": "屬性", "Male": "♂", "Female": "♀",
  "(none)": "(無)", "(other)": "(其他)",
  "PokeMMO Damage Calculator": "PokeMMO 傷害計算器",
  "Pokemon 1": "寶可夢 1", "Pokemon 2": "寶可夢 2",
  "Flower Gift": "花之禮物", "Power Trick": "力量戲法",
  "Friend Guard": "友情防守", "Power Spot": "能量點",
  "Battery": "蓄電池", "Switching Out": "交換中",
  "Foresight": "識破", "+1 All Stats": "+1 全能力",
  "Magic Room": "魔法空間", "Wonder Room": "奇妙空間",
  "Health": "生命值", "None": "無",
  "Total": "合計",
  "Snowscape": "雪景", "Snow": "雪",
  "Level 100": "等級 100", "Level 50": "等級 50", "Level 5": "等級 5",
  "Export": "匯出", "Import / Export": "匯入 / 匯出",
  "Custom Set": "自訂配置",
  "Only show imported sets": "僅顯示匯入配置",
  "Clear Imported Sets": "清除匯入配置",
  "Pokemon 1's Moves": "寶可夢 1 的招式",
  "Pokemon 2's Moves": "寶可夢 2 的招式",
  "(select one to show detailed results)": "(選擇一個查看詳細結果)",
  "Never": "從不", "4 times": "四次", "5 times": "五次",
  "hits": "次", "hit": "次",
  "Once": "一次", "Twice": "兩次", "3 times": "三次",
  "Atk": "攻擊", "Def": "防禦", "SpA": "特攻", "SpD": "特防", "Spe": "速度",
  "Attack Blank Set": "攻擊空白配置", "Blank Set": "空白配置",
  "possibly the worst move ever": "可能是最差的招式",
  "Possible damage amounts": "可能的傷害值",
  "nice move": "好招式",
  "Click for Dark Theme": "切換至深色主題", "Click for Light Theme": "切換至淺色主題",
  "(No Move)": "(無招式)",
  "Smogon analysis": "Smogon 分析",
  "'s Moves": " 的招式",
  "Import": "匯入",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a PokeMMO XML string file into a Map of stringId -> text.
 * Uses regex since the format is simple and regular.
 */
function parseXml(filePath) {
  const xml = fs.readFileSync(filePath, 'utf8');
  const map = new Map();
  const re = /<string id="(\d+)">(.*?)<\/string>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const id = parseInt(m[1], 10);
    let text = m[2];
    // Decode XML entities
    text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    // Strip zero-width spaces (U+200B)
    text = text.replace(/\u200B/g, '');
    text = text.trim();
    if (text.length > 0) {
      map.set(id, text);
    }
  }
  return map;
}

/**
 * Extract the Chinese part from a nature string like "固执(Adamant)"
 * Returns just "固执".
 */
function extractNatureChinese(str) {
  if (!str) return '';
  const idx = str.indexOf('(');
  if (idx > 0) {
    return str.substring(0, idx).trim();
  }
  return str.trim();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Parsing XML string files...');
  const zhMap = parseXml(ZH_XML);
  const zhHantMap = parseXml(ZH_HANT_XML);
  console.log(`  zh.xml: ${zhMap.size} strings`);
  console.log(`  zh-Hant.xml: ${zhHantMap.size} strings`);

  // Load JSON data
  console.log('Loading JSON data...');
  const monsters = JSON.parse(fs.readFileSync(MONSTERS_JSON, 'utf8'));
  const skills = JSON.parse(fs.readFileSync(SKILLS_JSON, 'utf8'));
  const items = JSON.parse(fs.readFileSync(ITEMS_JSON, 'utf8'));
  console.log(`  monsters: ${monsters.length}, skills: ${skills.length}, items: ${items.length}`);

  // Build translation data for each locale
  const zhData = buildLocaleData(zhMap, monsters, skills, items, UI_ZH);
  const zhHantData = buildLocaleData(zhHantMap, monsters, skills, items, UI_ZH_HANT);

  // Write output
  fs.mkdirSync(OUTPUT_DIR, {recursive: true});

  fs.writeFileSync(ZH_OUTPUT, JSON.stringify(zhData, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${ZH_OUTPUT}`);

  fs.writeFileSync(ZH_HANT_OUTPUT, JSON.stringify(zhHantData, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${ZH_HANT_OUTPUT}`);

  // Summary
  for (const [label, data] of [['zh', zhData], ['zh-Hant', zhHantData]]) {
    console.log(`\n${label} summary:`);
    for (const key of Object.keys(data)) {
      console.log(`  ${key}: ${Object.keys(data[key]).length} entries`);
    }
  }
}

function buildLocaleData(stringMap, monsters, skills, items, uiStrings) {
  const pokemon = {};
  const moves = {};
  const itemMap = {};
  const abilities = {};
  const types = {};
  const natures = {};

  // Pokemon names: string ID = 150000 + monster.id
  for (const mon of monsters) {
    const stringId = 150000 + mon.id;
    const zhName = stringMap.get(stringId);
    if (zhName && zhName.length > 0) {
      pokemon[mon.name] = zhName;
    }
  }

  // Move names: string ID = 110000 + skill.id
  for (const skill of skills) {
    const stringId = 110000 + skill.id;
    const zhName = stringMap.get(stringId);
    if (zhName && zhName.length > 0) {
      moves[skill.name] = zhName;
    }
  }

  // Item names: string ID = item.name_string_id
  for (const item of items) {
    const stringId = item.name_string_id;
    const zhName = stringMap.get(stringId);
    if (zhName && zhName.length > 0) {
      itemMap[item.name] = zhName;
    }
  }

  // Abilities: collect unique {id, name} from all monsters
  const abilitySet = new Map(); // id -> name
  for (const mon of monsters) {
    if (mon.abilities) {
      for (const ab of mon.abilities) {
        if (!abilitySet.has(ab.id)) {
          abilitySet.set(ab.id, ab.name);
        }
      }
    }
  }
  for (const [abId, abName] of abilitySet) {
    const stringId = 210000 + abId;
    const zhName = stringMap.get(stringId);
    if (zhName && zhName.length > 0) {
      abilities[abName] = zhName;
    }
  }

  // Types (hardcoded IDs)
  for (const [typeName, stringId] of Object.entries(TYPE_IDS)) {
    const zhName = stringMap.get(stringId);
    if (zhName && zhName.length > 0) {
      types[typeName] = zhName;
    }
  }

  // Natures (IDs 180000-180024)
  for (let i = 0; i < NATURE_NAMES.length; i++) {
    const stringId = 180000 + i;
    const raw = stringMap.get(stringId);
    if (raw) {
      const zhName = extractNatureChinese(raw);
      if (zhName.length > 0) {
        natures[NATURE_NAMES[i]] = zhName;
      }
    }
  }

  return {
    pokemon,
    moves,
    items: itemMap,
    abilities,
    types,
    natures,
    ui: uiStrings,
  };
}

main();
