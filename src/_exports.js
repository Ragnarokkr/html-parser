  // Exposes the namespace to the running environment
  if ( typeof exports !== 'undefined' ) {
    if ( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = HTMLParser;
    } // if
    exports.HTMLParser = HTMLParser;
  } else {
    globals.HTMLParser = HTMLParser;
  } // if..else
