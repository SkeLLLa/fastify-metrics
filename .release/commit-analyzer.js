module.exports = [
  '@semantic-release/commit-analyzer',
  {
    preset: 'conventionalcommits',
    releaseRules: [
      { breaking: true, release: 'major' },
      { scope: 'release-skip', release: false },
      { type: 'chore', scope: 'release', release: false },
      { scope: 'deps', release: 'patch' },
      { type: 'feat', release: 'minor' },
      { type: 'build', release: 'patch' },
      { type: 'refactor', release: 'patch' },
      { type: 'fix', release: 'patch' },
      { type: 'pref', release: 'patch' },
      { type: 'revert', release: 'patch' },
      { type: 'chore', release: false },
      { type: 'docs', release: false },
      { type: 'style', release: false },
      { type: 'test', release: false },
    ],
  },
];
