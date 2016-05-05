// This is the wrapper for custom tests, called upon web components ready state
function runCustomTests() {
  // Place any setup steps like variable declaration and initialization here

  // This is the placeholder suite to place custom tests in
  // Use testCase(options) for a more convenient setup of the test cases
  suite('<px-table-view>', function () {
    var element = document.getElementById('px_table_view_1');
    element.items = [{
      title: 'Item 1'
		}];
    test('renders', function () {
      assert.ok(element);
    });
    test('has correct # of items', function () {
      assert.ok(element.items[0].title = 'Item 1');
    });
    test('can add item to element', function () {
      element.push('items', {
        title: 'Item 2',
        href: '#'
      });
      element.push('items', {
        title: 'Item 3',
        href: '#'
      });
      assert.ok(element.items.length === 3);
    });
    test('has correct # of items', function () {
      assert.ok(element.items.length === 3);
    });
  });
}
