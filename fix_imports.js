const fs = require('fs');
const file = process.argv[2];
if (!file) process.exit(1);
const content = fs.readFileSync(file, 'utf8');
const importMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*'lucide-react';/);
if (!importMatch) process.exit(0);
const icons = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
const imports = icons.map(iconStr => {
  let alias = iconStr;
  let name = iconStr;
  if (iconStr.includes(' as ')) {
    [name, alias] = iconStr.split(' as ').map(s => s.trim());
  }
  const kebabName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([a-zA-Z])([0-9])/g, '$1-$2').toLowerCase().replace(/^-/, '');
  return `import ${alias} from 'lucide-react/dist/esm/icons/${kebabName}';`;
}).join('\n');
const newContent = content.replace(importMatch[0], imports);
fs.writeFileSync(file, newContent);
console.log(`Fixed ${file}`);
