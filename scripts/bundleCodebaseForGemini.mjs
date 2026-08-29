import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const outputFile = path.join(rootDir, 'FULL_CODEBASE_FOR_GEMINI.md');

const extensions = ['.ts', '.tsx', '.css', '.json'];
const excludeFiles = ['package-lock.json', 'node_modules', 'dist'];

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!excludeFiles.includes(file)) {
        results = results.concat(getFiles(fullPath));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext) && !excludeFiles.includes(file)) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

let content = `# OREGON TENANT GUARD: COMPLETE CODEBASE BUNDLE FOR GEMINI PRO AUDIT
Generated: ${new Date().toISOString()}

This document contains the complete frontend, legal reasoning, OCR parsing, and PDF pleading generation source code for TenantGuard Oregon.
Evaluate against 2026 Oregon Revised Statutes (ORS 90 & 105), Uniform Trial Court Rules (UTCR 2.010), and the Oregon Consumer Privacy Act (OCPA).

---
`;

const files = getFiles(srcDir);
files.push(path.join(rootDir, 'package.json'));

files.forEach(file => {
  const relativePath = path.relative(rootDir, file).replace(/\\/g, '/');
  const fileContent = fs.readFileSync(file, 'utf-8');
  const ext = path.extname(file).replace('.', '');
  content += `\n\n## FILE: \`${relativePath}\`\n\`\`\`${ext}\n${fileContent}\n\`\`\`\n`;
});

fs.writeFileSync(outputFile, content, 'utf-8');
console.log(`✅ Successfully bundled complete codebase into: ${outputFile}`);
