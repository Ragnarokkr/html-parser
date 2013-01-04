/*jshint devel:true, globalstrict:true */
/*global test:false, expect:false, throws:false, deepEqual:false */

// This test attemps to carry out checks on a sample of as possible as
// ordinary types of correct and wrong parameters.

'use strict';

module( 'Utilities Test' );
test( 'defaults (wrong,wrong)', function(){
  expect( 1 );
  throws(
    function(){
      HTMLParser.defaults( 1, 10 );
    },
    /objDest/,
    'raised an error message containing "objDest"'
  );
});
test( 'defaults (correct,wrong)', function(){
  expect( 1 );
  throws(
    function(){
      HTMLParser.defaults( { prop: true }, 10 );
    },
    /objDefaults/,
    'raised an error message containing "objDefaults"'
  );
});
test( 'defaults (wrong,correct)', function(){
  expect( 1 );
  throws(
    function(){
      HTMLParser.defaults( 1, { prop: true } );
    },
    /objDest/,
    'raised an error message containing "objDest"'
  );
});
test( 'defaults (correct,correct)', function(){
  expect( 1 );
  deepEqual(
    HTMLParser.defaults(
      {
        prop1: true,
        prop3: 'world'
      },
      {
        prop1: false,
        prop2: true,
        prop3: 'hello'
      }
    ),
    {
      prop1: true,
      prop2: true,
      prop3: 'world'
    },
    'should returns a literal object, mixin of destination and defaults'
  );
});
