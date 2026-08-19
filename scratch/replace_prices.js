const fs = require('fs');
const file = 'public/index.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /data-monthly="2\.00" data-biannual="11\.00" data-annual="20\.00">2\.00/g,
  'data-monthly="2.50" data-biannual="14.00" data-annual="27.00">2.50'
);

content = content.replace(
  /data-monthly="3\.50" data-biannual="21\.00" data-annual="40\.00">3\.50/g,
  'data-monthly="4.75" data-biannual="27.00" data-annual="52.00">4.75'
);

content = content.replace(
  /a \$2\/mo Basic plan, and an \$8\/mo Caretaker plan/g,
  'a $2.50/mo Basic plan, and an $4.75/mo Caretaker plan'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done!');
