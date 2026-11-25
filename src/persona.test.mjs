// node src/persona.test.mjs  (data.js has no browser deps)
import assert from 'node:assert/strict';
import { topPersona, LAPTOPS, PERSONAS, TASKS, ENGINES } from './data.js';

assert.equal(topPersona([]), 'student');
assert.equal(topPersona(['gamer', 'gamer', 'pro']), 'gamer');
assert.equal(topPersona(['student', 'creator', 'pro']), 'pro'); // tie → latest
assert.equal(topPersona(['creator', 'pro', 'creator']), 'creator');
for (const p of Object.keys(PERSONAS)) assert.ok(LAPTOPS[p], `laptop for ${p}`);
const ids = ENGINES.map((e) => e.id);
for (const t of TASKS) assert.ok(ids.includes(t.engine), t.text);
console.log('ok');
