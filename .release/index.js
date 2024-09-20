module.exports = {
  branches: [
    { name: 'master', prerelease: false },
    { name: 'next', prerelease: true },
  ],
  plugins: [
    require('./commit-analyzer'),
    require('./release-notes'),
    require('./changelog'),
    require('./npm-publish'),
    require('./git'),
    require('./github'),
  ],
};
