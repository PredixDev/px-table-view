function createTOC() {
  var headings = [],
    $el,
    $toc = $('#toc'),
    $item = $('<li/>'),
    href;

  $('h2').each(function () {
    $el = $(this);
    href = $el.text().replace(/\W/g, '-').toLowerCase();
    headings.push({
      label: $el.text(),
      href: '#' + href
    });
    $el.attr('id', href);
  });

  headings.forEach(function (h) {
    var li = $('<li/>');
    var a = $('<a/>');
    a.attr('href', h.href);
    a.text(h.label);
    li.append(a);
    $toc.append(li);
  });
}

function createToggleHeadings() {
  $('h2').css({
    cursor: 'pointer'
  }).bind('click', function (e) {
    $(e.target).next().slideToggle('fast');
  });
}

function createDemoItems(count) {
  count = count || 1;
  var el = null;
  $('.table-view').each(function () {
    el = $(this).find('.table-row:first-child');
    for (var i = 0; i < count; i++) {
      $(this).append(el.clone());
      el.remove();
    }
  });
}

document.addEventListener('WebComponentsReady', function () {
  console.warn('WebComponentsReady');
  createTOC();
  createToggleHeadings();
  createDemoItems(3);
  var collapsed = false;

  $('.btn-collapse-all').bind('click', function (e) {
    collapsed = !collapsed;
    $(this).find('span').text((collapsed ? 'Expand' : 'Collapse'));
    $('h2').trigger('click');
  });

  $('.btn-toggle-actions').bind('click', function (e) {
    $(this).next('.table-view')
      .find('.table-row')
      .toggleClass('table-row--actions-is-visible')
      .find('.table-row__actions')
      .toggleClass('is-visible');
  });
});
$(document).ready(function () {
  console.warn('Document Ready');

});
