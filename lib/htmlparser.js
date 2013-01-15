/*! htmlparser - v0.1.0 - 2013-01-15
* ECMAScript 5 compliant version
* https://github.com/Ragnarokkr/htmlparser
* Copyright (c) 2013 ; Licensed MIT */
(function( globals, undefined ) {
'use strict';

  // Core setup
  // ----------

  // Define some shortcut
  var ObjectProto = Object.prototype;

  // Define quick reference variables (alias)
  var hasProperty = ObjectProto.hasOwnProperty;

  /**
   * The global namespace
   * @exports HTMLParser
   */
  var HTMLParser = {};

  /**
   * Set default values for a literal object.
   *
   * Given a literal object as destination for default values (`objDest`) and a literal object
   * as source for default values (`objDefaults`), this function iterates through the
   * `objDefaults`'s properties looking if they are set into `objDest`. Only missing properties
   * in destination object will be added from source.
   *
   * @name defaults
   * @function
   * @memberOf module:HTMLParser
   *
   * @param {Object} objDest destination literal object for default values
   * @param {Object} objDefaults literal object from which to retrieve default values
   *
   * @return {Object} A reference to `objDest`. Since the destination object is passed to the
   * function by reference, accessing it directly or through the returned value gives the same
   * result.
   *
   * @throws {TypeError} If any of the passed parameters is not a literal object.
   *
   * @example
   * var
   *   defaultSettings = { prop1: true, prop2: false },
   *   settings = { prop2: true },
   *   result = HTMLParser.defaults( settings, defaultSettings );
   *
   * console.log( settings ); // --> { prop1: true, prop2: true }
   * console.log( result ); // --> { prop1: true, prop2: true }
   */
  HTMLParser.defaults = function( objDest, objDefaults ){
    var isDefaultsValid = typeof objDefaults === 'object',
        isDestValid = typeof objDest === 'object';

    if ( isDestValid && isDefaultsValid ) {
      for ( var prop in objDefaults ) {
        if ( hasProperty.call( objDefaults, prop ) && !hasProperty.call( objDest, prop ) ) {
          objDest[ prop ] = objDefaults[ prop ];
        } // if
      } // for
      return objDest;
    } else {
      if ( !isDestValid ) {
        throw new TypeError( 'It was expected a literal object for objDest argument.' );
      } // if
      if ( !isDefaultsValid ) {
        throw new TypeError( 'It was expected a literal object for objDefaults argument.' );
      } // if
    } // if
  }; // defaults()

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

  // _parser.js

  // Default options
  var defaultOptions = {
    // If true, all the text nodes containing whitespace only characters will be ignored.
    ignoreWhitespace: false,
    // If true, only sub-nodes will be parsed.
    ignoreRootNode: true
  };

  /**
   * The HTML Parser class.
   *
   * This class provides a mechanism to traverse a DOM tree, connecting the passed `iterator` to
   * the passed `serializer`.
   *
   * No actions are performed by this class, but trigger an event via serializer each time the
   * matching condition is satisfied.
   *
   * Both the methods with or without `new` keyword are supported.
   *
   * @name Parser
   * @constructor
   * @memberOf module:HTMLParser
   *
   * @param {Node} iterator an instance of DOM's `Node` class. It can be obtained by using
   * `document.getElementById()` or any other DOM method which can to return that kind of object.
   * @param {Serializer} serializer an instance of `Serializer` class or a class derived from it.
   * @param {object} [options] literal object with the instance's options
   * @param {boolean} [options.ignoreWhitespace=false] if `true` it will ignore each text node
   * containing only whitespace characters
   * @param {boolean} [options.ignoreRootNode=true] if `true` it will ignore the root node from
   * parsing
   *
   * @return {object} A self-reference to implement chaining
   *
   * @example
   * // First thing first, some quick references
   * var Serializer = HTMLParser.Serializer,
   *     Parser = HTMLParser.Parser;
   *
   * // Now, our instances
   * var iterator = document.getElementById( 'wrapper' ),
   *     serializer = new Serializer()
   *       .addListener( Serializer.Events.ON_START, function( data ){
   *         data.buffer = '';
   *       }).addListener( Serializer.Events.ON_TAG_OPEN, function( data ){
   *         data.buffer += 'A tag is open: ' + data.currentNode.nodeName + '\n';
   *       }).addListener( Serializer.Events.ON_TAG_CLOSE, function( data ){
   *         data.buffer += 'A tag is closed: ' + data.currentNode.nodeName + '\n';
   *       }).addListener( Serializer.Events.ON_TEXT, function( data ){
   *         data.buffer += 'Text: ' + data.currentNode.textContent + '\n';
   *       }),
   *     parser = new Parser( iterator, serializer, {
   *       ignoreWhitespace: true,
   *       ignoreRootNode: true
   *     }).parse();
   *
   * console.log( parser.getResults() );
   *
   * // If #wrapper node is:
   * // --------------------
   * // &lt;div id="wrapper"&gt;
   * //   &lt;p&gt;Hello, &lt;strong&gt;HTMLParser&lt;/strong&gt;!&lt;/p&gt;
   * // &lt;/div&gt;
   *
   * // The result in console should be:
   * // --------------------------------
   * // A tag is open: P
   * // Text: Hello,
   * // A tag is open: STRONG
   * // Text: HTMLParser
   * // A tag is closed: STRONG
   * // Text: !
   * // A tag is closed: P
   *
   * @see module:HTMLParser.Serializer
   */
  HTMLParser.Parser = function( iterator, serializer, options ) {
    // support for both the methods with or without the `new` keyword
    if ( !this instanceof HTMLParser.Parser ) {
      return new HTMLParser.Parser( iterator, serializer, options );
    } // if

    if ( typeof iterator === 'object' ) {
      this._iterator = iterator;
    } else {
      throw new TypeError( 'It was expected an object for iterator argument.' );
    } // if..else

    if ( serializer instanceof HTMLParser.Serializer ) {
      this._serializer = serializer;
    } else {
      throw new TypeError( 'It was expected an instance of Serializer for serializer argument' );
    } // if..else

    if ( typeof options === 'object' || typeof options === 'undefined' ) {
      this._options = HTMLParser.defaults( options || {}, defaultOptions );
    } else {
      throw new TypeError( 'It was expected a literal object for options argument.' );
    } // if..else

    // Stack to keep track of the parsed nodes
    this._treeBuffer = [];

    /**
     * Buffer to keep track of processed node and results. This is the object that will be passed
     * to every listener.
     *
     * @private
     * @name _eventData
     * @type {object}
     * @memberOf module:HTMLParser.Parser
     * @property {Node} rootNode it points always to the root node
     * @property {Node} currentNode the currently parsed node
     * @property {boolean} isRoot it states if the current node is or isn't the root
     * @property {*} buffer the internal buffer that can be used to store serialization's results; it
     * **should** be explicitly initialized before being used (for example, into `onStart` event).
     */
    this._eventData = {
      rootNode: this._rootNode,
      currentNode: null,
      isRoot: true,
      buffer: null
    };

    // support for chaining
    return this;
  }; // Parser()

  HTMLParser.Parser.prototype =
    /** @lends module:HTMLParser.Parser.prototype */
  {
    /**
     * Fires the required `eventName`.
     *
     * This function calls the `trigger()` method of the `Serializer` class, and pass the internal
     * event data buffer to the required event's listeners.
     *
     * @private
     *
     * @param {string} eventName the name of the event to fire
     *
     * @return {boolean} The result returned by the `trigger()` method of the `Serializer` class.
     */
    _fireEvent: function( eventName ){
      var currentNode = this._treeBuffer[ this._treeBuffer.length - 1 ];
      this._eventData.currentNode = currentNode;
      this._eventData.isRoot = currentNode === this._rootNode;
      return this._serializer.trigger( eventName, this._eventData );
    }, // _fireEvent()

    /**
     * DOM tree parser.
     *
     * Begins to parse from `node` by traversing the whole DOM tree.
     *
     * @private
     *
     * @param {Node} node an instance of DOM's Node class
     */
    _parseDomNode: function( node ){
      // Stores the passed `node` to be used for the event callbacks
      this._treeBuffer.push( node );

      if ( node.nodeType === Node.TEXT_NODE ) {
        // It handles text nodes according to its content and the global
        // options
        var isWhitespace = /^\s+$/.test( node.textContent );
        if ( !this._options.ignoreWhitespace ||
            ( this._options.ignoreWhitespace && !isWhitespace ) )
        {
          this._fireEvent( 'onText' );
        } // if
      } else {
        if ( node.nodeType === Node.ELEMENT_NODE ) {
          // Element nodes (TAGs) are managed here, according to the
          // global options
          var isRoot = node === this._rootNode;
          if ( !this._options.ignoreRootNode || !isRoot ||
              ( this._options.ignoreRootNode && !isRoot ) )
          {
            this._fireEvent( 'onTagOpen' );
          } // if

          if ( node.hasChildNodes() ) {
            // If children are present, it recursively iterates on them
            var nodes = node.childNodes;
            for ( var i = 0; i < nodes.length; i++ ) {
              this._parseDomNode( nodes[ i ] );
            } // for
          } // if

          if ( !this._options.ignoreRootNode || !isRoot ||
              ( this._options.ignoreRootNode && !isRoot ) )
          {
            this._fireEvent( 'onTagClose' );
          } // if
        } // if
      } // if

      // Removes the passed `node` as is no more required
      this._treeBuffer.pop();
    }, // parseDomNode()

    /**
    * Starts the parsing process.
    *
    * @throws {DOMException|object} If the DOM throws an exception and no callbacks are defined for
    * the <code>onError</code> event, the exception is re-thrown for other <code>try..catch</code> statements.
    */
    parse: function(){
      try {
        this._fireEvent( 'onStart' );
        this._parseDomNode( this._iterator );
        this._fireEvent( 'onFinish' );
      } catch ( err ) {
        // this prevents to lose the error if no listeners have been defined for `onError` event
        // by bubbling up the exception toward other listeners
        this._eventData.error = err;
        if ( !this._fireEvent( 'onError' ) ) {
          throw err;
        } // if
      } // try..catch
    }, // parse()

    /**
     * Retrieve the processing results.
     *
     * For convenience, an internal `buffer` is provided to allow to the serializer to store its
     * results in a common place. This prevents the developer to define globals to store
     * him/her data.
     *
     * @return {*} Since the buffer **should** be initialized *before* the process begins (usually
     * inside the `onStart` event), the returned type will be the one decided at initialization time.
     */
    getResults: function(){
      return this._eventData.buffer;
    } // getResults()
  };

  // Exposes the namespace to the running environment
  if ( typeof exports !== 'undefined' ) {
    if ( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = HTMLParser;
    } // if
    exports.HTMLParser = HTMLParser;
  } else {
    globals.HTMLParser = HTMLParser;
  } // if..else


}( this ));
