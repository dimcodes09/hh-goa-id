const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const libDir = path.join(__dirname, '..', 'lib');

const bg = fs.readFileSync(path.join(publicDir, 'goa_bg.jpg')).toString('base64');
const dusk = fs.readFileSync(path.join(publicDir, 'goa_dusk_bg.jpg')).toString('base64');

const code = `export const GOA_BG_DATA_URL = 'data:image/jpeg;base64,${bg}';\nexport const GOA_DUSK_BG_DATA_URL = 'data:image/jpeg;base64,${dusk}';\n`;

fs.writeFileSync(path.join(libDir, 'bgImages.ts'), code);
console.log('Successfully created lib/bgImages.ts!');
