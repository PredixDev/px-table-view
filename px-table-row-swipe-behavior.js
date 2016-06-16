/* global Hammer */

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
  return (direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
}

/**
 * Behavior that manages the swipeable table rows
 *
 * ```
 <px-table-row title="Text Label" label1="Yesterday" modifier="nav-right" swipeable swipe-right fit-underlay>
   <div underlay class="full-height flex flex--stretch flex--left">
     <px-table-row-action-button label="More" type="more"></px-table-row-action-button>
     <px-table-row-action-button label="Flag" type="flag"></px-table-row-action-button>
     <px-table-row-action-button label="Delete" type="delete"></px-table-row-action-button>
   </div>
 </px-table-row>
 * ```
 *
 * @polymerBehavior
 */
var pxTableRowSwipeBehavior = {
  properties: {
    /**
     * If true, position is reset after a tap.
     */
    tapReset: {
      type: Boolean,
      value: true
    },
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
     * If true, the number of pixels the swipeable content is peeking is equal to the width of the underlay.
     */
    fitUnderlay: {
      type: Boolean,
      value: false
    },
    /**
     * The number of pixels the swipeale content is peeking at from the screen edge
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
     * Minimal distance required before recognizing swipe.
     */
    threshold: {
      type: Number,
      value: 2
    },

    /**
     * If the underlay is visible
     */
    underlayOpened: {
      type: Boolean,
      value: false
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
    _content: Object,
    _underlay: Object,
    hammer: Object
  },
  listeners: {
    'tap': '_tapHandler',
    'iron-resize': '_onIronResize'
  },
  ready: function () {
    if (this.swipeable) {
      this._transition = true;
      this.setScrollDirection(this._swipeAllowed() ? 'y' : 'all');
      this.toggleClass('table-row--swipeable', true, this.$.row);
    }
  },
  attached: function () {
    if (this.swipeable) {
      var _content = Polymer.dom(this);
      this.async(function () {
        this._initSwipeActions(this, Hammer.DIRECTION_HORIZONTAL);
      }, 1000);
      this.set('_content', _content);
    }
  },
  _initSwipeActions: function (container, direction) {
    var instance = container;

    this.container = container;
    this.direction = direction;


    var _underlay = Polymer.dom(this.$.underlayContent).getDistributedNodes()[0];
    this.set('_underlay', _underlay);

    var distributed = this.getContentChildren('#underlayContent');
    this.underlay = distributed[0];
    if (this.underlay) {
      this.underlaySize = this.underlay.getBoundingClientRect().width;
    }
    this.containerSize = this.container[dirProp(direction, 'offsetWidth', 'offsetHeight')];
    var options = {
      direction: this.direction,
      threshold: this.threshold,
      touchAction: 'manipulation'
    };
    this.hammer = new Hammer.Manager(this.container, options);
    this.hammer.add(new Hammer.Pan(options));
    this.hammer.on("panstart panmove panend", Hammer.bindFn(this._onPan, this));
  },
  detached: function () {
    if (this.hammer) {
      this.hammer.off();
    }
  },
  /**
   * When disableSwipe is true, only a click event can be triggered.
   */
  _tapHandler: function (event) {
    //  this.fire('px-table-row-underlay-tap', event);
    if (this.tapReset) {
      if (this._atEdge) {
        this.resetPosition();
      }
    }
    if (sharedPanel) {
      sharedPanel = null;
    }
  },
  /**
   * Check if swiping is allowed.
   * @returns {boolean}
   * @private
   */
  _swipeAllowed: function () {
    return !this.disableSwipe;
  },

  _transitionDeltaChanged: function (newValue, oldValue) {
    if (this.swipeRight) {
      this._validDelta = this._atEdge ? newValue <= -this.slideOffset : newValue >= this.slideOffset;
    }
    if (this.swipeLeft) {
      this._validDelta = this._atEdge ? newValue >= this.slideOffset : newValue <= -this.slideOffset;

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
   * Reset the position of the swipeable content.
   * @event px-table-row-swipe-reset
   */
  resetPosition: function () {
    this._moveDrawer(null);
    this.set('underlayOpened', false);
    this.set('_atEdge', false);
    this.set('_curPos', 0);
    this.fire('px-table-row-swipe-reset', this);
    this.toggleClass('is-open', this._atEdge, this.$.row);
  },
  /**
   * Handle when panning starts
   * @param event
   * @event px-table-row-pan-start
   * @private
   */
  _onPanStart: function (event) {
    if (this._swipeAllowed()) {
      sharedPanel = this;
      this._dragging = true;
      if (this._dragging) {
        this.width = this._content.offsetWidth;
        this._transition = false;
      }
      this.fire('px-table-row-swipe-start', event);
    }
  },
  /**
   * Handle when panning
   * @param event
   * @event px-swipe-move
   * @private
   */
  _onPanMove: function (event) {
    this._transition = true;
    if (this._dragging) {
      var dx = event.deltaX;
      var dragDx;
      this._transitionDelta = dx;
      dragDx = this._atEdge ? this._curPos + dx : dx;
      this._tracking = true;
      //  this.fire('px-swipe-move');
      this._moveDrawer(dragDx);
    }
  },
  /**
   * Handle when panning ends
   * @event px-swipe-end
   */
  _onPanEnd: function (event) {
    this._dragging = false;
    var slideTo, offsetLR, deltaLR;
    if (this._swipeAllowed() && this._tracking) {
      slideTo = (this.containerSize - this.peekOffset);

      if (this.fitUnderlay) {
        slideTo = (this.underlaySize);
      }

      offsetLR = (this.swipeRight ? slideTo : -slideTo);

      if (!this.swipeLeft) {
        offsetLR = (this._slideLeft ? -slideTo : slideTo);
      }
      deltaLR = this._validDelta && !this._atEdge ? offsetLR : null;
      this._curPos = (this._atEdge ? null : deltaLR);
      this._atEdge = (deltaLR !== null);
      this._validDelta = false;
      this._tracking = false;

      this.set('underlayOpened', this._atEdge);
      this.fire('px-table-row-swipe-end', this);
      this._moveDrawer(deltaLR);
    }
  },

  /**
   * Handle when iron-resize event is fired.
   * @private
   */
  _onIronResize: function () {
    var _content = this._content;
    var w = this.offsetWidth;
    var distributed = this.getContentChildren('#underlayContent');
    this.underlay = distributed[0];
    if (this.underlay) {
      this.underlaySize = this.underlay.getBoundingClientRect().width;
    }
    if (_content && this._toUpdateHeight) {
      this.async(function () {
        //this.style.height = _content.offsetHeight + 'px';
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
    this.toggleClass('is-open', this.underlayOpened, _content);
    this.toggleClass('transition', this._transition, _content);
    this.toggleClass('dragging', this._dragging, _content);
    this.toggleClass('swipe-left', this.swipeLeft, _content);
    this.toggleClass('swipe-right', this.swipeRight, _content);
  },
  /**
   * Handle transforming the table-row.
   * @param translateX
   * @returns {*}
   * @private
   */
  _transformForTranslateX: function (translateX) {
    if (translateX === null) {
      return 'translate3d(0, 0, 0)';
    }
    return 'translate3d(' + translateX + 'px, 0, 0)';
  }
};
