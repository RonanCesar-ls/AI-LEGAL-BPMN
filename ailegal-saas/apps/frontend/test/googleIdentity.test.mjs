import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { test } from 'node:test';
import { mountGoogleSignIn } from '../src/modules/auth/googleIdentity.js';

test('initializes Google once across StrictMode mounts and login/signup transitions', async () => {
  let initialized = 0;
  let rendered = 0;
  let googleCallback;
  const api = {
    initialize({ callback }) { initialized++; googleCallback = callback; },
    renderButton() { rendered++; },
  };
  globalThis.window = { google: { accounts: { id: api } } };
  const element = { clientWidth: 300, replaceChildren() {} };
  const calls = [];
  const errors = [];
  const callbacks = name => ({ onCredential: () => calls.push(name), onLoadError: error => errors.push(error) });
  const staleCleanup = mountGoogleSignIn(element, 'test-client', callbacks('stale'));
  staleCleanup();
  const loginCleanup = mountGoogleSignIn(element, 'test-client', callbacks('login'));
  await setImmediate();
  googleCallback({ credential: 'synthetic' });
  loginCleanup();
  const signupCleanup = mountGoogleSignIn(element, 'test-client', callbacks('signup'));
  await setImmediate();
  googleCallback({ credential: 'synthetic' });
  signupCleanup();
  googleCallback({ credential: 'synthetic' });
  assert.equal(initialized, 1);
  assert.equal(rendered, 2);
  assert.deepEqual(calls, ['login', 'signup']);
  assert.deepEqual(errors, []);
  delete globalThis.window;
});

test('shares one SDK script while a disposed form waits for it to load', async () => {
  let script;
  let appended = 0;
  let initialized = 0;
  const errors = [];
  globalThis.window = {};
  globalThis.document = {
    querySelector() { return script; },
    createElement() { return Object.assign(new EventTarget(), { remove() { script = undefined; } }); },
    head: { appendChild(element) { script = element; appended++; } },
  };
  const element = { clientWidth: 280, replaceChildren() {} };
  const callbacks = { onCredential() {}, onLoadError(error) { errors.push(error); } };
  const staleCleanup = mountGoogleSignIn(element, 'test-client', callbacks);
  staleCleanup();
  const cleanup = mountGoogleSignIn(element, 'test-client', callbacks);
  window.google = { accounts: { id: { initialize() { initialized++; }, renderButton() {} } } };
  script.dispatchEvent(new Event('load'));
  await setImmediate();
  cleanup();
  assert.equal(appended, 1);
  assert.equal(initialized, 1);
  assert.deepEqual(errors, []);
  delete globalThis.window;
  delete globalThis.document;
});
