const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html')) {
      results.push(file);
    }
  });
  return results;
}

const srcFiles = walk(path.join(process.cwd(), 'src'));
const publicFiles = walk(path.join(process.cwd(), 'public'));
const files = [...srcFiles, ...publicFiles];

let changed = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let updated = content;
  updated = updated.replace(/"\/logo\.png"/g, '"https://i.ibb.co/t99SGFg/medicintime-logo.png"');
  updated = updated.replace(/'\/logo\.png'/g, "'https://i.ibb.co/t99SGFg/medicintime-logo.png'");
  updated = updated.replace(/"\/brand-logo\.png"/g, '"https://i.ibb.co/t99SGFg/medicintime-logo.png"');
  updated = updated.replace(/'\/brand-logo\.png'/g, "'https://i.ibb.co/t99SGFg/medicintime-logo.png'");
  updated = updated.replace(/"\/medicintime-logo\.png"/g, '"https://i.ibb.co/t99SGFg/medicintime-logo.png"');
  updated = updated.replace(/'\/medicintime-logo\.png'/g, "'https://i.ibb.co/t99SGFg/medicintime-logo.png'");
  
  if (content !== updated) {
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
    console.log(`Updated ${file}`);
  }
}
console.log(`Replaced logo path in ${changed} files.`);
