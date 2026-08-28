import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Loading from '../app/loading';

console.log('⏳ Running loading-screen behavior tests...');

// This fails if a costly backdrop blur or decorative motion is reintroduced,
// either of which makes the full-screen fallback visibly stutter on navigation.
const markup = renderToStaticMarkup(React.createElement(Loading));

assert.ok(markup.includes('role="status"'));
assert.ok(markup.includes('loading-progress'));
assert.equal(markup.includes('backdrop-blur'), false);
assert.equal(markup.includes('loading-ripple'), false);
assert.equal(markup.includes('loading-heartbeat'), false);
assert.equal(markup.includes('loading-dots'), false);

console.log('✓ Loading overlay stays static except for its lightweight progress indicator');
