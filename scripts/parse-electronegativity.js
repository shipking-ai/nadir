// Prints electronegativity CSV findings compactly. Usage: node scripts/parse-electronegativity.js report.csv
const t = require('node:fs').readFileSync(process.argv[2], 'utf8');
const re = /^([A-Z_]+),"(\w+)","(\w+)","([^"]+)","([^"]+)","([\s\S]*?)","([\s\S]*?)",(https?:\S+)\s*$/gm;
let m, n = 0;
while ((m = re.exec(t))) {
  n++;
  const file = m[4].split(/[\\/]/).slice(-3).join('/');
  console.log(`${n}. ${m[1]} [${m[2]}/${m[3]}] ${file}:${m[5]}\n     code: ${m[6].replace(/\s+/g, ' ').slice(0, 110)}\n     note: ${m[7].replace(/\s+/g, ' ').slice(0, 160)}`);
}
console.log('total parsed', n);
