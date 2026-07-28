export default {
  branches: ['main'],
  tagFormat: 'v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', { changelogFile: 'packages/mobx-query/CHANGELOG.md' }],
    [
      '@semantic-release/exec',
      { prepareCmd: 'node packages/mobx-query/scripts/set-version.cjs ${nextRelease.version}' },
    ],
    ['@semantic-release/npm', { pkgRoot: 'packages/mobx-query/lib' }],
    [
      '@semantic-release/git',
      {
        assets: ['packages/mobx-query/package.json', 'packages/mobx-query/CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]',
      },
    ],
    '@semantic-release/github',
  ],
};
