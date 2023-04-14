const changelog = [
  '@semantic-release/changelog',
  {
    changelogFile: 'docs/CHANGELOG.md',
  },
];

const commitAnalyzer = [
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

const git = [
  '@semantic-release/git',
  {
    assets: ['docs', 'package.json'],
  },
];

const github = [
  '@semantic-release/github',
  {
    message: 'chore(release): ${nextRelease.version} \n\n${nextRelease.notes}',
  },
];

const npm = [
  '@semantic-release/npm',
  {
    npmPublish: true,
  },
];

const releaseNotes = [
  '@semantic-release/release-notes-generator',
  {
    preset: 'conventionalcommits',
    writerOpts: {
      groupBy: 'type',
      commitGroupsSort: [
        'feat',
        'fix',
        'perf',
        'docs',
        'revert',
        'refactor',
        'chore',
      ],
      commitsSort: 'header',
    },
    presetConfig: {
      types: [
        { type: 'build', section: '🦊 CI/CD', hidden: true },
        { type: 'chore', section: '🧾 Other', hidden: false },
        { type: 'ci', section: '🦊 CI/CD', hidden: true },
        { type: 'docs', section: '📔 Docs', hidden: false },
        { type: 'example', section: '📝 Examples', hidden: false },
        { type: 'feat', section: '🚀 Features', hidden: false },
        { type: 'fix', section: '🛠 Fixes', hidden: false },
        { type: 'perf', section: '⏩ Performance', hidden: false },
        { type: 'refactor', section: '✂️ Refactor', hidden: false },
        { type: 'revert', section: '🙅‍️ Reverts', hidden: false },
        { type: 'style', section: '💈 Style', hidden: true },
        { type: 'test', section: '🧪 Tests', hidden: true },
      ],
    },
  },
];

module.exports = {
  branches: ['master', 'next'],
  plugins: [commitAnalyzer, releaseNotes, changelog, npm, git, github],
};
