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
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(process.cwd(), 'src'));

let changed = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('/brand-logo.png')) {
    const updated = content.replace(/\/brand-logo\.png/g, '/medicintime-logo.png');
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
    console.log(`Updated ${file}`);
  }
}
console.log(`Replaced logo path in ${changed} files.`);
