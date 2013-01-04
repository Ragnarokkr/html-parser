/*jshint devel:true, globalstrict:true */
/*global test:false, expect:false, ok:false, strictEqual:false, throws:false */

'use strict';

module( 'Parser Test', {
  setup: function(){
    //var self = this;
    this.serializer = new HTMLParser.Serializer();
    this.options = { ignoreWhitespace: true, ignoreRootNode: false };
    //this.results = '';

    this.serializer.addListener( HTMLParser.Serializer.Events.ON_START, function( data ){
      data.buffer = '{started}';
    }).addListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, function( data ){
      data.buffer += '{tag opened: ' + data.currentNode.nodeName + '}';
    }).addListener( HTMLParser.Serializer.Events.ON_TAG_CLOSE, function( data ){
      data.buffer += '{tag closed: ' + data.currentNode.nodeName + '}';
    }).addListener( HTMLParser.Serializer.Events.ON_TEXT, function( data ){
      data.buffer += '{text: ' + data.currentNode.textContent + '}';
    }).addListener( HTMLParser.Serializer.Events.ON_FINISH, function( data ){
      data.buffer += '{finished}';
    });
  },
  teardown: function(){
    this.options = { ignoreWhitespace: true, ignoreRootNode: false };
  }
});
test( 'instantiation', function(){
  expect( 1 );
  var iterator = document.getElementById( 'para' ),
      parser = new HTMLParser.Parser( iterator, this.serializer, this.options );

  ok( parser instanceof HTMLParser.Parser, 'should be an instance of HTMLParser.Parser()' );
});
test( 'parsing #para', function(){
  expect( 1 );
  var expectedResult = '{started}{tag opened: DIV}{tag opened: P}{tag opened: STRONG}' +
        '{text: Paragraph}{tag closed: STRONG}{text:  is a phrase delimited by a period.}'+
        '{tag closed: P}{tag closed: DIV}{finished}',
      iterator = document.getElementById( 'para' ),
      parser = new HTMLParser.Parser( iterator, this.serializer, this.options );

  parser.parse();
  strictEqual( parser.getResults(), expectedResult, 'should generates "' + expectedResult + '" as result' );
});
test( 'parsing #ulist', function(){
  expect( 1 );
  var expectedResult = '{started}{tag opened: DIV}{tag opened: UL}{tag opened: LI}{tag opened: A}' +
        '{text: item1}{tag closed: A}{tag closed: LI}{tag closed: UL}{tag closed: DIV}{finished}',
      iterator = document.getElementById( 'ulist' ),
      parser = new HTMLParser.Parser( iterator, this.serializer, this.options );

  parser.parse();
  strictEqual( parser.getResults(), expectedResult, 'should generates "' + expectedResult + '" as result' );
});
test( 'parsing #table', function(){
  expect( 1 );
  var expectedResult = '{started}{tag opened: DIV}{tag opened: TABLE}{tag opened: TBODY}'+
        '{tag opened: TR}{tag opened: TD}{text: c1}{tag closed: TD}{tag opened: TD}{text: c2}'+
        '{tag closed: TD}{tag opened: TD}{text: c3}{tag closed: TD}{tag closed: TR}{tag closed: TBODY}'+
        '{tag closed: TABLE}{tag closed: DIV}{finished}',
      iterator = document.getElementById( 'table' ),
      parser = new HTMLParser.Parser( iterator, this.serializer, this.options );

  parser.parse();
  strictEqual( parser.getResults(), expectedResult, 'should generates "' + expectedResult + '" as result' );
});
test( 'exceptions (wrong,correct,correct)', function(){
  expect( 1 );
  throws(
    function(){
      var parser = new HTMLParser.Parser( 1, this.serializer, this.options );
      parser.parse(); // THIS SHOULD NEVER BE EXECUTED!!
    },
    /iterator/,
    'raised error message should contains "iterator"'
  );
});
test( 'exceptions (correct,wrong,correct)', function(){
  expect( 1 );
  throws(
    function(){
      var iterator = document.getElementById( 'para' ),
          parser = new HTMLParser.Parser( iterator, 1, this.options );
      parser.parse(); // THIS SHOULD NEVER BE EXECUTED!!
    },
    /serializer/,
    'raised error message should contains "serializer"'
  );
});
test( 'exceptions (correct,correct,wrong)', function(){
  expect( 1 );
  throws(
    function(){
      var iterator = document.getElementById( 'para' ),
          parser = new HTMLParser.Parser( iterator, this.serializer, 1 );
      parser.parse(); // THIS SHOULD NEVER BE EXECUTED!!
    },
    /options/,
    'raised error message should contains "options"'
  );
});
test( 'exceptions - trigger emtpy `onError` event\'s chain', function(){
  expect( 1 );
  throws(
    function(){
      var iterator = document.getElementById( 'para' ),
          parser = new HTMLParser.Parser( iterator, this.serializer, this.options );
      this.serializer.addListener( HTMLParser.Serializer.Events.ON_FINISH, function(){
        throw new Error( 'RAISED BY ME!' );
      });
      parser.parse();
    },
    /RAISED BY ME!/,
    'custom raised error message should contains "RAISED BY ME!"'
  );
});
test( 'exceptions - trigger `onError` event', function(){
  expect( 1 );
  var iterator = document.getElementById( 'para' ),
      parser = new HTMLParser.Parser( iterator, this.serializer, this.options );
      //self = this;

  this.serializer.addListener( HTMLParser.Serializer.Events.ON_FINISH, function(){
    throw new Error( 'RAISED BY ME!' );
  }).addListener( HTMLParser.Serializer.Events.ON_ERROR, function( data ){
    data.buffer = data.error + '';
  });
  parser.parse();

  ok( /RAISED BY ME!/.test( parser.getResults() ), 'should generates a result containing "RAISED BY ME!"' );
});
