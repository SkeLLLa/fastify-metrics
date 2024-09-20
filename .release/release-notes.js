module.exports = [
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
        { type: 'build', section: '🐙 CI/CD', hidden: true },
        { type: 'chore', section: '🧾 Other', hidden: false },
        { type: 'ci', section: '🐙 CI/CD', hidden: true },
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
