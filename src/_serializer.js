  // _serializer.js

  /**
   * The Serializer class.
   *
   * This class provides methods and events to serialize parsed data. Callbacks can be registered
   * to listen for a specific event and act according to they needs.
   *
   * Both methods with or without the `new` keyword are supported, then:
   * ```js
   * var serializer = new HTMLParser.Serializer();
   * ```
   * and
   * ```js
   * var serializer = HTMLParser.Serializer();
   * ```
   * are equivalent.
   *
   * @name Serializer
   * @constructor
   * @memberOf module:HTMLParser
   *
   * @return {Object} A self-reference (`this`) to implement chaining.
   *
   * @example
   * var serializer = new HTMLParser.Serializer();
   * serializer.addListener( HTMLParser.Serializer.Events.ON_START, function( data ){
   *   console.log( data );
   * });
   *
   * // or, using the chaining method:
   *
   * var serializer = new HTMLParser.Serializer()
   *   .addListener( HTMLParser.Serializer.Events.ON_START, function( data ){
   *       console.log( data );
   *   });
   */
  HTMLParser.Serializer = function() {
    // this way it's supported both methods with and without `new` keyword
    if ( !this instanceof HTMLParser.Serializer ) {
      return new HTMLParser.Serializer();
    } // if

    // Internal events' chains
    this._events = {
      onStart: [],
      onTagOpen: [],
      onText: [],
      onTagClose: [],
      onFinish: [],
      onError: []
    };

    // support for chaining
    return this;
  }; // Serializer()

  HTMLParser.Serializer.prototype =
    /** @lends module:HTMLParser.Serializer.prototype */
  {
    /**
     * Add a new `callback` function to the `eventName`'s chain.
     *
     * This method allows to attach as many callbacks as we needs to a specific event. The callback
     * can be either an anonymous or named function (it depends on whether you do need the ability
     * to remove callbacks or don't).
     *
     * The callback function will receive a literal object as parameter.
     *
     * @param {string} eventName name of the event the callback will be attached to
     * @param {function(object)} callback anonymous or named function
     *
     * @return {Object} A self-reference (`this`) to implement chaining.
     *
     * @throws {TypeError} Either if the passed <code>eventName</code> is not a string, or <code>callback</code> is not a function.
     * @throws {ReferenceError} If <code>eventName</code> is an event not supported by the class.
     *
     * @example
     * var serializer = new HTMLParser.Serializer();
     * serializer.addListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, function( data ){
     *   if ( data.currentNode.nodeName === 'A' ) {
     *     console.log( 'It\'s a link!' );
     *   }
     * }).addListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, function( data ){
     *   if ( data.currentNode.nodeName === 'DIV' ) {
     *     console.log( 'It\'s a DIV!' );
     *   }
     * });
     *
     * @see module:HTMLParser.Serializer.Events
     */
    addListener: function( eventName, callback ){
      var isEventValid = typeof eventName === 'string',
          isCallbackValid = typeof callback === 'function';

      if ( isEventValid && isCallbackValid ) {
        if ( hasProperty.call( this._events, eventName ) ) {
          this._events[ eventName ].push( callback );
        } else {
          throw new ReferenceError( 'The required event "' + eventName + '" is not supported.' );
        } // if
      } else {
        if ( !isEventValid ) {
          throw new TypeError( 'It was expected a string for the eventName argument.');
        } else {
          throw new TypeError( 'It was expected a function for the callback argument.' );
        } // if
      } // if
      return this;
    }, // addListener()

    /**
    * Removes one or all the callbacks attached to a specific event.
    *
    * This method allows to detach (remove) a `callback` from a specific event's chain. If no
    * callback is passed, the whole event's chain will be destroyed.
    *
    * Note: the `callback` argument **must** be a named function in order to be correctly
    * removed.
    *
    * @param  {string} eventName the name of the event from which to remove the callback
    * @param  {function} [callback] the named function to remove
    *
    * @return {Object} A self-reference (`this`) to implement chaining.
    *
    * @throws {TypeError} If either the <code>eventName</code> is not a string, or <code>callback</code> is not a function or <code>undefined</code>.
    * @throws {ReferenceError} If <code>eventName</code> is an event not supported by the class.
    *
    * @example
    * var serializer = new HTMLParser.Serializer(),
    *     onOpenTagListener1 = function( data ){
    *       if ( data.currentNode.nodeName === 'P' ) {
    *         console.log( 'Found a Paragraph' );
    *       }
    *     };
    *
    * function onOpenTagListener2( data ) {
    *   if ( data.currentNode.nodeName === 'SPAN' ) {
    *     console.log( 'Found a Span' );
    *   }
    * }
    *
    * serializer
    *   .addListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, onOpenTagListener1 )
    *   .addListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, onOpenTagListener2 );
    *
    * serializer.removeListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, onOpenTagListener2 );
    *
    * serializer.removeListener( HTMLParser.Serializer.Events.ON_TAG_OPEN );
    *
    * @see module:HTMLParser.Serializer.Events
    */
    removeListener: function( eventName, callback ){
      var isEventValid = typeof eventName === 'string',
          isCallbackValid = typeof callback === 'function';

      if ( isEventValid ) {
        if ( hasProperty.call( this._events, eventName ) ) {
          if ( isCallbackValid ) {
            // removes the callback from the event's chain
            var evt = this._events[ eventName ],
                idx = evt.indexOf( callback );
            if ( !!~idx ) {
              evt.splice( idx, 1 );
            } // if
          } else {
            if ( callback === undefined ) {
              // destroy the event's chain
              this._events[ eventName ] = [];
            } else {
              throw new TypeError( 'It was expected a function for the callback argument.' );
            } // if..else
          } // if..else
        } else {
          throw new ReferenceError( 'The required event "' + eventName + '" is not supported.' );
        } // if..else
      } else {
        throw new TypeError( 'It was expected a string for the eventName argument.');
      } // if..else
      return this;
    }, // removeListener()

    /**
     * Triggers an event.
     *
     * When an event is triggered, all the callbacks attached to that event will be executed
     * sequentially and an object will be passed to them as argument.
     *
     * @param {string} eventName the name of the event to trigger
     * @param {object} [data={}] data to pass to each callback function
     *
     * @return {boolean} `true` if the requested event has at least one attached callback, otherwise it returns `false`.
     *
     * @throws {TypeError} If either <code>eventName</code> is not a string, or <code>data</code> is not a literal object or <code>undefined</code>.
     * @throws {ReferenceError} If <code>eventName</code> is an event not supported by the class.
     *
     * @example
     * var serializer = new HTMLParser.Serializer();
     * serializer.addListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, function( data ){
     *   if ( data.currentNode.nodeName === 'A' ) {
     *     console.log( 'It\'s a link!' );
     *   }
     * }).addListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, function( data ){
     *   if ( data.currentNode.nodeName === 'DIV' ) {
     *     console.log( 'It\'s a DIV!' );
     *   }
     * });
     *
     * serializer.trigger( HTMLParser.Serializer.Events.ON_TAG_OPEN, {
     *   currentNode: document.getElementById( 'container' )
     * });
     *
     * @see module:HTMLParser.Serializer.Events
     */
    trigger: function( eventName, data ){
      var isEventValid = typeof eventName === 'string',
          isDataValid = typeof data === 'object' || typeof data === 'undefined';

      if ( isEventValid ) {
        if ( hasProperty.call( this._events, eventName ) ) {
          if ( isDataValid ) {
            var evt = this._events[ eventName ];
            if ( evt.length ) {
              data = data || {};
              for ( var i = 0; i < evt.length; i++ ) {
                evt[ i ]( data );
              } // for
              return true;
            } else {
              return false;
            } // if..else
          } else {
            throw new TypeError( 'It was expected a literal object for the data argument.' );
          } // if..else
        } else {
          throw new ReferenceError( 'The required event "' + eventName + '" is not supported.' );
        } // if..else
      } else {
        throw new TypeError( 'It was expected a string for the eventName argument.');
      } // if..else
    } // trigger()
  };

  /**
   * Enum for the events supported by the `Serializer` class.
   *
   * @name Events
   * @static
   * @readOnly
   * @property {string} ON_START It's fired only once, just before any node is parsed
   * @property {string} ON_TAG_OPEN It's fired each time a new opening tag is parsed
   * @property {string} ON_TAG_CLOSE It's fired each time a closing tag is parsed
   * @property {string} ON_TEXT It's fired each time a text node is parsed
   * @property {string} ON_FINISH It's fired only once, just after all the nodes have been parsed
   * @property {string} ON_ERROR It's fired when the DOM generates an exception
   * @memberOf module:HTMLParser.Serializer
   */
  HTMLParser.Serializer.Events = {
    ON_START: 'onStart',
    ON_TAG_OPEN: 'onTagOpen',
    ON_TAG_CLOSE: 'onTagClose',
    ON_TEXT: 'onText',
    ON_FINISH: 'onFinish',
    ON_ERROR: 'onError'
  };
