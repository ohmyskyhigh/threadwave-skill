#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REQUIRED_SKILLS } from './suite-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sections = REQUIRED_SKILLS.map((skill) => {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'skills', skill, 'evals', 'evals.json'), 'utf8'));
  const rows = data.evals.map((item) => `<tr><td>${item.id}</td><td>${escapeHtml(item.prompt)}</td><td>${escapeHtml(item.expected_output)}</td><td>${item.expectations.map(escapeHtml).join('<br>')}</td></tr>`).join('');
  return `<section><h2>${skill}</h2><table><thead><tr><th>ID</th><th>Prompt</th><th>Expected behavior</th><th>Assertions</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}).join('');

const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>ThreadWave Skill Eval Review</title><style>body{font:15px/1.5 system-ui;margin:40px;max-width:1400px;color:#171717}h1{margin-bottom:4px}.note{color:#555}table{border-collapse:collapse;width:100%;margin:16px 0 36px}th,td{border:1px solid #ccc;text-align:left;vertical-align:top;padding:10px}th{background:#f3f3f3}code{background:#eee;padding:2px 4px}</style><body><h1>ThreadWave Skill Evaluation Review</h1><p class="note">Static review artifact. These cases are validated for structure and coverage; this is not an LLM benchmark result.</p>${sections}</body></html>`;
const output = path.join(root, 'eval-review', 'index.html');
fs.writeFileSync(output, html);
process.stdout.write(`${output}\n`);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
