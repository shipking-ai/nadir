const fs = require('fs');
function edit(p, pairs) { let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); for (const [a, b] of pairs) { if (!s.includes(a)) throw new Error(p + ': ' + a.slice(0, 60)); s = s.replace(a, b); } fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s); }
edit('src/shared/urls.js', [
 ["searchTemplate.replace('%s', encodeURIComponent(input))", "searchTemplate.replace('%s', encodeURIComponent(input.toWellFormed()))"],
 ["function upgradeUrl(url) {\n  const u = new URL(url);\n  u.protocol = 'https:';\n  if (u.port === '80') u.port = '';\n  return u.href;\n}", "function upgradeUrl(url) {\n  try {\n    const u = new URL(url);\n    u.protocol = 'https:';\n    if (u.port === '80') u.port = '';\n    return u.href;\n  } catch { return url; }\n}"],
]);
edit('src/shared/filenames.js', [["    n = n.slice(0, 150 - ext.length) + ext;\n  }\n  return n;", "    n = n.slice(0, 150 - ext.length) + ext;\n    n = n.replace(/[\s.]+$/g, '');                                  // truncation can expose a new trailing dot/space\n    if (!n || RESERVED.test(n)) n = n ? `_${n}` : fallback;\n  }\n  return n;"]]);
edit('test/unit/fuzz.test.js', [["    assert.ok(!/ on\w+\s*=/i.test(html.replace(/<style[\s\S]*?<\/style>/i, '')), 'no inline event handlers');", "    // Input text is escaped, so every remaining '<...>' is the page's own template: none may carry an on* handler.\n    assert.ok(!/<[^>]*\son\w+\s*=/i.test(html.replace(/<style[\s\S]*?<\/style>/i, '')), 'no inline event handlers on any tag');"]]);
