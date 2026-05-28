// embed_logo.js — Embeds the actual company SVG logo into printInvoice.js
const fs = require('fs');

const svgContent = fs.readFileSync(
  'C:/Users/chaul/OneDrive/Desktop/Prototype/frontend/src/assets/logo.svg',
  'utf8'
);

const b64 = Buffer.from(svgContent).toString('base64');
const dataUri = 'data:image/svg+xml;base64,' + b64;

let src = fs.readFileSync(
  'C:/Users/chaul/OneDrive/Desktop/Prototype/frontend/src/utils/printInvoice.js',
  'utf8'
);

// Replace the LOGO_B64 line regardless of current value
src = src.replace(
  /const LOGO_B64 = '[^']*';/,
  `const LOGO_B64 = '${dataUri}';`
);

fs.writeFileSync(
  'C:/Users/chaul/OneDrive/Desktop/Prototype/frontend/src/utils/printInvoice.js',
  src,
  'utf8'
);

console.log('✅ Logo embedded successfully. dataUri length:', dataUri.length);
