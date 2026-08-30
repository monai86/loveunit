import test from 'node:test';
import assert from 'node:assert/strict';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

test('SEO: Sitemap generator includes all public routes', () => {
  const map = sitemap();
  assert(Array.isArray(map), 'sitemap should return an array');
  assert(map.length >= 8, 'sitemap should have at least 8 public routes');

  const urls = map.map(item => item.url);
  assert(urls.some(url => url.endsWith('/')), 'sitemap must include homepage');
  assert(urls.some(url => url.endsWith('/register')), 'sitemap must include /register');
  assert(urls.some(url => url.endsWith('/screening')), 'sitemap must include /screening');
  assert(urls.some(url => url.endsWith('/knowledge')), 'sitemap must include /knowledge');
  assert(urls.some(url => url.endsWith('/prepare')), 'sitemap must include /prepare');
  assert(urls.some(url => url.endsWith('/location')), 'sitemap must include /location');
  assert(urls.some(url => url.endsWith('/poster')), 'sitemap must include /poster');
  assert(urls.some(url => url.endsWith('/lookup')), 'sitemap must include /lookup');
});

test('SEO: Robots generator allows public pages and disallows private routes', () => {
  const botRules = robots();
  assert(botRules.rules, 'robots should have rules');

  const rules = Array.isArray(botRules.rules) ? botRules.rules[0] : botRules.rules;
  const allow = (rules?.allow || []) as string[];
  const disallow = (rules?.disallow || []) as string[];

  assert(allow.includes('/'), 'robots must allow /');
  assert(allow.includes('/register'), 'robots must allow /register');
  assert(disallow.includes('/staff/*'), 'robots must disallow /staff/*');
  assert(disallow.includes('/mt70/*'), 'robots must disallow /mt70/*');
  assert(disallow.includes('/registration/*'), 'robots must disallow /registration/* to protect donor private passes');
  assert(botRules.sitemap, 'robots must define sitemap URL');
});
