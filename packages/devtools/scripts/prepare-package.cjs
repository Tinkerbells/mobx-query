const fs = require('node:fs');
const path = require('node:path');

const packageDir = path.resolve(__dirname, '..');
const libDir = path.join(packageDir, 'lib');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
const mobxQueryPackage = JSON.parse(
  fs.readFileSync(path.resolve(packageDir, '..', 'mobx-query', 'package.json'), 'utf8'),
);
const dependencies = { ...packageJson.dependencies };

dependencies['@tinkerbells88/mobx-query'] = `^${mobxQueryPackage.version}`;

const publishedPackage = {
  name: packageJson.name,
  version: process.env.RELEASE_TAG || packageJson.version,
  type: packageJson.type,
  main: './index.js',
  module: './index.js',
  browser: './index.js',
  types: './index.d.ts',
  exports: {
    '.': {
      types: './index.d.ts',
      import: './index.js',
      default: './index.js',
    },
  },
  dependencies,
  publishConfig: packageJson.publishConfig,
  repository: {
    type: 'git',
    url: 'git+https://github.com/Tinkerbells/mobx-query.git',
  },
  bugs: { url: 'https://github.com/Tinkerbells/mobx-query/issues' },
  license: 'MIT',
};

fs.mkdirSync(libDir, { recursive: true });
fs.writeFileSync(
  path.join(libDir, 'package.json'),
  `${JSON.stringify(publishedPackage, null, 2)}\n`,
);
fs.copyFileSync(path.join(packageDir, 'README.md'), path.join(libDir, 'README.md'));

const licensePath = path.resolve(packageDir, '..', 'mobx-query', 'LICENSE');
if (fs.existsSync(licensePath)) fs.copyFileSync(licensePath, path.join(libDir, 'LICENSE'));

console.log(`prepare-package: generated lib package.json with version ${publishedPackage.version}`);
