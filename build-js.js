const babel = require('@babel/core');
const fs = require('fs');

console.log('📦 Compiling JSX files to production JavaScript...');

const compCode = fs.readFileSync('public/js/components.jsx', 'utf8');
const compRes = babel.transformSync(compCode, { presets: ['@babel/preset-react'], filename: 'components.jsx' });
fs.writeFileSync('public/js/components.js', compRes.code);
console.log('✅ Generated public/js/components.js (' + compRes.code.length + ' bytes)');

const appCode = fs.readFileSync('public/js/react-app.jsx', 'utf8');
const appRes = babel.transformSync(appCode, { presets: ['@babel/preset-react'], filename: 'react-app.jsx' });
fs.writeFileSync('public/js/react-app.js', appRes.code);
console.log('✅ Generated public/js/react-app.js (' + appRes.code.length + ' bytes)');
