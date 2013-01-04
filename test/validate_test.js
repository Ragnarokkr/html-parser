/*jshint devel:true, globalstrict:true */
/*global strictEqual:false, expect:false, test:false */

// This test checks only whether every member of HTMLParser namespace
// (included) is of the expected type and publicly available.

'use strict';

module( 'Validate Test' );
test( 'HTMLParser presence', function(){
  expect( 1 );
  strictEqual(typeof HTMLParser, 'object', 'it should be a literal object');
});
test( 'Utilities presence', function(){
  expect( 1 );
  strictEqual(typeof HTMLParser.defaults, 'function', 'it should be a function');
});
test( 'Serializer class presence', function(){
  expect( 1 );
  strictEqual(typeof HTMLParser.Serializer, 'function', 'it should be a function');
});
test( 'Serializer.Events presence', function(){
  expect( 1 );
  strictEqual(typeof HTMLParser.Serializer.Events, 'object', 'it should be a literal object');
});
test( 'Parser presence', function(){
  expect( 1 );
  strictEqual(typeof HTMLParser.Parser, 'function', 'it should be a function');
});
