
const h         = require('./h');
const Bit       = require('./shapes/bit');
const shapesMap = require('./shapes/shapesMap');
import Tweenable  from './tween/tweenable';
import Thenable   from './thenable';
import Tween      from './tween/tween';
import Timeline   from './tween/timeline';

// TODO
//  - move to Deltable
//  - move to Runable
//  --
//  - tween for every prop

class Transit extends Thenable {
  /*
    Method to declare module's defaults.
    @private
  */
  _declareDefaults () {
    // DEFAULTS / APIs
    this._defaults = {
      // ∆ :: Possible values: [color name, rgb, rgba, hex]
      stroke:           'transparent',
      // ∆ :: Possible values: [ 0..1 ]
      strokeOpacity:    1,
      // Possible values: ['butt' | 'round' | 'square']
      strokeLinecap:    '',
      // ∆ :: Possible values: [ number ]
      strokeWidth:      2,
      // ∆ :: Units :: Possible values: [ number, string ]
      strokeDasharray:  0,
      // ∆ :: Units :: Possible values: [ number, string ]
      strokeDashoffset: 0,
      // ∆ :: Possible values: [color name, rgb, rgba, hex]
      fill:             'deeppink',
      // ∆ :: Possible values: [ 0..1 ]
      fillOpacity:      1,
      // ∆ :: Units :: Possible values: [ number, string ]
      left:             0,
      // ∆ :: Units :: Possible values: [ number, string ]
      top:              0,
      // ∆ :: Units :: Possible values: [ number, string ]
      x:                0,
      // ∆ :: Units :: Possible values: [ number, string ]
      y:                0,
      // ∆ :: Units :: Possible values: [ number, string ]
      rx:               0,
      // ∆ :: Units :: Possible values: [ number, string ]
      ry:               0,
      // ∆ :: Possible values: [ number ]
      angle:            0,
      // ∆ :: Possible values: [ number ]
      scale:            1,
      // ∆ :: Possible values: [ 0..1 ]
      opacity:          1,
      // ∆ :: Possible values: [ number ]
      points:           3,
      // ∆ :: Possible values: [ number ]
      radius:           { 0: 50 },
      // ∆ :: Possible values: [ number ]
      radiusX:          null,
      // ∆ :: Possible values: [ number ]
      radiusY:          null,
      // Possible values: [ boolean ]
      isShowStart:      false,
      // Possible values: [ boolean ]
      isShowEnd:        false,
      // Possible values: [ number ]
      size:             null,
      // Possible values: [ number ]
      sizeGap:          0,
      // context for all the callbacks
      callbacksContext: null
    }
    
    this._skipPropsDelta = this._skipPropsDelta || {
      callbacksContext:   1
    }

  }
  /*
    Method to start the animation with optional new options.
    @public
    @param {Object} New options to set on the run.
    @returns {Object} this.
  */
  // run (o) {
  //   // if options object was passed
  //   if (o && Object.keys(o).length) {
  //     this._transformHistory(o);
  //     this._tuneNewOption(o);
  //     // save to history
  //     o = h.cloneObj(this.history[0]);
  //     h.extend(o, this._defaults);
  //     this.history[0] = o;
  //   }
  //   this.stop(); this.play();
  //   return this;
  // }

  // ^ Public methods / APIs
  // v private methods.

  /*
    Method to declare variables.
    @overrides Thenable
  */
  _vars () {
    // call _vars method on Thenable
    super._vars();

    // this._props   = {};
    this.lastSet  = {};
    this.origin   = {};
    // should draw on foreign svg canvas
    this.isForeign = !!this._o.ctx;
    // should take an svg element as self bit
    return this.isForeignBit = !!this._o.bit;
  }
  // /*
  //   Method to override(or define) update callbacks in passed object.
  //   @param {Object} Object to override callbacks in.
  // */
  // _overrideUpdateCallbacks (object) {
  //   var it         = this, // save lexical this, uh oh
  //       onUpdate   = object.onUpdate,
  //       isOnUpdate = (onUpdate && typeof onUpdate === 'function');
  //   // redefine onUpdate for Transit's draw calculation in _setProgress
  //   object.onUpdate = function ( pe ) {
  //     // call onUpdate function from options
  //     isOnUpdate && onUpdate.apply( this, arguments );
  //     // calcalate and draw Transit's progress
  //     it._setProgress(pe);
  //   };

  //   var onFirstUpdate   = object.onFirstUpdate,
  //       isOnFirstUpdate = (onFirstUpdate && typeof onFirstUpdate === 'function');
  //   // redefine onFirstUpdate for Transit's _tuneHistoryRecord
  //   object.onFirstUpdate = function onFirstUpdateFunction (isForward) {
  //     // call onFirstUpdate function from options
  //     isOnFirstUpdate && onFirstUpdate.apply( this, arguments );
  //     // call tune options with index of the tween
  //     it._tuneHistoryRecord( onFirstUpdateFunction.tween.index || 0 );
  //   };
  // }
  /*
    Method to initialize modules presentation.
    @private
    @overrides Module
  */
  _render () {
    if (!this.isRendered) {
      if (!this.isForeign && !this.isForeignBit) {
        this.ctx = document.createElementNS(h.NS, 'svg');
        this.ctx.style.position = 'absolute';
        this.ctx.style.width    = '100%';
        this.ctx.style.height   = '100%';
        this._createBit();
        this._calcSize();
        this.el = document.createElement('div');
        this.el.appendChild(this.ctx);
        (this._o.parent || document.body).appendChild(this.el);
      } else { this.ctx = this._o.ctx; this._createBit(); this._calcSize(); }
      this.isRendered = true;
    }
    this._setElStyles();
    
    if (this.el != null) { this.el.style.opacity = this._props.opacity; }
    if (this._o.isShowStart) { this._show(); } else { this._hide(); }

    this._setProgress( 0 );
    return this;
  }
  /*
    Method to set el styles on initialization.
    @private
  */
  _setElStyles () {
    var marginSize, ref, size;
    if (!this.isForeign) {
      size = this._props.size + "px";
      this.el.style.position = 'absolute';
      this.el.style.top      = this._props.top;
      this.el.style.left     = this._props.left;
      this.el.style.width    = size;
      this.el.style.height   = size;
      marginSize = (-this._props.size / 2) + "px";
      this.el.style['margin-left'] = marginSize;
      this.el.style['margin-top']  = marginSize;
      this.el.style['marginLeft']  = marginSize;
      this.el.style['marginTop']   = marginSize;
    }
  }
  /*
    Method to draw shape.
    @private
  */
  _draw () {
    this.bit.setProp({
      x:                    this.origin.x,
      y:                    this.origin.y,
      rx:                   this._props.rx,
      ry:                   this._props.ry,
      stroke:               this._props.stroke,
      'stroke-width':       this._props.strokeWidth,
      'stroke-opacity':     this._props.strokeOpacity,
      'stroke-dasharray':   this._props.strokeDasharray,
      'stroke-dashoffset':  this._props.strokeDashoffset,
      'stroke-linecap':     this._props.strokeLinecap,
      fill:                 this._props.fill,
      'fill-opacity':       this._props.fillOpacity,
      radius:               this._props.radius,
      radiusX:              this._props.radiusX,
      radiusY:              this._props.radiusY,
      points:               this._props.points,
      transform:            this._calcShapeTransform()
    });
    this.bit.draw(); this._drawEl();
  }
  /*
    Method to set current modules props to main div el.
    @private
  */
  _drawEl () {
    if (this.el == null) { return true; }
    var p = this._props;
    this._isPropChanged('opacity') && (this.el.style.opacity = p.opacity);
    if (!this.isForeign) {
      this._isPropChanged('left')  && (this.el.style.left = p.left);
      this._isPropChanged('top')   && (this.el.style.top = p.top);
      var isPosChanged = this._isPropChanged('x') || this._isPropChanged('y');
      if ( isPosChanged || this._isPropChanged('scale') ) {
        h.setPrefixedStyle(this.el, 'transform', this._fillTransform());
      }
    }
  }
  /*
    Method to check if property changed after the latest set.
    @private
    @param {String} Name of the property to check.
    @returns {Boolean}
  */
  _isPropChanged ( name ) {
    // if there is no recod for the property - create it
    if (this.lastSet[name] == null) { this.lastSet[name] = {}; }
    if (this.lastSet[name].value !== this._props[name]) {
      this.lastSet[name].value = this._props[name];
      return true;
    } else { return false; }
  }
  /*
    Method to create shape's transform string.
    @private
    @returns {String} Transform string for the shape.
  */
  _calcShapeTransform () {
    return `rotate(${this._props.angle}, ${this.origin.x}, ${this.origin.y})`;
    // this._props.transform = "rotate(" + this._props.angle + "," + this.origin.x + "," + this.origin.y + ")";
  }
  /*
    Method to calculate maximum shape's radius.
    @private
    @returns {Number} Maximum raduis.
  */
  _calcMaxShapeRadius () {
    var selfSize, selfSizeX, selfSizeY;
    selfSize  = this._getRadiusSize({ key: 'radius' });
    selfSizeX = this._getRadiusSize({ key: 'radiusX', fallback: selfSize });
    selfSizeY = this._getRadiusSize({ key: 'radiusY', fallback: selfSize });
    return Math.max(selfSizeX, selfSizeY);
  }
  /*
    Method to calculate maximum size of the svg canvas.
    @private
  */
  _calcSize () {
    if (this._o.size) { return; }
    var p = this._props,
        radius  = this._calcMaxShapeRadius(),
        dStroke = this._deltas['strokeWidth'],
        stroke  = dStroke != null ? Math.max(Math.abs(dStroke.start), Math.abs(dStroke.end)) : this._props.strokeWidth;
    p.size = 2 * radius + 2 * stroke;
    this._increaseSizeWithEasing();
    this._increaseSizeWithBitRatio();
    return p.center = p.size / 2;
  }
  /*
    Method to increase calculated size based on easing.
    @private
  */
  _increaseSizeWithEasing () {
    var p              = this._props,
        easing         = this._o.easing,
        isStringEasing = easing && typeof easing === 'string';
    switch ( isStringEasing && easing.toLowerCase() ) {
      case 'elastic.out':
      case 'elastic.inout':
        p.size *= 1.25;
        break;
      case 'back.out':
      case 'back.inout':
        p.size *= 1.1;
    }
  }
  /*
    Method to increase calculated size based on bit ratio.
    @private
  */
  _increaseSizeWithBitRatio () {
    var p   = this._props;
    p.size *= this.bit.ratio;
    p.size += 2 * p.sizeGap;
  }
  /*
    Method to get maximum radius size with optional fallback.
    @private
    @param {Object}
      @param key {String} Name of the radius - [radius|radiusX|radiusY].
      @param @optional fallback {Number}  Optional number to set if there
                                          is no value for the key.
  */
  _getRadiusSize (o) {
    var delta = this._deltas[o.key];
    // if value is delta value
    if (delta != null) {
      // get maximum number between start and end values of the delta
      return Math.max(Math.abs(delta.end), Math.abs(delta.start));
    } else if (this._props[o.key] != null) {
      // else get the value from props object
      return parseFloat(this._props[o.key]);
    } else { return o.fallback || 0; }
  }
  /*
    Method to find the shape and initialize it.
    @private
  */
  _createBit () {
    var bitClass = shapesMap.getShape(this._o.shape || 'circle');
    this.bit = new bitClass({ ctx: this.ctx, el: this._o.bit, isDrawLess: true });
    // if draw on foreign context
    // or we are animating an svg element outside the module
    if (this.isForeign || this.isForeignBit) { return this.el = this.bit.el; }
  }
  /*
    Method to draw current progress of the deltas.
    @private
    @override @ Module
    @param {Number}  Progress to set - [0..1].
    @returns {Object} this.
  */
  _setProgress ( progress ) {
    // call the super on Module
    super._setProgress( progress );
    this._calcOrigin();
    this._draw(progress);
    return this;
  }
  /*
    Method to calculate transform origin for the element.
    @private
  */
  _calcOrigin () {
    var p = this._props;
    // if drawing context was passed
    // set origin to x and y of the module
    // otherwise set the origin to the center
    this.origin.x = this._o.ctx ? parseFloat(p.x) : p.center;
    this.origin.y = this._o.ctx ? parseFloat(p.y) : p.center;
  }
  /*
    Method to setup tween and timeline options before creating them.
    @override @ Tweenable
    @private  
  */
  _transformTweenOptions () {
    // override(or define) tween control callbacks
    // leave onUpdate callback without optimization due to perf reasons
    var it         = this, // save lexical this, uh oh
        onUpdate   = this._o.onUpdate,
        isOnUpdate = (onUpdate && typeof onUpdate === 'function');
    // redefine onUpdate for Transit's draw calculation in _setProgress
    this._o.onUpdate = function ( pe ) {
      // call onUpdate function from options
      isOnUpdate && onUpdate.apply( this, arguments );
      // calcalate and draw Transit's progress
      it._setProgress(pe);
    };

    this._overrideCallback( 'onStart', function (isForward) {
      isForward ? it._show() : (!it._props.isShowStart && it._hide());
    });
    this._overrideCallback( 'onComplete', function (isForward) {
      isForward ? (!it._props.isShowEnd && it._hide()) : it._show();
    });
  }
  /*
    Method to override callback for controll pupropes.
    @private
    @param {String}    Callback name.
    @parma {Function}  Method to call  
  */
  _overrideCallback (name, fun) {
    var callback   = this._o[name],
        isCallback = (callback && typeof callback === 'function');

    this._o[name] = function () {
      // call overriden callback if it exists
      isCallback && callback.apply( this, arguments );
      // call the passed cleanup function
      fun.apply( this, arguments );
    }
  }
  /*
    Method to transform history rewrite new options object chain on run.
    @param {Object} New options to tune for.
  */
  // _transformHistory ( o ) {
  //   var optionsKeys = Object.keys(o);

  //   for (var i = 0; i < optionsKeys.length; i++ ) {
  //     var optionsKey   = optionsKeys[i],
  //         optionsValue = o[optionsKey];

  //     this._transformHistoryFor( optionsKey, optionsValue );
  //   }
  // }
  /*
    Method to transform history chain for specific key/value.
    @param {String} Name of the property to transform history for.
    @param {Any} The new property's value.
  */
  // _transformHistoryFor ( key, value ) {
  //   for (var i = 0; i < this.history.length; i++ ) {
  //     if ( this._transformHistoryRecord( i, key, value ) ) {
  //       break; // break if no further history modifications needed
  //     }
  //   }
  // }
  /*
    Method to transform history recod with key/value.
    @param {Number} Index of the history record to transform.
    @param {String} Property name to transform.
    @param {Any} Property value to transform to.
    @returns {Boolean} Returns true if no further
                       history modifications is needed.
  */
  // _transformHistoryRecord ( index, key, value ) {
  //   var currRecord    = this.history[index],
  //       prevRecord    = this.history[index-1],
  //       nextRecord    = this.history[index+1],
  //       propertyValue = currRecord[key];
    
  //   if ( this._isDelta(value) ) {
  //     // if previous history record have been already overriden
  //     // with the delta, copy only the end property to the start
  //     if (prevRecord && prevRecord[key] === value) {
  //       var prevEnd     = h.getDeltaEnd(prevRecord[key]);
  //       currRecord[key] = { [prevEnd]: h.getDeltaEnd(propertyValue) }
  //       return true;
  //     } // else go to very end of this function
  //   // if new value is delta
  //   } else {
  //     // if property value is delta - rewrite it's start
  //     // and notify parent to stop hitory modifications
  //     if ( this._isDelta(propertyValue) ) {
  //       currRecord[key] = { [value] : h.getDeltaEnd(propertyValue) };
  //       return true;
  //     // both are not deltas and further in the chain
  //     } else {
  //       currRecord[key] = value;
  //       // if next record isn't delta - we should always override it
  //       // so do not notify parent
  //       if (nextRecord && !this._isDelta(nextRecord[key])) {
  //         // notify that no modifications needed in the next record
  //         return ( nextRecord[key] !== propertyValue );
  //       }
  //     }// else go to very end of this function
  //   }
  //   currRecord[key] = value;
  // }
  /*
    Method to tune new option on run.
    @private
    @param {Object}  Option to tune on run.
    @param {Boolean} If foreign svg canvas.
  */
  // _tuneNewOption (o, isForeign) {
  //   if ((o != null) && (o.shape != null) && o.shape !== (this._o.shape || 'circle')) {
  //     h.warn('Sorry, shape can not be changed on run');
  //     delete o.shape;
  //   }
  //   if ((o != null) && Object.keys(o).length) {
  //     this._extendDefaults(o);
  //     this._resetTweens(isForeign);
  //     this._calcSize();
  //     return !isForeign && this._setElStyles();
  //   }
  // }
  /*
    Method to set new options on run.
    @param {Boolean} If foreign context.
    @private
  */
  // _resetTweens (isForeign) {
  //   var i      = 0,
  //       shift  = 0,
  //       tweens = this.timeline._timelines;

  //   for (var i = 0; i < tweens.length; i++ ) {
  //     var tween     = tweens[i],
  //         prevTween = tweens[i-1];

  //     shift += (prevTween) ? prevTween._props.repeatTime : 0;
  //     this._resetTween( tween, this.history[i], shift );
  //   }
  //   !isForeign && this.timeline._recalcTotalDuration();
  // }
  /*
    Method to reset tween with new options.
    @param {Object} Tween to reset.
    @param {Object} Tween's to reset tween with.
    @param {Number} Optional number to shift tween start time.
  */
  // _resetTween ( tween, o, shift = 0 ) {
  //   o.shiftTime = shift; tween._setProps( o );
  // }
  /*
    Method to create transform string;
    @private
    @returns {String} Transform string.
  */
  _fillTransform () {
    var p = this._props;
    return `translate(${p.x}, ${p.y}) scale(${p.scale})`;
  }
}

export default Transit;