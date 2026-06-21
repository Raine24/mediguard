const fs = require('fs');
const path = require('path');

const excludeDirs = ['node_modules', '.git', '.next'];
const excludeStrings = ['mediguard_voice_alert', 'mediguard-logo.png', 'Meditime-logo.png'];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!excludeDirs.some(ex => file.includes(ex))) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.html') || file.endsWith('.md')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.push('./admin_seed.ts');
if (fs.existsSync('./public/index.html')) {
  files.push('./public/index.html');
}

let modifiedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace Meditime -> MedicinTime
  content = content.replace(/Meditime/g, 'MedicinTime');
  // Replace meditime -> medicintime
  content = content.replace(/meditime/g, (match, offset, string) => {
    const context = string.substring(Math.max(0, offset - 10), Math.min(string.length, offset + 25));
    if (excludeStrings.some(ex => context.includes(ex))) {
      return 'meditime';
    }
    return 'medicintime';
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Replaced Meditime in ${modifiedFiles} files.`);
