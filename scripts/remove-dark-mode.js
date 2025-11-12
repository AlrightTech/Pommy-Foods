const fs = require('fs');
const path = require('path');

function removeDarkModeClasses(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      removeDarkModeClasses(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Remove all dark: classes
      content = content.replace(/\s+dark:[^\s"']+/g, '');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    }
  });
}

// Remove dark mode from app/admin and components directories
const adminDir = path.join(__dirname, '..', 'app', 'admin');
const componentsDir = path.join(__dirname, '..', 'components');

if (fs.existsSync(adminDir)) {
  removeDarkModeClasses(adminDir);
}

if (fs.existsSync(componentsDir)) {
  removeDarkModeClasses(componentsDir);
}

console.log('Dark mode classes removed!');

