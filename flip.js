/**
 * @param {Boolean} autostart
 * @param {Boolean} enableKeyboard Add basic commands (@see `_onKeyUp`)
 */
Flip = function(autostart, enableKeyboard) {
  if (Flip.DEBUG) {
    console.log('Flip - init');
  }

  if (typeof(autostart) !== 'boolean') {  // default `autostart` to true
    autostart = true;
  }

  this.containerElem = document.querySelector('.js-flip-container');
  this.flipElems = this.containerElem.querySelectorAll('.js-flip');
  this.currentIndex = 0;
  this.flipInterval = 2000;  // in milliseconds
  this.flipIntervalObj = null;

  if (enableKeyboard) {
    this._setupKeyboardEvents();
  }

  if (autostart) {
    this.start();
  }
};

/**
 * Start the cycle
 */
Flip.prototype.start = function() {
  if (Flip.DEBUG) {
    console.log('Flip - start');
  }

  var _this = this;
  this.flipIntervalObj = setInterval(function() {
    _this.next.call(_this);
  }, this.flipInterval);
};

/**
 * Stop the cycle
 */
Flip.prototype.stop = function() {
  if (Flip.DEBUG) {
    console.log('Flip - stop');
  }

  clearInterval(this.flipIntervalObj);
  this.flipIntervalObj = null;
};

/**
 * Toggle cycle on/off
 */
Flip.prototype.pauseToggle = function() {
  if (Flip.DEBUG) {
    console.log('Flip - pauseToggle');
  }

  if (this.isRunning()) {
    this.stop();
  } else {
    this.start();
  }
};

/**
 * Move to next element
 */
Flip.prototype.next = function() {
  if (Flip.DEBUG) {
    console.log('Flip - next');
  }

  var nextIndex = this.currentIndex + 1;
  if (nextIndex === this.flipElems.length) {
    nextIndex = 0;
  }

  var currentElem = this.flipElems[this.currentIndex];
  var nextElem = this.flipElems[nextIndex];
  var flipAnimationDuration = Flip.getCSSTransitionDuration(currentElem);

  this._flipByDegrees(currentElem, 90);
  this._flipByDegrees(nextElem, -90);

  // using a timeout here since `ontransitionend` is unreliable
  var _this = this;
  setTimeout(function() {
    currentElem.style.visibility = 'hidden';
    nextElem.style.visibility = 'visible';

    _this._flipByDegrees.apply(_this, [nextElem, 0]);
  }, flipAnimationDuration);

  this.currentIndex = nextIndex;
};

Flip.prototype.isRunning = function() {
  return !!this.flipIntervalObj;
};

/********************
 * "Private" methods
*********************/
Flip.prototype._setupKeyboardEvents = function() {
  var _this = this;
  document.addEventListener('keyup', function() {
    _this._onKeyUp.apply(_this, arguments);
  });
};

/**
 * @param {Event} e
 */
Flip.prototype._onKeyUp = function(e) {
  switch (e.keyCode) {
    case 13:  // return
      e.preventDefault();
      this.pauseToggle();
      break;

    case 32:  // space
      e.preventDefault();
      this.next();
      break;

    default:
      break;
  }
};

/**
 * @param {DOMElement} elem
 * @param {Number} degrees
 */
Flip.prototype._flipByDegrees = function(elem, degrees) {
  var styles = Flip.getCSSTransformStyle('rotateX(' + degrees + 'deg)');

  for (var prop in styles) {
    if (!styles.hasOwnProperty(prop)) {
      continue;
    }

    elem.style[prop] = styles[prop];
  }
};

/**********************
 * Convenience methods
 **********************/
/**
 * @param {DOMElement} elem
 * @param {Number} valueIndex
 */
Flip.getCSSTransitionDuration = function(elem, valueIndex) {
  if (typeof(valueIndex) !== 'number') {
    valueIndex = 0;
  }

  if ('jQuery' in window && elem instanceof jQuery) {
    elem = elem[0];
  }

  var elementStyle = getComputedStyle(elem);
  var animationDurationCSSValue = elementStyle.transitionDuration || elementStyle.webkitTransitionDuration || elementStyle.mozTransitionDuration || '0';
  var animationDuration = animationDurationCSSValue;

  // parse animationDuration CSS string into number
  if (animationDurationCSSValue.indexOf(' ') > -1) {  // more than one value in property
    animationDurationCSSValue = animationDurationCSSValue.split(' ')[valueIndex];
  }
  animationDuration = Number(
    animationDurationCSSValue
      .replace(/;/g, '')
      .replace(/,/g, '')
      .replace(/s|ms/g, '')
  );
  if (animationDurationCSSValue.indexOf('ms') === -1) {  // value is in seconds - ensure milliseconds
    animationDuration *= 1000;
  }

  return animationDuration;
};

Flip.getCSSTransformStyle = function(value) {
  return {
    'transform': value,
    'webkitTransform': value,
    'mozTransform': value,
    'msTransform': value
  };
};
