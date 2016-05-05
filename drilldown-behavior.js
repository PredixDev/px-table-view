'use strict';

function transitionend($elem) {
  var transitions = {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'otransitionend'
  };
  var elem = document.createElement('div'),
    end;
  for (var t in transitions) {
    if (window.CP.shouldStopExecution(1)) {
      break;
    }
    if (typeof elem.style[t] !== 'undefined') {
      end = transitions[t];
    }
  }
  window.CP.exitedLoop(1);
  if (end) {
    return end;
  } else {
    end = setTimeout(function () {
      $elem.triggerHandler('transitionend', [$elem]);
    }, 1);
    return 'transitionend';
  }
}

function Drilldown(element, options) {
  this.$element = $(element);
  this.$list = $(element).find('.drilldown__list');
  this.defaults = {
    el: '[data-drilldown]',
    backButton: '<li class="js-drilldown-back"><a tabindex="0"> <i class="fa fa-angle-left"></i> Back</a></li>',
    wrapper: '<div></div>',
    parentLink: false,
    closeOnClick: false
  };
  this.options = $.extend(this.defaults, options);
  var _this = this;
  console.log('DrillDown', this);
  this.$submenuAnchors = [];
  this.$submenus = [];
  this.$menuItems = [];
  this.$selected = null;
  this.init = function () {
    $(window).on('resize', function (e) {
      console.log('Resize');
      _this._getMaxDims();
    });
    $(element).each(function (i, o) {
      console.log('Found drilldown', i);
      $(o).addClass('is-drilldown').find('[data-submenu]').addClass('is-drilldown-submenu');
      $(o).find('a').parent().addClass('is-drilldown-submenu-parent');
    });
    this.$submenuAnchors = this.$element.find('li.is-drilldown-submenu-parent').children('a');
    this.$submenus = this.$submenuAnchors.parent('li').children('[data-submenu]');
    this.$menuItems = this.$element.find('li').not('.js-drilldown-back').attr('role', 'menuitem').find('a');
    this._prepareMenu();
  };
  this._prepareMenu = function () {
    this.$submenuAnchors.each(function () {
      var $link = $(this);
      var $sub = $link.parent();
      if (_this.options.parentLink) {
        $link.clone().prependTo($sub.children('[data-submenu]')).wrap('<li class="is-submenu-parent-item is-submenu-item is-drilldown-submenu-item" role="menu-item"></li>');
      }
      $link.data('savedHref', $link.attr('href')).removeAttr('href');
      $sub.attr('data-title', $.trim($link.text()));
      $link.children('[data-submenu]').attr({
        'aria-hidden': true,
        'tabindex': 0,
        'role': 'menu'
      });
      console.log('Attaching sub menu Anchor');
      _this._events($link);
    });
    this.$submenus.each(function () {
      var $menu = $(this),
        $back = $menu.find('.js-drilldown-back');
      if (!$back.length) {
        $menu.prepend(_this.options.backButton);
      }
      _this._back($menu);
    });
    if (!this.$element.parent().hasClass('is-drilldown')) {
      console.log('Adding is-drilldown to parent');
      this.$wrapper = $(this.options.wrapper).addClass('is-drilldown');
      this.$wrapper = this.$element.wrap(this.$wrapper).parent().css(this._getMaxDims());
    }
  };
  this._events = function ($elem) {
    var _this = this;
    $elem.off('click.px.drilldown').on('click.px.drilldown', function (e) {
      _this.$selected = $(e.target);
      console.log('click.px.drilldown');
      if ($(e.target).parentsUntil('ul', 'li').hasClass('is-drilldown-submenu-parent')) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
      _this._show($elem.parent('li'));
      if (_this.options.closeOnClick) {
        var $body = $('body');
        $body.off('.px.drilldown').on('click.px.drilldown', function (e) {
          if (e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)) {
            return;
          }
          e.preventDefault();
          _this._hideAll();
          $body.off('.px.drilldown');
        });
      }
    });
  };
  this._hideAll = function () {
    var $elem = this.$element.find('.is-drilldown-submenu.is-active').addClass('is-closing');
    $elem.one(transitionend($elem), function (e) {
      $elem.removeClass('is-active is-closing');
    });
    this.$element.trigger('closed.px.drilldown');
  };
  this._back = function ($elem) {
    var _this = this;
    $elem.off('click.px.drilldown');
    $elem.children('.js-drilldown-back').on('click.px.drilldown', function (e) {
      e.stopImmediatePropagation();
      console.log('mouseup on back');
      _this._hide($elem);
    });
  };
  this._menuLinkEvents = function () {
    var _this = this;
    this.$menuItems.not('.is-drilldown-submenu-parent').off('click.px.drilldown').on('click.px.drilldown', function (e) {
      setTimeout(function () {
        _this._hideAll();
      }, 0);
    });
  };
  this._getMaxDims = function () {
    var max = 0,
      result = {};
    this.$submenus.add(this.$element).each(function () {
      var numOfElems = $(this).children('li').length;
      max = numOfElems > max ? numOfElems : max;
    });
    result['min-height'] = max * this.$menuItems[0].getBoundingClientRect().height + 'px';
    result['max-width'] = this.$element[0].getBoundingClientRect().width + 'px';
    console.log('_getMaxDims', result);
    return result;
  };
  this._show = function ($elem) {
    $elem.children('[data-submenu]').addClass('is-active');
    _this.$element.trigger('open.px.drilldown', [$elem]);
    console.log('_show', $elem);
  };
  this._hide = function ($elem) {
    var _this = this;
    $elem.addClass('is-closing').one(transitionend($elem), function () {
      $elem.removeClass('is-active is-closing');
      $elem.blur();
    });
    $elem.trigger('hide.px.drilldown', [$elem]);
  };
  this.init();
}