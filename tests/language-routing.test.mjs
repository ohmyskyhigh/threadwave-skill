import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { chooseLocale, parseSkillFrontmatter, rosterNames } from '../scripts/suite-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const suite = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));

test('explicit locale wins, then latest message, then conversation, then English', () => {
  assert.equal(chooseLocale({ explicit: 'en', latestMessage: '请用中文' }), 'en');
  assert.equal(chooseLocale({ latestMessage: '帮我运行推特代理' }), 'zh-CN');
  assert.equal(chooseLocale({ latestMessage: 'Run my Twitter agent', conversation: '之前用中文' }), 'en');
  assert.equal(chooseLocale({ latestMessage: '123', conversation: '之前用中文' }), 'zh-CN');
  assert.equal(chooseLocale({ latestMessage: '123' }), 'en');
});

test('every skill advertises English and Simplified Chinese request triggers', () => {
  for (const skill of rosterNames(suite)) {
    const content = fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md'), 'utf8');
    const frontmatter = parseSkillFrontmatter(content);
    assert.match(frontmatter.description, /[A-Za-z]/);
    assert.match(frontmatter.description, /[\u3400-\u9fff]/u);
    const agent = fs.readFileSync(path.join(root, 'skills', skill, 'agents', 'openai.yaml'), 'utf8');
    assert.match(agent, /[A-Za-z]/);
    assert.match(agent, /[\u3400-\u9fff]/u);
  }
});
