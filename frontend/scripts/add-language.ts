#!/usr/bin/env tsx
/**
 * Adds a new language to the app by translating de/common.json via Google Translate.
 *
 * Usage:
 *   npm run add-language -- <langCode> "<Native Name>"
 *
 * Examples:
 *   npm run add-language -- fr "Français"
 *   npm run add-language -- tr "Türkçe"
 *   npm run add-language -- pl "Polski"
 *   npm run add-language -- ar "العربية"
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [langCode, nativeName] = process.argv.slice(2);

if (!langCode || !nativeName) {
  console.error('Usage: npm run add-language -- <langCode> "<Native Name>"');
  console.error('Example: npm run add-language -- fr "Français"');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const SOURCE_FILE = path.join(ROOT, 'src/locales/de/common.json');
const TARGET_DIR = path.join(ROOT, 'src/locales', langCode);
const TARGET_FILE = path.join(TARGET_DIR, 'common.json');
const INDEX_FILE = path.join(ROOT, 'src/locales/index.ts');

// Protect i18next interpolation variables ({{count}}, {{name}}, etc.)
// by replacing them with placeholders before translating
function extractPlaceholders(text: string): { sanitized: string; placeholders: string[] } {
  const placeholders: string[] = [];
  const sanitized = text.replace(/\{\{[^}]+\}\}/g, (match) => {
    const idx = placeholders.length;
    placeholders.push(match);
    return `__PH${idx}__`;
  });
  return { sanitized, placeholders };
}

function restorePlaceholders(text: string, placeholders: string[]): string {
  return text.replace(/__PH(\d+)__/g, (_, idx) => placeholders[Number(idx)] ?? '');
}

async function translateText(text: string, target: string): Promise<string> {
  if (!text.trim()) return text;

  const { sanitized, placeholders } = extractPlaceholders(text);

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=${target}&dt=t&q=${encodeURIComponent(sanitized)}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Google Translate HTTP ${res.status}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();
  const translated: string = data[0].map((item: [string]) => item[0]).join('');

  return restorePlaceholders(translated, placeholders);
}

// Small delay to avoid rate limiting
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateObject(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  target: string,
  depth = 0,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  if (typeof obj === 'string') {
    const result = await translateText(obj, target);
    await sleep(80); // ~12 req/s — stays well under Google's free limit
    return result;
  }
  if (typeof obj !== 'object' || obj === null) return obj;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};
  const entries = Object.entries(obj);

  for (const [key, value] of entries) {
    if (depth === 0) process.stdout.write(`  Translating "${key}"...\n`);
    result[key] = await translateObject(value, target, depth + 1);
  }
  return result;
}

function updateIndexFile(code: string, native: string) {
  let content = fs.readFileSync(INDEX_FILE, 'utf-8');

  // Add import at the top (after existing imports)
  const importLine = `import ${code} from './${code}/common.json';`;
  if (content.includes(importLine)) {
    console.log(`  Import for "${code}" already exists in index.ts, skipping.`);
  } else {
    // Insert after last import line
    content = content.replace(
      /(import \w+ from '[^']+';)\n(\n|export)/,
      `$1\n${importLine}\n$2`,
    );
  }

  // Add to LANGUAGES array before the closing bracket
  const entry = `  { code: '${code}', nativeName: '${native}', translations: ${code} as Record<string, unknown> },`;
  if (content.includes(`code: '${code}'`)) {
    console.log(`  Language "${code}" already in LANGUAGES array, skipping.`);
  } else {
    content = content.replace(
      /(LANGUAGES: LanguageConfig\[] = \[[\s\S]*?)(];)/,
      `$1${entry}\n$2`,
    );
  }

  fs.writeFileSync(INDEX_FILE, content, 'utf-8');
}

async function main() {
  console.log(`\n🌐 Adding language: ${nativeName} (${langCode})\n`);

  // Check if target file already exists
  if (fs.existsSync(TARGET_FILE)) {
    console.error(`❌ ${TARGET_FILE} already exists. Delete it first to retranslate.`);
    process.exit(1);
  }

  // Read source
  const source = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));

  console.log(`Translating ${Object.keys(source).length} top-level sections via Google Translate...\n`);

  const translated = await translateObject(source, langCode);

  // Write output
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  fs.writeFileSync(TARGET_FILE, JSON.stringify(translated, null, 2) + '\n', 'utf-8');
  console.log(`\n✅ Written: src/locales/${langCode}/common.json`);

  // Register in index.ts
  updateIndexFile(langCode, nativeName);
  console.log(`✅ Registered in src/locales/index.ts`);

  console.log(`\nDone! Restart the dev server to see "${nativeName}" in the language switcher.\n`);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
