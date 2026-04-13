const fs = require('fs');
const file = './server/seed/seed.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\} \},\n/g, '},\n');
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax error in seed.js');
