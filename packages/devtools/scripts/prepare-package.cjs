const fs = require('node:fs');
const path = require('node:path');

const packageDir = path.resolve(__dirname, '..');
const distDir = path.join(packageDir, 'dist');
const packageJsonPath = path.join(packageDir, 'package.json');
const mobxQueryPackagePath = path.resolve(packageDir, '..', 'mobx-query', 'package.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const mobxQueryPackage = JSON.parse(fs.readFileSync(mobxQueryPackagePath, 'utf8'));
const dependencies = { ...packageJson.dependencies };

dependencies['@tinkerbells88/mobx-query'] = `^${mobxQueryPackage.version}`;

const distPackageJson = {
  name: packageJson.name,
  version: process.env.RELEASE_TAG || packageJson.version,
  type: 'module',
  main: './mobx-query-devtools.cjs.js',
  module: './mobx-query-devtools.es.js',
  types: './index.d.ts',
  exports: {
    '.': {
      types: './index.d.ts',
      import: './mobx-query-devtools.es.js',
      require: './mobx-query-devtools.cjs.js',
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

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(
  path.join(distDir, 'package.json'),
  `${JSON.stringify(distPackageJson, null, 2)}\n`,
);
fs.copyFileSync(path.join(packageDir, 'README.md'), path.join(distDir, 'README.md'));

console.log(`prepare-package: generated dist package.json with version ${distPackageJson.version}`);
