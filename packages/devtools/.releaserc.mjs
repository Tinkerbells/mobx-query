export default {
  branches: ['main'],
  tagFormat: 'devtools-v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', { changelogFile: 'packages/devtools/CHANGELOG.md' }],
    [
      '@semantic-release/exec',
      {
        prepareCmd:
          'node packages/devtools/scripts/set-version.cjs ${nextRelease.version} && RELEASE_TAG=${nextRelease.version} pnpm --filter @tinkerbells88/mobx-query-devtools run build',
      },
    ],
    ['@semantic-release/npm', { pkgRoot: 'packages/devtools/lib' }],
    [
      '@semantic-release/git',
      {
        assets: ['packages/devtools/package.json', 'packages/devtools/CHANGELOG.md'],
        message: 'chore(devtools-release): ${nextRelease.version} [skip ci]',
      },
    ],
    '@semantic-release/github',
  ],
};
