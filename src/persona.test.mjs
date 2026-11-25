// node src/persona.test.mjs  (data.js has no browser deps)
import assert from 'node:assert/strict';
import { QUESTIONS, LAPTOPS, PERSONAS, TASKS, ENGINES, BUDGETS, personaScores, topPersona, recommend, personaOf } from './data.js';

const opt = (lvl, label) => QUESTIONS[lvl].options.find((o) => o.label === label).w;

// Scoring adds up multi-select picks.
assert.deepEqual(personaScores([{ gamer: 2 }, { gamer: 1, creator: 1 }]), { student: 0, creator: 1, gamer: 3, pro: 0 });
assert.equal(topPersona(personaScores([])), 'student');

// A gamer with a big budget gets a gaming machine; on a small budget, the best in-budget pick
// plus a "worth stretching for" gaming laptop.
const gamer = [opt('L1', 'Gaming'), opt('L2', 'My desk, plugged in'), opt('L4', 'Gaming power')];
assert.equal(recommend(gamer, 'high').best.id, 'zephyrus-g16');
const cheapGamer = recommend(gamer, 'low');
assert.ok(cheapGamer.best.price < 150000);
assert.equal(cheapGamer.runnerUp.tag, 'Worth stretching for');

// A student on a low budget stays in budget.
const student = [opt('L1', 'Classes and assignments'), opt('L2', 'Campus, all day'), opt('L3', 'Notes and summaries')];
const r = recommend(student, 'low');
assert.equal(r.best.id, 'ideapad-slim-3');
assert.equal(r.persona, 'student');

// Every budget band has at least one laptop; every laptop maps to a persona; data is consistent.
for (const b of BUDGETS) assert.ok(Object.values(LAPTOPS).some((l) => l.price >= b.min && l.price < b.max), b.id);
for (const id of Object.keys(LAPTOPS)) assert.ok(PERSONAS[personaOf(id)], id);
for (const l of Object.values(LAPTOPS)) assert.equal(l.why.length, 3, l.model);
const ids = ENGINES.map((e) => e.id);
for (const t of TASKS) assert.ok(ids.includes(t.engine), t.text);
console.log('ok');
// Stretch picks stay realistic: never more than 30% over the budget ceiling.
for (const b of BUDGETS.filter((x) => x.max !== Infinity)) {
  const ru = recommend(gamer, b.id).runnerUp;
  if (ru?.tag === 'Worth stretching for') assert.ok(ru.price <= b.max * 1.3, `${b.id} stretch ${ru.price}`);
}
assert.equal(recommend(gamer, 'mid').runnerUp.id, 'yoga-pro-7i');
console.log('ok stretch');
