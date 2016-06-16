/* global Hammer */
/**
 * Hold all of the default parameters for the module
 * @type {object}
 */
var defaults = {
  // ID of the element holding pannable content area
  contentEl: 'content',

  // ID of the element holding pull to refresh loading area
  ptrEl: 'ptr',

};

/**
 * Hold all of the merged parameter and default module options
 * @type {object}
 */
var options = {};

/**
 * Pan event parameters
 * @type {object}
 */
var pan = {
  enabled: false,
  distance: 0,
  startingPositionY: 0
};

/**
 * Behavior that manages the px-table-view pull to refresh behavior.
 *
 * @polymerBehavior
 */
var pxTableViewPullToRefreshBehavior = {
  properties: {
    /**
     * Enable pull to refresh on the table
     */
    pullToRefresh: {
      type: Boolean,
      value: false
    },
    /**
     * Number of pixels of panning until refresh
     */
    distanceToRefresh: {
      type: Number,
      value: 70
    },
    /**
     * Function that does the loading and returns a promise
     * ```
     var table = document.getElementById('ptr-table');
     table.loadingFunction = function handleLoad() {
       return new Promise(function (resolve, reject) {
         resolve({});
       });
     };
     * ```
     */
    loadingFunction: {
      type: String
    },
    /**
     * Dragging resistance level
     */
    resistance: {
      type: Number,
      value: 2.5
    },
    /**
     * The transition to apply to the table
     */
    transition: {
      type: String,
      value: 'all .25s'
    }
  },
  //Reference to the Hammer instance
  _hammer: null,

  attached: function() {
    if (this.pullToRefresh) {
      this.async(function() {
        this.toggleClass('table-view--ptr', this.pullToRefresh, this.$.content);
        this.toggleClass('ptr', this.pullToRefresh);
        this.toggleClass('ptr__content', this.pullToRefresh, this.$.content);
        this._init();
      });
    }
  },

  detached: function() {
    if (this.pullToRefresh) {
      if (this._hammer) {
        this._hammer.off();
        // this._hammer.off('panstart', this._onPanStart.bind(this));
        // this._hammer.off('pandown', this._onPanDown.bind(this));
        // this._hammer.off('panup', this._onPanUp.bind(this));
        // this._hammer.off('panend', this._onPanEnd.bind(this));
      }
    }
  },
  /**
   * Initialize pull to refresh, hammer, and bind pan events.
   *
   * @param {object=} params - Setup parameters for pull to refresh
   */
  _init: function(params) {
    params = params || {};
    options = {
      contentEl: this.$.content,
      ptrEl: this.$.ptr,
      distanceToRefresh: this.distanceToRefresh,
      loadingFunction: this.loadingFunction,
      resistance: this.resistance,
      touchAction: 'manipulation'
    };

    if (!options.contentEl || !options.ptrEl) {
      console.error('No contentEl or ptrEl', options);
      return false;
    }
    this._hammer = new Hammer.Manager(options.contentEl, options);
    this._hammer.add(new Hammer.Pan({
      direction: Hammer.DIRECTION_VERTICAL
    }));
    this._hammer.on("panstart panup pandown panend", Hammer.bindFn(this._onPan, this));
    //this._hammer = new Hammer(options.contentEl, options);
    // this._hammer.get('pan').set({
    //   direction: Hammer.DIRECTION_VERTICAL
    // });
    // this._hammer.on('panstart', this._onPanStart.bind(this));
    // this._hammer.on('pandown', this._onPanDown.bind(this));
    // this._hammer.on('panup', this._onPanUp.bind(this));
    // this._hammer.on('panend', this._onPanEnd.bind(this));

  },
  /**
   * Handle when Hammer.js Pan event is triggered
   * @param event
   */
  _onPan: function(event) {
    switch (event.type) {
      case 'panstart':
        this._onPanStart(event);
        break;
      case 'pandown':
        this._onPanDown(event);
        break;
      case 'panup':
        this._onPanUp(event);
        break;
      case 'panend':
        this._onPanEnd(event);
        break;
    }
  },
  /**
	 * Set/remove the loading body class to show or hide the loading indicator after pull down.

	 */
  _setBodyClass: function() {
    if (pan.distance > options.distanceToRefresh) {
      this.toggleClass('ptr-refresh', true);
    } else {
      this.toggleClass('ptr-refresh', false);
    }
  },
  /**
   * Determine whether pan events should apply based on scroll position on panstart
   * @param {object} e - Event object
   */
  _onPanStart: function(e) {
    pan.startingPositionY = document.body.scrollTop;
    if (pan.startingPositionY === 0) {
      pan.enabled = true;
    }
  },
  /**
   * Handle element on screen movement when the pandown events is firing.
   * @param {object} e - Event object
   */
  _onPanDown: function(e) {
    if (!pan.enabled) {
      return;
    }

    e.preventDefault();
    pan.distance = e.distance / options.resistance;

    this._setContentPan();
    this._setBodyClass();
  },
  /**
   * Handle element on screen movement when the pandown events is firing.
   * @param {object} e - Event object
   */
  _onPanUp: function(e) {
    if (!pan.enabled || pan.distance === 0) {
      return;
    }

    e.preventDefault();

    if (pan.distance < e.distance / options.resistance) {
      pan.distance = 0;
    } else {
      pan.distance = e.distance / options.resistance;
    }
    this._setContentPan();
    this._setBodyClass();
  },
  /**
   * Handle determining how to animate and position elements when the panend event fires.
   * @param {object} e - Event object
   */
  _onPanEnd: function(e) {
    if (!pan.enabled) {
      return;
    }
    e.preventDefault();
    options.contentEl.style.transform = options.contentEl.style.webkitTransform = '';
    options.ptrEl.style.transform = options.ptrEl.style.webkitTransform = '';

    if (this.classList.contains('ptr-refresh')) {
      this._doLoading();
    } else {
      this._doReset();
    }

    pan.distance = 0;
    pan.enabled = false;
  },
  /**
   * Handle setting the CSS transform on the content element to move it on the screen.
   */
  _setContentPan: function(e) {
    this.transform(this._transformForTranslateY(pan.distance), options.contentEl);
    this.transform(this._transformForTranslateY((pan.distance - options.ptrEl.offsetHeight)),
      options.ptrEl);
  },
  /**
   * Handle position content and refresh elements to show that loading is taking place.
   * @event px-table-row-ptr-loading
   */
  _doLoading: function(e) {
    var self = this;
    this.toggleClass('ptr-loading', true);
    this.toggleClass('ptr-reset', false);
    this.fire('px-table-row-ptr-loading');

    if (!this.loadingFunction) {
      return this._doReset();
    }
    console.warn('dispatch event, add hide prop and remove time');
    var loadingPromise = this.loadingFunction();
    setTimeout(function() {
      loadingPromise.then(self._doReset.bind(self));
    }, 1000);
  },
  /**
   * Handle resetting all elements to their starting positions before any paning took place.
   * @event px-table-row-ptr-reset
   */
  _doReset: function(e) {

    this.style.touchActioxn = 'unset';

    this.toggleClass('ptr-loading', false);
    this.toggleClass('ptr-refresh', false);
    this.toggleClass('ptr-reset', true);
    this.addEventListener('transitionend', this._onTransitionEnd, false);
    this.fire('px-table-row-ptr-reset');
  },
  /**
   * Handle removing event listener when transition ends.

   */
  _onTransitionEnd: function() {
    this.toggleClass('ptr-reset', false);
    this.removeEventListener('transitionend', this._onTransitionEnd, false);
    console.log('Did fire');
  },
  /**
   * Handle transforming the table-row.
   * @param translateX
   * @returns {String} The transform value
   * @private
   */
  _transformForTranslateY: function(translateY) {
    if (translateY === null) {
      return 'translate3d(0, 0, 0)';
    }
    return 'translate3d(0, ' + translateY + 'px, 0)';
  }
};
