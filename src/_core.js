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
