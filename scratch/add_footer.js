const fs = require('fs');
const path = require('path');

const pages = [
  'terms',
  'privacy',
  'disclaimer',
  'cookies',
  'refunds'
];

for (const page of pages) {
  const filePath = path.join('c:', 'Users', 'Baker', 'Documents', 'mediguard', 'src', 'app', page, 'page.tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  if (!content.includes('import PublicHeader')) {
    content = 'import PublicHeader from "@/components/PublicHeader";\n' + content;
    modified = true;
  }
  
  if (!content.includes('import PublicFooter')) {
    content = 'import PublicFooter from "@/components/PublicFooter";\n' + content;
    modified = true;
  }

  if (modified) {
    // Replace the first `return (` with `return ( <> <PublicHeader /> `
    content = content.replace(/return\s*\(\s*<div/, 'return (\n    <>\n      <PublicHeader />\n      <div');
    // Find the last `</div>` before `);` and add `<PublicFooter /> </>`
    // Actually these files end with:
    //       </div>
    //     </div>
    //   );
    // }
    content = content.replace(/<\/div>\s*\);\s*}/, '</div>\n      <PublicFooter />\n    </>\n  );\n}');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${page}`);
  }
}
