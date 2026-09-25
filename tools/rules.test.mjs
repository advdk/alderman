// Firestore rules tests. Run with: npm run test:rules  (starts the Firestore emulator)
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

let env;
const MIN = 60000;
before(async () => {
  env = await initializeTestEnvironment({ projectId: `demo-${JSON.parse(readFileSync('package.json', 'utf8')).name}`, firestore: { rules: readFileSync('firestore.rules', 'utf8') } });
});
after(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const entry = (o = {}) => {
  const e = Object.assign({ house: 'House of Vosge', result: 'ended', wonDay: null, fortune: 12000, day: 3, updatedAt: serverTimestamp() }, o);
  e.sortKey = (e.wonDay != null ? e.wonDay : 99999) * 1e9 - e.fortune;
  return e;
};
// register a season as if the server saw it start `agoMs` ago
async function seasonStarted(uid, season, agoMs) {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), `users/${uid}/seasons/${season}`), { startedAt: Timestamp.fromMillis(Date.now() - agoMs), seed: 1370 }));
}

test('player can register a season once, stamped with server time', async () => {
  const db = env.authenticatedContext('alice').firestore();
  await assertSucceeds(setDoc(doc(db, 'users/alice/seasons/1'), { startedAt: serverTimestamp(), seed: 1370 }));
  await assertFails(setDoc(doc(db, 'users/alice/seasons/1'), { startedAt: serverTimestamp(), seed: 1370 }));
  await assertFails(setDoc(doc(db, 'users/alice/seasons/2'), { startedAt: Timestamp.fromMillis(Date.now() - 864e5), seed: 1471 }));
});

test('cannot touch another player', async () => {
  const db = env.authenticatedContext('bob').firestore();
  await assertFails(setDoc(doc(db, 'users/alice/seasons/1'), { startedAt: serverTimestamp(), seed: 1370 }));
  await assertFails(getDoc(doc(db, 'users/alice/save/current')));
  await seasonStarted('alice', 1, 60 * MIN);
  await assertFails(setDoc(doc(db, 'boards/1/entries/alice'), entry()));
});

test('honest result is accepted and readable by anyone', async () => {
  await seasonStarted('alice', 1, 60 * MIN);            // 1 real hour: up to 48 days at 4x
  const db = env.authenticatedContext('alice').firestore();
  await assertSucceeds(setDoc(doc(db, 'boards/1/entries/alice'), entry({ day: 40 })));
  await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(), 'boards/1/entries/alice')));
});

test('claiming more days than real time allows is rejected', async () => {
  await seasonStarted('alice', 1, 60 * MIN);
  const db = env.authenticatedContext('alice').firestore();
  await assertFails(setDoc(doc(db, 'boards/1/entries/alice'), entry({ day: 200, result: 'won', wonDay: 150, fortune: 90000 })));
});

test('entry without a registered season is rejected', async () => {
  const db = env.authenticatedContext('alice').firestore();
  await assertFails(setDoc(doc(db, 'boards/7/entries/alice'), entry()));
});

test('forged sort key or bad fields are rejected', async () => {
  await seasonStarted('alice', 1, 600 * MIN);
  const db = env.authenticatedContext('alice').firestore();
  await assertFails(setDoc(doc(db, 'boards/1/entries/alice'), Object.assign(entry({ day: 50, result: 'won', wonDay: 45, fortune: 70000 }), { sortKey: 1 })));
  await assertFails(setDoc(doc(db, 'boards/1/entries/alice'), entry({ result: 'emperor' })));
  await assertFails(setDoc(doc(db, 'boards/1/entries/alice'), entry({ house: 'x'.repeat(40) })));
  await assertFails(setDoc(doc(db, 'boards/1/entries/alice'), entry({ house: 'The FUCK house' })));
  await assertFails(setDoc(doc(db, 'boards/1/entries/alice'), entry({ house: 'Hurensohn & Co' })));
  await assertSucceeds(setDoc(doc(db, 'boards/1/entries/alice'), entry({ day: 50, result: 'won', wonDay: 45, fortune: 70000 })));
});

test('cloud save: owner only, bounded size', async () => {
  const db = env.authenticatedContext('alice').firestore();
  const save = { state: '{"v":3}', hall: '[]', v: 3, savedAt: Date.now(), season: 1, day: 3, updatedAt: serverTimestamp() };
  await assertSucceeds(setDoc(doc(db, 'users/alice/save/current'), save));
  await assertSucceeds(getDoc(doc(db, 'users/alice/save/current')));
  await assertFails(setDoc(doc(db, 'users/alice/save/current'), Object.assign({}, save, { state: 'x'.repeat(950000) })));
  await assertFails(setDoc(doc(db, 'users/alice/save/current'), Object.assign({}, save, { admin: true })));
});

test('a player can delete their own data, nobody else can', async () => {
  await seasonStarted('alice', 1, 60 * MIN);
  const alice = env.authenticatedContext('alice').firestore(), bob = env.authenticatedContext('bob').firestore();
  await assertSucceeds(setDoc(doc(alice, 'boards/1/entries/alice'), entry({ day: 10 })));
  await assertFails(deleteDoc(doc(bob, 'boards/1/entries/alice')));
  await assertFails(deleteDoc(doc(bob, 'users/alice/seasons/1')));
  await assertSucceeds(deleteDoc(doc(alice, 'boards/1/entries/alice')));
  await assertSucceeds(deleteDoc(doc(alice, 'users/alice/seasons/1')));
  await assertSucceeds(deleteDoc(doc(alice, 'users/alice/save/current')));
});
