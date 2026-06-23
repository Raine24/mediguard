const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.next') && !file.includes('brain') && !file.includes('scratch')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.html') || file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.json')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '..'));

let changedFiles = 0;
files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/Partner Program/g, 'Affiliate Program')
    .replace(/partner program/g, 'affiliate program')
    .replace(/Partner program/g, 'Affiliate program');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Finished updating ${changedFiles} files.`);
