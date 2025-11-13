const fs = require('fs');
const path = require('path');

function addDynamicExport(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      addDynamicExport(filePath);
    } else if (file === 'route.ts') {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if it already has dynamic export
      if (!content.includes("export const dynamic")) {
        // Add after imports, before first export
        const importEnd = content.lastIndexOf("import");
        const nextLine = content.indexOf('\n', importEnd);
        const beforeExports = content.indexOf('export async function');
        
        if (beforeExports > -1) {
          const insertPos = content.lastIndexOf('\n', beforeExports) + 1;
          content = content.slice(0, insertPos) + "export const dynamic = 'force-dynamic';\n\n" + content.slice(insertPos);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Updated: ${filePath}`);
        }
      }
    }
  });
}

const apiDir = path.join(__dirname, '..', 'app', 'api');
if (fs.existsSync(apiDir)) {
  addDynamicExport(apiDir);
}

console.log('Dynamic exports added!');





