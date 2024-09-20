module.exports = [
  '@semantic-release/github',
  {
    message: 'chore(release): ${nextRelease.version} \n\n${nextRelease.notes}',
  },
];
