const fs = require('fs');
const path = require('path');

const INTERNAL_PACKAGES = ['@astral/mobx-query'];
const OUT_DIR = path.resolve(__dirname, '..', 'lib');
const PACKAGE_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PACKAGE_DIR, '..');

const readJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const copyFile = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};

const updateInternalDeps = (deps = {}, version) =>
  Object.entries(deps).reduce((acc, [name, value]) => {
    if (INTERNAL_PACKAGES.includes(name)) {
      acc[name] = `^${version}`;
      return acc;
    }

    acc[name] = value;
    return acc;
  }, {});

const buildPackageJson = (basePackage, version) => {
  const { scripts, devDependencies, typesVersions, ...rest } = basePackage;

  return {
    ...rest,
    version,
    dependencies: updateInternalDeps(basePackage.dependencies, version),
    author: 'Astral.Soft',
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'git+https://github.com/Tinkerbells/mobx-query',
  },
  bugs: {
    url: 'https://github.com/Tinkerbells/mobx-query/issues',
  },
  sideEffects: false,
  types: './index.d.ts',
    main: './index.js',
    module: './index.js',
    browser: './index.js',
    exports: {
      '.': './index.js',
    },
  };
};

const run = () => {
  const packageJson = readJSON(path.join(PACKAGE_DIR, 'package.json'));
  const releaseTag = process.env.RELEASE_TAG || packageJson.version;

  if (!releaseTag) {
    throw new Error('prepare-package: RELEASE_TAG is not defined');
  }

  if (!process.env.RELEASE_TAG) {
    console.warn(
      `prepare-package: RELEASE_TAG is not set, using package.json version ${packageJson.version}`,
    );
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const distPackageJson = buildPackageJson(packageJson, releaseTag);

  fs.writeFileSync(
    path.join(OUT_DIR, 'package.json'),
    `${JSON.stringify(distPackageJson, null, 2)}\n`,
    'utf8',
  );

  copyFile(path.join(REPO_ROOT, 'LICENSE'), path.join(OUT_DIR, 'LICENSE'));
  copyFile(path.join(REPO_ROOT, 'README.md'), path.join(OUT_DIR, 'README.md'));

  console.log(`prepare-package: generated lib package.json with version ${releaseTag}`);
};

run();
