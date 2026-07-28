export default {
  branches: ['main'],
  tagFormat: 'devtools-v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    ['@semantic-release/exec', { prepareCmd: 'node scripts/set-version.cjs ${nextRelease.version}' }],
    ['@semantic-release/npm', { pkgRoot: 'dist' }],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message: 'chore(devtools-release): ${nextRelease.version} [skip ci]',
      },
    ],
    '@semantic-release/github',
  ],
};
