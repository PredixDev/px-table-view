module.exports = {
  verbose: true,
  plugins: {
    local: {
      browsers: ['chrome']
    },
    sauce: {
      disabled: true
    },
    "istanbul": {
      "dir": "./coverage",
      "reporters": [],
      "include": [
				"/px-*.html"
			],
      "exclude": []
    }
  },
  suites: [
    'test/px-table-view-test-fixture.html'
  ]
};
