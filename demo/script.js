function createDemoItems(count, obj) {
  var _out = [];
  for (var i = 0; i < count; i++) {
    _out.push(obj);
  }
  return _out;
}

var demoListData = {
  list0: {
    title: 'Text Label'
  },
  list1: {
    title: 'Text Label',
    body: 'Text body value'
  },
  list2: {
    title: 'Text Label',
    icon: 'fa fa-2x fa-exclamation-triangle color-orange'
  },
  list3: {
    title: 'Text Label',
    body: 'Text body value',
    image: 'http://placehold.it/100'
  },
  list5: {
    title: 'Text Label',
    image: 'http://placehold.it/60'
  },
  list6: {
    title: 'Text Label',
    label1: 'Label1 value'
  },
  list7: {
    title: 'Text Label',
    label2: 'Label2 value'
  }
};

document.addEventListener('WebComponentsReady', function() {
  console.warn('WebComponentsReady');

  document.getElementById('list0').listData = createDemoItems(3, demoListData.list0);
  document.getElementById('list1').listData = createDemoItems(3, demoListData.list1);
  document.getElementById('list2').listData = createDemoItems(3, demoListData.list2);
  document.getElementById('list3').listData = createDemoItems(3, demoListData.list3);
  document.getElementById('list5').listData = createDemoItems(3, demoListData.list5);
  document.getElementById('list6').listData = createDemoItems(3, demoListData.list6);
  document.getElementById('list7').listData = createDemoItems(3, demoListData.list7);
  document.getElementById('list8').listData = createDemoItems(3, demoListData.list5);
});

function debug() {
  $('body').toggleClass('debug');
}

function addListItem(list, item) {
  item = item || demoListData[list] || {
      title: 'List Item'
    };
  document.getElementById(list).addItem(item);
  console.log('addingListItem', list, item);
}

function createDemoList(el, count) {
  var a, li, list;
  list = document.getElementById(el);
  for (var i = 0; i < count; i++) {
    li = document.createElement('li');
    a = document.createElement('a');
    a.html('Item ' + i);
    li.appendChild(a);
    list.appendChild(li);
  }
}

$(function() {
  FastClick.attach(document.body);
  $('h2').bind('click', function(e) {

    if (e.target.localName === 'h2') {
      $(this).next().slideToggle();
    }
  });
});

$(function() {

  var headings = [],
    $el,
    $toc = $('#toc'),
    $item = $('<li/>'),
    href;

  $('h2').each(function() {
    $el = $(this);
    href = $el.text().replace(/\W/g, '-').toLowerCase();
    headings.push({
      label: $el.text(),
      href: '#' + href
    });
    $el.attr('id', href);
    console.log('Add', href, 'to toc');
  });
  console.log('headings', headings);

  headings.forEach(function(h) {
    var li = $('<li/>');
    var a = $('<a/>');
    a.attr('href', h.href);
    a.text(h.label);
    li.append(a);
    $toc.append(li);
  })

});
