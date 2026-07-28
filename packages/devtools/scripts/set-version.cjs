const fs = require('node:fs');
const path = require('node:path');

const version = process.argv[2];

if (!version) throw new Error('Usage: set-version.cjs <version>');

const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.version = version;
fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
