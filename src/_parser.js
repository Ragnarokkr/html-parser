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
