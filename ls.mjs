// filtered-tree.mjs
import fs from 'fs';
import path from 'path';

/**
 * Recursively prints directory structure, excluding any node_modules directory,
 * up to a specified depth.
 * @param {string} dir - Directory to traverse
 * @param {number} depth - How many levels deep to go
 * @param {string} prefix - Prefix for current line (for tree formatting)
 */
function printTree(dir, depth = 2, prefix = '') {
  if (depth < 0) return;
  let entries = fs.readdirSync(dir);
  entries = entries.filter(e => e !== 'node_modules');
  entries.forEach((entry, idx) => {
    const fullPath = path.join(dir, entry);
    if (fullPath.split(path.sep).includes('node_modules')) return;
    const isDir = fs.statSync(fullPath).isDirectory();
    const pointer = idx === entries.length - 1 ? '└─ ' : '├─ ';
    console.log(prefix + pointer + entry + (isDir ? '/' : ''));
    if (isDir) {
      const nextPrefix = prefix + (idx === entries.length - 1 ? '   ' : '│  ');
      printTree(fullPath, depth - 1, nextPrefix);
    }
  });
}

// Run from script location
console.log(path.basename(process.cwd()) + '/');
printTree(process.cwd(), /* depth */ 2, '');
