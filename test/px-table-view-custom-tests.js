// This is the wrapper for custom tests, called upon web components ready state
function runCustomTests() {
  // Place any setup steps like variable declaration and initialization here

  // This is the placeholder suite to place custom tests in
  // Use testCase(options) for a more convenient setup of the test cases
  suite('<px-table-view>', function() {
    var element = document.getElementById('px_table_view_1');
    element.items = [{
      title: 'Item 1'
    }];
    test('renders', function() {
      assert.ok(element);
    });

  });
}
