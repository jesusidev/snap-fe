#!/usr/bin/env tsx

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import pluralize from 'pluralize';

// ---------------------------------------------------------------------------
// CLI Argument Parsing
// ---------------------------------------------------------------------------

interface CliArgs {
  from: string;
  to: string;
  execute: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let from = 'pokemon';
  let to = '';
  let execute = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--from':
        from = args[++i] ?? '';
        break;
      case '--to':
        to = args[++i] ?? '';
        break;
      case '--execute':
        execute = true;
        break;
      case '--dry-run':
        execute = false;
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
    }
  }

  if (!to.trim()) {
    console.error('Error: --to must be a non-empty entity name.\n');
    printUsage();
    process.exit(1);
  }

  return { from, to, execute };
}

function printUsage(): void {
  console.log(`Usage: npx tsx scripts/rename-entity.ts --to <entity> [options]

Options:
  --from <entity>   Source entity name (default: "pokemon")
  --to <entity>     Target entity name (e.g., "recipe", "athlete")
  --dry-run         Preview changes without writing (default)
  --execute         Apply changes
  -h, --help        Show this help message

Examples:
  npm run rename-entity -- --to recipe --dry-run
  npm run rename-entity -- --to recipe --execute
  npm run rename-entity -- --from pokemon --to "case study" --execute
  npm run rename-entity -- --from trainer --to username --execute`);
}

// ---------------------------------------------------------------------------
// Case Variant Generation
// ---------------------------------------------------------------------------

interface CaseVariants {
  camel: string; // caseStudy
  pascal: string; // CaseStudy
  constant: string; // CASE_STUDY
  kebab: string; // case-study
  snake: string; // case_study
  display: string; // Case Study
}

interface EntityVariants {
  singular: CaseVariants;
  plural: CaseVariants;
}

function toWords(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s\-_]+/)
    .map((w) => w.toLowerCase())
    .filter(Boolean);
}

function toCamel(words: string[]): string {
  return words.map((w, i) => (i === 0 ? w : (w[0] ?? '').toUpperCase() + w.slice(1))).join('');
}

function toPascal(words: string[]): string {
  return words.map((w) => (w[0] ?? '').toUpperCase() + w.slice(1)).join('');
}

function toConstant(words: string[]): string {
  return words.map((w) => w.toUpperCase()).join('_');
}

function toKebab(words: string[]): string {
  return words.join('-');
}

function toSnake(words: string[]): string {
  return words.join('_');
}

function toDisplay(words: string[]): string {
  return words.map((w) => (w[0] ?? '').toUpperCase() + w.slice(1)).join(' ');
}

function buildVariants(singularInput: string): EntityVariants {
  const singularWords = toWords(singularInput);
  const pluralInput = pluralize(singularInput);
  const pluralWords = toWords(pluralInput);

  return {
    singular: {
      camel: toCamel(singularWords),
      pascal: toPascal(singularWords),
      constant: toConstant(singularWords),
      kebab: toKebab(singularWords),
      snake: toSnake(singularWords),
      display: toDisplay(singularWords),
    },
    plural: {
      camel: toCamel(pluralWords),
      pascal: toPascal(pluralWords),
      constant: toConstant(pluralWords),
      kebab: toKebab(pluralWords),
      snake: toSnake(pluralWords),
      display: toDisplay(pluralWords),
    },
  };
}

// ---------------------------------------------------------------------------
// Replacement Maps
// ---------------------------------------------------------------------------

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if single-word source has collapsing case forms (camel === kebab).
 * When true, we need context-aware replacement to distinguish path/kebab
 * contexts from identifier contexts.
 */
function needsContextAware(from: EntityVariants, to: EntityVariants): boolean {
  return from.singular.camel === from.singular.kebab && to.singular.camel !== to.singular.kebab;
}

/**
 * Build regex patterns for path/kebab contexts.
 * These are applied BEFORE the general replacement map so that
 * directory paths and kebab-cased names get the kebab target form
 * instead of camelCase.
 */
function buildPathReplacements(from: EntityVariants, to: EntityVariants): [RegExp, string][] {
  const patterns: [RegExp, string][] = [];

  // Process plural before singular (longer match first)
  const pairs: [string, string, string][] = [
    [from.plural.camel, to.plural.kebab, to.plural.snake],
    [from.singular.camel, to.singular.kebab, to.singular.snake],
  ];

  for (const [src, kebab, snake] of pairs) {
    const esc = escapeRegex(src);

    // Path contexts: /pokemon/ → /recipe/
    patterns.push([new RegExp(`(/)${esc}(/)`, 'g'), `$1${kebab}$2`]);
    // End of import path: /pokemon' or /pokemon"
    patterns.push([new RegExp(`(/)${esc}(['"])`, 'g'), `$1${kebab}$2`]);
    // Kebab compound: -pokemon- or -pokemon at end-of-word
    patterns.push([new RegExp(`(-)${esc}\\b`, 'g'), `$1${kebab}`]);
    // Kebab compound: pokemon- at start-of-word
    patterns.push([new RegExp(`\\b${esc}(-)`, 'g'), `${kebab}$1`]);
    // Snake compound: _pokemon_ or _pokemon at end-of-word
    patterns.push([new RegExp(`(_)${esc}\\b`, 'g'), `$1${snake}`]);
    // Snake compound: pokemon_ at start-of-word
    patterns.push([new RegExp(`\\b${esc}(_)`, 'g'), `${snake}$1`]);
  }

  return patterns;
}

/**
 * Build the general replacement map (longest-first, for identifiers).
 */
function buildReplacementMap(from: EntityVariants, to: EntityVariants): [string, string][] {
  const pairs: [string, string][] = [
    // CONSTANT_CASE
    [from.plural.constant, to.plural.constant],
    [from.singular.constant, to.singular.constant],
    // PascalCase
    [from.plural.pascal, to.plural.pascal],
    [from.singular.pascal, to.singular.pascal],
    // camelCase
    [from.plural.camel, to.plural.camel],
    [from.singular.camel, to.singular.camel],
    // kebab-case
    [from.plural.kebab, to.plural.kebab],
    [from.singular.kebab, to.singular.kebab],
    // snake_case
    [from.plural.snake, to.plural.snake],
    [from.singular.snake, to.singular.snake],
    // Display (Title Case)
    [from.plural.display, to.plural.display],
    [from.singular.display, to.singular.display],
  ];

  // Deduplicate (single-word entities where camel === kebab === snake)
  const seen = new Set<string>();
  const unique: [string, string][] = [];
  for (const [search, replace] of pairs) {
    if (!seen.has(search) && search !== replace) {
      seen.add(search);
      unique.push([search, replace]);
    }
  }

  // Sort by length descending to avoid partial matches
  unique.sort((a, b) => b[0].length - a[0].length);

  return unique;
}

/**
 * Build kebab-only replacement map for directory renames.
 */
function buildDirReplacementMap(from: EntityVariants, to: EntityVariants): [string, string][] {
  const pairs: [string, string][] = [
    [from.plural.kebab, to.plural.kebab],
    [from.singular.kebab, to.singular.kebab],
    [from.plural.camel, to.plural.kebab],
    [from.singular.camel, to.singular.kebab],
  ];

  const seen = new Set<string>();
  const unique: [string, string][] = [];
  for (const [search, replace] of pairs) {
    if (!seen.has(search) && search !== replace) {
      seen.add(search);
      unique.push([search, replace]);
    }
  }

  unique.sort((a, b) => b[0].length - a[0].length);
  return unique;
}

// ---------------------------------------------------------------------------
// File Discovery
// ---------------------------------------------------------------------------

const EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.md', '.json', '.mjs']);
const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'coverage',
  '.claude',
  'scripts',
]);

function walkDir(dir: string, results: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walkDir(fullPath, results);
      }
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}

function findDirectoriesToRename(rootDir: string, fromVariants: EntityVariants): string[] {
  const results: string[] = [];
  const searchTerms = new Set([
    fromVariants.singular.kebab,
    fromVariants.plural.kebab,
    fromVariants.singular.camel,
    fromVariants.plural.camel,
  ]);

  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) {
        continue;
      }
      const fullPath = path.join(dir, entry.name);

      if (Array.from(searchTerms).some((term) => entry.name.includes(term))) {
        results.push(fullPath);
      }
      walk(fullPath);
    }
  }

  walk(rootDir);

  // Sort deepest-first so child dirs are renamed before parents
  results.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);
  return results;
}

function findFilesToRename(rootDir: string, fromVariants: EntityVariants): string[] {
  const results: string[] = [];
  const searchTerms = new Set([
    fromVariants.singular.pascal,
    fromVariants.plural.pascal,
    fromVariants.singular.camel,
    fromVariants.plural.camel,
    fromVariants.singular.kebab,
    fromVariants.plural.kebab,
  ]);

  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          walk(fullPath);
        }
      } else if (
        Array.from(searchTerms).some((term) => entry.name.includes(term)) &&
        EXTENSIONS.has(path.extname(entry.name))
      ) {
        results.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return results;
}

// ---------------------------------------------------------------------------
// Rename / Replace Helpers
// ---------------------------------------------------------------------------

function applyReplacements(input: string, pairs: [string, string][]): string {
  let result = input;
  for (const [search, replace] of pairs) {
    result = result.split(search).join(replace);
  }
  return result;
}

function applyPathReplacements(input: string, patterns: [RegExp, string][]): string {
  let result = input;
  for (const [regex, replace] of patterns) {
    result = result.replace(regex, replace);
  }
  return result;
}

function replaceContent(
  content: string,
  generalReplacements: [string, string][],
  pathReplacements: [RegExp, string][]
): string {
  // First pass: context-aware path/kebab replacements
  let result = applyPathReplacements(content, pathReplacements);

  // Second pass: general identifier replacements
  result = applyReplacements(result, generalReplacements);

  return result;
}

function renameFileName(
  filePath: string,
  generalReplacements: [string, string][],
  pathReplacements: [RegExp, string][]
): string {
  let fileName = path.basename(filePath);

  // Apply path/kebab replacements first (for kebab-cased filenames)
  fileName = applyPathReplacements(fileName, pathReplacements);

  // Apply general replacements (for PascalCase/camelCase filenames)
  fileName = applyReplacements(fileName, generalReplacements);

  return path.join(path.dirname(filePath), fileName);
}

// ---------------------------------------------------------------------------
// Change Computation
// ---------------------------------------------------------------------------

interface RenameResult {
  dirRenames: { from: string; to: string }[];
  fileRenames: { from: string; to: string }[];
  contentChanges: { file: string; replacementCount: number }[];
}

function countReplacements(content: string, generalReplacements: [string, string][]): number {
  let count = 0;
  for (const [search] of generalReplacements) {
    const regex = new RegExp(escapeRegex(search), 'g');
    const matches = content.match(regex);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}

function computeChanges(
  rootDir: string,
  fromVariants: EntityVariants,
  dirReplacements: [string, string][],
  generalReplacements: [string, string][],
  pathReplacements: [RegExp, string][]
): RenameResult {
  const result: RenameResult = {
    dirRenames: [],
    fileRenames: [],
    contentChanges: [],
  };

  // Step 1: Directory renames (use kebab-only map)
  const dirsToRename = findDirectoriesToRename(rootDir, fromVariants);
  for (const dir of dirsToRename) {
    const dirName = path.basename(dir);
    const newDirName = applyReplacements(dirName, dirReplacements);
    if (dirName !== newDirName) {
      result.dirRenames.push({
        from: dir,
        to: path.join(path.dirname(dir), newDirName),
      });
    }
  }

  // Step 2: File renames
  const filesToRename = findFilesToRename(rootDir, fromVariants);
  for (const file of filesToRename) {
    const newFile = renameFileName(file, generalReplacements, pathReplacements);
    if (file !== newFile) {
      result.fileRenames.push({ from: file, to: newFile });
    }
  }

  // Step 3: Content replacements
  const allFiles = walkDir(rootDir);
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const newContent = replaceContent(content, generalReplacements, pathReplacements);
    if (content !== newContent) {
      result.contentChanges.push({
        file,
        replacementCount: countReplacements(content, generalReplacements),
      });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

function gitMvOrRename(from: string, to: string, rootDir: string, isGitRepo: boolean): void {
  try {
    if (isGitRepo) {
      execSync(`git mv "${from}" "${to}"`, { cwd: rootDir, stdio: 'pipe' });
    } else {
      fs.renameSync(from, to);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ERROR: rename failed for ${path.relative(rootDir, from)}`);
    console.error(`  ${msg}`);
    process.exit(1);
  }
}

function executeChanges(
  rootDir: string,
  fromVariants: EntityVariants,
  dirReplacements: [string, string][],
  generalReplacements: [string, string][],
  pathReplacements: [RegExp, string][]
): void {
  const isGitRepo = fs.existsSync(path.join(rootDir, '.git'));

  console.log('\nExecuting changes...\n');

  // Step 1: Directory renames (deepest first)
  const dirsToRename = findDirectoriesToRename(rootDir, fromVariants);
  const dirRenames: { from: string; to: string }[] = [];
  for (const dir of dirsToRename) {
    const dirName = path.basename(dir);
    const newDirName = applyReplacements(dirName, dirReplacements);
    if (dirName !== newDirName) {
      dirRenames.push({
        from: dir,
        to: path.join(path.dirname(dir), newDirName),
      });
    }
  }

  if (dirRenames.length > 0) {
    console.log('Renaming directories...');
    for (const { from, to } of dirRenames) {
      const rel = path.relative(rootDir, from);
      const relTo = path.relative(rootDir, to);
      console.log(`  ${rel} → ${relTo}`);
      gitMvOrRename(from, to, rootDir, isGitRepo);
    }
  }

  // Step 2: File renames (re-discover after directory renames)
  const currentFiles = findFilesToRename(rootDir, fromVariants);
  const fileRenames: { from: string; to: string }[] = [];
  for (const file of currentFiles) {
    const newFile = renameFileName(file, generalReplacements, pathReplacements);
    if (file !== newFile) {
      fileRenames.push({ from: file, to: newFile });
    }
  }

  if (fileRenames.length > 0) {
    console.log('\nRenaming files...');
    for (const { from, to } of fileRenames) {
      const rel = path.relative(rootDir, from);
      console.log(`  ${rel} → ${path.basename(to)}`);
      gitMvOrRename(from, to, rootDir, isGitRepo);
    }
  }

  // Step 3: Content replacements (re-discover after renames)
  console.log('\nReplacing content...');
  const allFiles = walkDir(rootDir);
  let filesChanged = 0;
  let totalReplacements = 0;

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const newContent = replaceContent(content, generalReplacements, pathReplacements);
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf-8');
      filesChanged++;
      totalReplacements += countReplacements(content, generalReplacements);
    }
  }

  console.log(`  ${filesChanged} files updated, ~${totalReplacements} replacements`);
}

// ---------------------------------------------------------------------------
// Output Formatting
// ---------------------------------------------------------------------------

function printVariants(label: string, from: EntityVariants, to: EntityVariants): void {
  console.log(`\n${label}:`);
  const rows: [string, string, string][] = [
    ['camelCase (singular)', from.singular.camel, to.singular.camel],
    ['PascalCase (singular)', from.singular.pascal, to.singular.pascal],
    ['CONSTANT (singular)', from.singular.constant, to.singular.constant],
    ['kebab (singular)', from.singular.kebab, to.singular.kebab],
    ['snake (singular)', from.singular.snake, to.singular.snake],
    ['Display (singular)', from.singular.display, to.singular.display],
    ['camelCase (plural)', from.plural.camel, to.plural.camel],
    ['PascalCase (plural)', from.plural.pascal, to.plural.pascal],
    ['CONSTANT (plural)', from.plural.constant, to.plural.constant],
    ['kebab (plural)', from.plural.kebab, to.plural.kebab],
    ['snake (plural)', from.plural.snake, to.plural.snake],
    ['Display (plural)', from.plural.display, to.plural.display],
  ];

  for (const [variant, fromVal, toVal] of rows) {
    console.log(`  ${variant.padEnd(25)} ${fromVal.padEnd(20)} → ${toVal}`);
  }
}

function printSummary(result: RenameResult, rootDir: string): void {
  if (result.dirRenames.length > 0) {
    console.log(`\nDirectory renames (${result.dirRenames.length}):`);
    for (const { from, to } of result.dirRenames) {
      console.log(`  ${path.relative(rootDir, from)}/ → ${path.relative(rootDir, to)}/`);
    }
  }

  if (result.fileRenames.length > 0) {
    console.log(`\nFile renames (${result.fileRenames.length}):`);
    for (const { from, to } of result.fileRenames) {
      console.log(`  ${path.relative(rootDir, from)} → ${path.basename(to)}`);
    }
  }

  if (result.contentChanges.length > 0) {
    const totalReplacements = result.contentChanges.reduce((sum, c) => sum + c.replacementCount, 0);
    console.log(
      `\nContent replacements: ${result.contentChanges.length} files, ~${totalReplacements} replacements`
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const { from, to, execute } = parseArgs();
  const rootDir = process.cwd();

  const fromVariants = buildVariants(from);
  const toVariants = buildVariants(to);

  console.log(`Entity Rename: ${from} → ${to}`);
  console.log(`Mode: ${execute ? 'EXECUTE' : 'DRY RUN'}`);

  printVariants('Case variants', fromVariants, toVariants);

  const generalReplacements = buildReplacementMap(fromVariants, toVariants);
  const dirReplacements = buildDirReplacementMap(fromVariants, toVariants);
  const pathReplacements = needsContextAware(fromVariants, toVariants)
    ? buildPathReplacements(fromVariants, toVariants)
    : [];

  console.log(`\nReplacement pairs (${generalReplacements.length}, longest-first):`);
  for (const [search, replace] of generalReplacements) {
    console.log(`  "${search}" → "${replace}"`);
  }

  if (pathReplacements.length > 0) {
    console.log(`\nPath-context patterns (${pathReplacements.length}):`);
    for (const [regex, replace] of pathReplacements) {
      console.log(`  ${regex.source} → "${replace}"`);
    }
  }

  const changes = computeChanges(
    rootDir,
    fromVariants,
    dirReplacements,
    generalReplacements,
    pathReplacements
  );
  printSummary(changes, rootDir);

  if (!execute) {
    console.log('\nRun with --execute to apply changes.');
    return;
  }

  executeChanges(rootDir, fromVariants, dirReplacements, generalReplacements, pathReplacements);
  console.log('\nEntity rename complete.');
}

main();
