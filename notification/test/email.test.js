import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeMailInput } from '../src/email.js';

test('normalizeMailInput converts positional arguments into a mail payload', () => {
  assert.deepEqual(
    normalizeMailInput('user@example.com', 'Welcome', 'Hello', '<p>Hello</p>'),
    {
      to: 'user@example.com',
      subject: 'Welcome',
      text: 'Hello',
      html: '<p>Hello</p>',
    }
  );
});

test('normalizeMailInput keeps object payloads unchanged', () => {
  const payload = {
    to: 'user@example.com',
    subject: 'Welcome',
    text: 'Hello',
    html: '<p>Hello</p>',
  };

  assert.deepEqual(normalizeMailInput(payload), payload);
});
