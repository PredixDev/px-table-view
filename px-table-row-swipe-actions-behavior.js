var sharedPanel = null;
if (!window.Hammer) {
  console.error('Must provide hammer.js');
}
var reqAnimationFrame = (function () {
  return window[Hammer.prefixed(window, "requestAnimationFrame")] || function (callback) {
      setTimeout(callback, 1000 / 60);
    };
})();
function dirProp(direction, hProp, vProp) {
  return (direction & Hammer.DIRECTION_HORIZONTAL)
    ? hProp
    : vProp;
}

/**
 * Behavior that manages the swipe actions
 *
 * @polymerBehavior
 */
var pxTableRowActionsSwipeBehavior = {
  properties: {
    /**
     * If true, swiping is disabled
     */
    disableSwipe: {
      type: Boolean,
      value: false
    },
    /**
     * If true, only swiping to the left.
     */
    swipeLeft: {
      type: Boolean,
      value: false
    },
    /**
     * If true, only swiping to the right.
     */
    swipeRight: {
      type: Boolean,
      value: false
    },
    /**
     * The numberb of pixels the swipeale content is peeking at from the screen edge
     * after being swiped to the screen edge.
     */
    peekOffset: {
      type: Number,
      value: 30
    },
    /**
     * How many pixels needed to trigger auto-slide to the edge.
     */
    slideOffset: {
      type: Number,
      value: 80
    },
    /**
     * Whether the user is dragging the content interactively
     */
    _dragging: {
      type: Boolean,
      value: false
    },
    /**
     * Whether the transition is enabled.
     */
    _transition: {
      type: Boolean,
      value: false
    },
    /**
     * If true, swiping to the left is detected and it is only applied to swiping to either side.
     * Otherwise, use `swipeLeft' or 'swipeRight'.
     */
    _slideLeft: {
      type: Boolean
    },
    /**
     * Repetitively evaluating delta of the transitions.
     */
    _transitionDelta: {
      type: Number,
      observer: '_transitionDeltaChanged'
    },
    /**
     * If true, the `transitionDelta` meets the dragging requirements set by `peekOffset` and `slideOffset`.
     */
    _validDelta: {
      type: Boolean,
      value: false
    },
    /**
     * If true, draggable panel is now at the edge of the screen.
     */
    _atEdge: {
      type: Boolean,
      value: false
    },
    /**
     * Current pixel position of the draggable panel.
     */
    _curPos: {
      type: Number
    },
    /**
     * If true, the draggable panel has been dragged.
     * It is used to ensure that the panel is dragging.
     */
    _tracking: {
      type: Boolean,
      value: false
    },
    // Store children object via Polymer's getEffectiveChildren or getDistributedNodes;
    _content: Object
  },
  listeners: {
    'tap': '_tapHandler',
    'iron-resize': '_onIronResize'
  },
  ready: function () {
    // Avoid transition at the beginning e.g. page loads and enable transitions only after the element is rendered and ready.
    this._transition = true;
    this.setScrollDirection(this._swipeAllowed()
      ? 'y'
      : 'all');
  },

  attached: function () {
    if (this.actionable) {
      // on child element attached, inherit the height of the content.
      var _content = Polymer.dom(this);
      this.async(function () {
   //     this.style.height = _content.offsetHeight + 'px';
        this._initSwipeActions(this, Hammer.DIRECTION_HORIZONTAL);
      }, 500);

      // save effective children object.
      this.set('_content', _content);
    }
  },
  _initSwipeActions: function(container, direction) {
    var instance = container;
    this.container = container;
    this.direction = direction;
    this._content = this.$.row;
    this.actions = container.queryEffectiveChildren('px-table-row-actions').$.actions;
    this.containerSize = this.container[dirProp(direction, 'offsetWidth', 'offsetHeight')];
    this.actionsSize = this.actions[dirProp(direction, 'offsetWidth', 'offsetHeight')];
    this.hammer = new Hammer.Manager(this.container);
    this.hammer.add(new Hammer.Pan({direction: this.direction, threshold: 10}));
    this.hammer.on("panstart panmove panend pancancel", Hammer.bindFn(this._onPan, this));
  },
	/**
   * when disableSwipe is true, only click event can be triggered!
   * @param event
   * @private
   */
  _tapHandler: function (event) {
    this.fire('tap-underlay', {
      nodeName: 'underlay',
      target: event
    });
    if (sharedPanel) {
      // release the panel after use.
      sharedPanel = null;
    }
  },
	/**
   *
   * @returns {boolean}
   * @private
   */
  _swipeAllowed: function () {
    return !this.disableSwipe;
  },
	/**
   *
   * @param translateX
   * @returns {*}
   * @private
   */
  _transformForTranslateX: function (translateX) {
    if (translateX === null) {
      return 'translate3d(0, 0, 0)';
    }
    return 'translate3d(' + translateX + 'px, 0, 0)';
  },
	/**
   * To trigger auto-swipe to the right:-
   * - newValue > oldValue
   * - newValue >= slideOffset
   * else return to original position.

   * To trigger auto-swipe to the left:-
   * - newValue < oldValue
   * - newValue <= -slideOffset
   * else return to original position.
   *
   * To trigger auto-swipe to either side,
   * it basically works the same as [swipeLeft] and
   * [swipeRight], just that it needs one more
   * parameter to detect if it's dragging to the left.
   *
   * Assert [slideLeft] if the left-dragging is
   * detected.
   * else return to original position.
   *
   * @param newValue
   * @param oldValue
   * @private
   */
  _transitionDeltaChanged: function (newValue, oldValue) {
    if (this.swipeRight) {
      this._validDelta = this._atEdge
        ? newValue <= -this.slideOffset
        : newValue >= this.slideOffset;
    }
    if (this.swipeLeft) {
      this._validDelta = this._atEdge
        ? newValue >= this.slideOffset
        : newValue <= -this.slideOffset;
    }
    if (!this.swipeLeft && !this.swipeRight) {
      if (newValue > oldValue) {
        this._slideLeft = false;
        this._validDelta = newValue >= this.slideOffset;
      }
      if (newValue < oldValue) {
        this._slideLeft = true;
        this._validDelta = newValue <= -this.slideOffset;
      }
    }
    console.warn('_validDelta', this._validDelta);
  },
	/**
   * Handle when Hammer.js Pan event is triggered
   * @param event
   */
  _onPan: function (event) {
    switch (event.type) {
      case 'panstart':
        this._onPanStart(event);
        break;
      case 'panmove':
        this._onPanMove(event);
        break;
      case 'panend':
        this._onPanEnd(event);
        break;
    }
  },

  /**
   * Reset the position of the swipeable content with the attribute `content` from the edge after being dragged.
   */
  resetPosition: function () {
    this._moveDrawer(null);
    this.set('_atEdge', false); // reset position of the swipeable content from the edge.
    this.set('_curPos', 0);
    this.fire('position-reset'); // fire event when position is reset.
  },
  /**
   *
   * @param event
   * @private
   */
  _onPanStart: function (event) {
    console.log('_onPanStart');

    if (this._swipeAllowed()) {
      sharedPanel = this;
      this._dragging = true;
      if (this._dragging) {
        this.width = this._content.offsetWidth;
        this._transition = false;
      }
    }
  },
  /**
   *
   * @param event
   * @private
   */
  _onPanMove: function (event) {
    this._transition = true;
    console.log('_onPanMove', this._curPos);
    if (this._dragging) {
      var dx = event.deltaX;
      var dragDx;

      this._transitionDelta = dx;
      dragDx = this._atEdge  ? this._curPos + dx : dx;
      this._tracking = true;
      this._moveDrawer(dragDx);
    }
  },
  /**
   *  to swipe to the leftmost edge:-
   *  - slide until [this.peekOffset] - [this.width].
   *  - validDelta = true
   *  - AtEdge = false
   *  - store current position after swiping to leftmost edge, [curPos]
   *  - animate the dragging by [_moveDrawer(pixel_to_animate)]
   *
   *  else vice versa for swiping to rightmsot edge and/ or either side.
   */
  _onPanEnd: function (event) {
   // this._dragging = false;

    if (this._swipeAllowed() && this._tracking) {
      var slideTo = (this.width - this.peekOffset );
      var offsetLR = (this.swipeRight ? slideTo : -slideTo);
      var deltaLR;
      if (!this.swipeLeft) {
        offsetLR = (this._slideLeft ? -slideTo : slideTo);
      }
      deltaLR = this._validDelta && !this._atEdge ? offsetLR : null;
      this._curPos = (this._atEdge ? null : deltaLR);
      this._atEdge = !(deltaLR === null);
      this._validDelta = false;
      this._tracking = false;
      this._moveDrawer(deltaLR);
      console.log(this._validDelta, 'slideTo', slideTo, 'offsetLR', offsetLR, 'deltaLR', deltaLR);
    }
  },
	/**
   *
   * @private
   */
  _onIronResize: function () {
    var _content = this._content;
    if (_content && this._toUpdateHeight) {
      this.async(function () {
        console.log(this._content.offsetHeight);
        this.style.height = _content.offsetHeight + 'px';
      }, 1);
    }
  },
  /**
   * Handle moving the drawer
   * @param translateX
   * @private
   */
  _moveDrawer: function (translateX) {
    var _content = this.$.row;
    this.transform(this._transformForTranslateX(translateX), _content);
    this.toggleClass('transition', this._transition, _content);
    this.toggleClass('dragging', this._dragging, _content);
    this.toggleClass('swipe-left', this.swipeLeft, _content);
    this.toggleClass('swipe-right', this.swipeRight, _content);
  }
};
