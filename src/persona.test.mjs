// node src/persona.test.mjs  (data.js has no browser deps)
import assert from 'node:assert/strict';
import { QUESTIONS, LAPTOPS, PERSONAS, MOMENTS, BUDGETS, personaScores, topPersona, recommend, personaOf } from './data.js';

const opt = (lvl, label) => QUESTIONS[lvl].options.find((o) => o.label === label).w;

// Scoring adds up multi-select picks.
assert.deepEqual(personaScores([{ gamer: 2 }, { gamer: 1, creator: 1 }]), { student: 0, creator: 1, gamer: 3, pro: 0 });
assert.equal(topPersona(personaScores([])), 'student');

// Gamers: the pick follows the budget they chose, and says so when a band has no real gaming laptop.
const gamer = [opt('L1', 'Gaming'), opt('L2', 'My desk, plugged in'), opt('L3', 'Game streaming and upscaling'), opt('L4', 'Gaming power')];
const g = Object.fromEntries(BUDGETS.map((b) => [b.id, recommend(gamer, b.id)]));
assert.ok(g.low.best.price < 150000 && g.low.weak && g.low.runnerUp.tag === 'Worth stretching for');
assert.equal(g.mid.best.id, 'zenbook-14'); // the user's case: ₹1.5–2 lakh never gets a ₹1.1 lakh laptop
assert.ok(g.mid.weak);
assert.equal(g.mid.runnerUp.id, 'yoga-pro-7i');
assert.equal(g.upper.best.id, 'yoga-pro-7i');
assert.equal(g.high.best.id, 'zephyrus-g16');

// Everyone gets a laptop inside the band they chose, unless a cheaper one is clearly better
// ("saves"), and nobody is pushed to the ₹5 lakh gaming laptop without asking for gaming.
const student = [opt('L1', 'Classes and assignments'), opt('L2', 'Campus, all day'), opt('L3', 'Notes and summaries'), opt('L4', 'All-day battery')];
const creator = [opt('L1', 'Editing photos and videos'), opt('L2', 'Cafés and travel'), opt('L3', 'Photo and reel editing'), opt('L4', 'Sharp, colourful screen')];
const pro = [opt('L1', 'Office work and meetings'), opt('L2', 'Client visits and commutes'), opt('L3', 'Emails and meeting notes'), opt('L4', 'Privacy for my files')];
for (const [name, ans] of Object.entries({ gamer, student, creator, pro })) {
  for (const b of BUDGETS) {
    const r = recommend(ans, b.id);
    const inBand = r.best.price >= b.min && r.best.price < b.max;
    assert.ok(inBand || (r.saves && r.best.price < b.min), `${name} ${b.id}`);
    if (name !== 'gamer') assert.notEqual(r.best.id, 'zephyrus-g16', `${name} ${b.id}`);
    if (r.saves) assert.equal(r.runnerUp.tag, 'Best in your budget');
  }
}
assert.equal(recommend(student, 'low').best.id, 'ideapad-slim-3');
assert.equal(recommend(student, 'high').best.id, 'yoga-7-2in1');
assert.ok(recommend(student, 'high').saves);
assert.equal(recommend(pro, 'upper').best.id, 'expertbook-ultra');
assert.equal(recommend(creator, 'mid').best.id, 'zenbook-14');

// Every budget band has at least one laptop; every laptop maps to a persona; data is consistent.
for (const b of BUDGETS) assert.ok(Object.values(LAPTOPS).some((l) => l.price >= b.min && l.price < b.max), b.id);
for (const id of Object.keys(LAPTOPS)) assert.ok(PERSONAS[personaOf(id)], id);
for (const l of Object.values(LAPTOPS)) assert.ok(l.why.length >= 2 && Object.keys(PERSONAS).every((p) => l.fit[p]), l.model);
for (const m of MOMENTS) assert.ok(['CPU', 'GPU', 'NPU'].includes(m.engine), m.id);
assert.deepEqual(MOMENTS.map((m) => m.useCase), ['Learning', 'Work', 'Creativity', 'Gaming', 'Everyday']);
console.log('ok');
// Stretch picks stay realistic: never more than 30% over the budget ceiling.
for (const b of BUDGETS.filter((x) => x.max !== Infinity)) {
  const ru = recommend(gamer, b.id).runnerUp;
  if (ru?.tag === 'Worth stretching for') assert.ok(ru.price <= b.max * 1.3, `${b.id} stretch ${ru.price}`);
}
console.log('ok stretch');
// The shared link reproduces the kiosk result exactly (persona, laptop, runner-up).
import { shareQuery, readShare } from './data.js';
const hustler = [opt('L1', 'Office work and meetings'), opt('L1', 'Editing photos and videos'), opt('L2', 'Client visits and commutes'), opt('L4', 'Privacy for my files')];
for (const b of BUDGETS.map((x) => x.id)) {
  const kiosk = recommend(hustler, b);
  const shared = readShare('?' + shareQuery(kiosk.scores, b));
  const phone = recommend([shared.scores], shared.budget);
  assert.equal(phone.persona, kiosk.persona, b);
  assert.equal(phone.best.id, kiosk.best.id, b);
  assert.equal(phone.runnerUp?.id, kiosk.runnerUp?.id, b);
  assert.equal(phone.weak, kiosk.weak, b);
  assert.equal(phone.saves, kiosk.saves, b);
}
assert.equal(recommend(hustler).persona, 'pro');
assert.equal(readShare('?s=1-2-x-4'), null);
assert.equal(readShare('?s=1-2-3'), null);
assert.equal(readShare('?s=1-2-3-4&b=evil').budget, 'any');
console.log('ok share');
