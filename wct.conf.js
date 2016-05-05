module.exports = {
  verbose: true,
  plugins: {
    local: {
      browsers: ['chrome', 'firefox']
    },
    sauce: {
      disabled: true
    }
  },
  suites: [
    'test/px-table-view-test-fixture.html'
  ]
};
