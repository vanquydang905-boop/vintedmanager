const { execSync } = require('child_process');
const fs = require('fs');

const gids = [
  { key: 'tops', name: 'TOPS', icon: 'fa-shirt', gid: '0' },
  { key: 'bas', name: 'BAS', icon: 'fa-socks', gid: '96160675' },
  { key: 'robes', name: 'ROBES + ENSEMBLES', icon: 'fa-person-dress', gid: '827780982' },
  { key: 'maillots', name: 'MAILLOTS', icon: 'fa-person-swimming', gid: '1160523751' },
  { key: 'divers', name: 'DIVERS', icon: 'fa-box-open', gid: '645845453' },
  { key: 'bijoux', name: 'BIJOUX', icon: 'fa-gem', gid: '1281491528' },
  { key: 'chaussures', name: 'CHAUSSURES', icon: 'fa-shoe-prints', gid: '1756531177' },
  { key: 'sacs', name: 'SACS', icon: 'fa-bag-shopping', gid: '1519340196' }
];

function parseCsv(text) {
  const lines = text.split('\n');
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    cells.push(current.trim());
    result.push(cells);
  }
  return result;
}

const fullStockData = {};

for (const tab of gids) {
  try {
    const raw = execSync(`curl -sL "https://docs.google.com/spreadsheets/d/1oQUUfCg6orAkTApNDYLQekKJxTXE6B-rttdxVeXro_0/export?format=csv&gid=${tab.gid}"`).toString();
    const rows = parseCsv(raw);
    const items = rows.map((r, idx) => {
      if (tab.key === 'chaussures') {
        return {
          id: `stock_${tab.key}_${idx + 1}`,
          sku: r[0] || '',
          photo: r[1] || '',
          taille: r[2] || '',
          qte: parseInt(r[3]) || (r[3] ? 1 : 0),
          localisation: r[4] || '',
          notes: ''
        };
      }
      return {
        id: `stock_${tab.key}_${idx + 1}`,
        sku: r[0] || '',
        photo: r[1] || '',
        tailleS: r[2] || '',
        tailleM: r[3] || '',
        tailleL: r[4] || '',
        tailleXL: r[5] || '',
        tailleUnique: r[6] || '',
        localisation: r[7] || '',
        notes: ''
      };
    }).filter(item => item.sku || item.localisation || item.tailleS || item.tailleM || item.tailleL || item.tailleXL || item.tailleUnique || item.qte);

    fullStockData[tab.key] = {
      key: tab.key,
      name: tab.name,
      icon: tab.icon,
      items: items
    };
    console.log(`Parsed ${tab.name}: ${items.length} items`);
  } catch(e) {
    console.error(e.message);
  }
}

fs.writeFileSync('initial_stock.json', JSON.stringify(fullStockData, null, 2));
console.log('Saved initial_stock.json successfully!');
