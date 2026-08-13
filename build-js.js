const babel = require('@babel/core');
const fs = require('fs');

console.log('📦 Compiling JSX files to single bundled production JavaScript...');

const compCode = fs.readFileSync('public/js/components.jsx', 'utf8');
const appCode = fs.readFileSync('public/js/react-app.jsx', 'utf8');

const combinedJSX = `${compCode}\n;\n${appCode}`;

const bundleRes = babel.transformSync(combinedJSX, {
    presets: [
        ['@babel/preset-react', { runtime: 'classic' }]
    ],
    filename: 'bundle.jsx'
});

fs.writeFileSync('public/js/bundle.js', `(function() {\n${bundleRes.code}\n})();`);
console.log('✅ Generated public/js/bundle.js (' + bundleRes.code.length + ' bytes)');
