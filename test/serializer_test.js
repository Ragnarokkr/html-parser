/*jshint devel:true, globalstrict:true */
/*global test:false, expect:false, ok:false, equal:false, throws:false */

'use strict';

module( 'Serializer Test' );
test( 'instantiation', function(){
  expect( 1 );
  ok(
    new HTMLParser.Serializer() instanceof HTMLParser.Serializer,
    'should be an instance of HTMLParser.Serializer()'
  );
});

module( 'Serializer Test - methods', {
  setup: function(){
    this.serializer = new HTMLParser.Serializer();
  },
  teardown: function(){
    this.serializer = new HTMLParser.Serializer();
  }
});
test( 'adding event listener', function(){
  expect( 2 );
  this.serializer
    .addListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, function(){
      // here something happens when a tag is opened
    })
    .addListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, function(){
      // here somthing else happens when a tag is opened
    })
    .addListener( HTMLParser.Serializer.Events.ON_TAG_CLOSE, function(){
      // here something obscure will happen if you don't touch your nose
      // and jump in turn on the left leg... bwahahahaha...
    });
  equal( this.serializer._events.onTagOpen.length, 2,
  'should has 2 element in onTagOpen event\'s chain' );
  equal( this.serializer._events.onTagClose.length, 1,
  'should has 1 element in onTagClose event\'s chain' );
});
test( 'removing event listener', function(){
  expect( 1 );
  var listener = function(){};
  this.serializer
    .addListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, listener )
    .removeListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, listener );
  equal( this.serializer._events.onTagOpen.length, 0,
  'should contains no listeners' );
});
test( 'removing all listener for an event', function(){
  expect( 1 );
  var listener = function(){};
  // we add 10 listeners to `onTagOpen` event
  for( var i = 0; i < 10; i++ ){
    this.serializer.addListener( HTMLParser.Serializer.Events.ON_TAG_OPEN, listener );
  } // for
  this.serializer.removeListener( HTMLParser.Serializer.Events.ON_TAG_OPEN );
  equal( this.serializer._events.onTagOpen.length, 0,
  'should contains no listeners' );
});
test( 'triggering event', function(){
  expect( 1 );
  var result = '';
  this.serializer.addListener( HTMLParser.Serializer.Events.ON_START, function( data ){
    result = data.message;
  })
  .trigger( HTMLParser.Serializer.Events.ON_START, { message: 'STARTED!' } );
  equal( result, 'STARTED!', 'should run the listener on start' );
});

module( 'Serializer Test - exceptions', {
  setup: function(){
    this.serializer = new HTMLParser.Serializer();
  }
});
test( 'addListener (wrong,correct)', function(){
  expect( 1 );
  throws(
    function(){
      this.serializer.addListener( 1, function(){} );
    },
    /eventName/,
    'raised error message should contains "eventName"'
  );
});
test( 'addListener (correct,wrong)', function(){
  expect( 1 );
  throws(
    function(){
      this.serializer.addListener( HTMLParser.Serializer.Events.ON_START, 3 );
    },
    /callback/,
    'raised error message should contains "callback"'
  );
});
test( 'removeListener (wrong,correct)', function(){
  expect( 1 );
  throws(
    function(){
      this.serializer.removeListener( 1, function(){} );
    },
    /eventName/,
    'raised error message should contains "eventName"'
  );
});
test( 'removeListener (correct,wrong)', function(){
  expect( 1 );
  throws(
    function(){
      this.serializer.removeListener( HTMLParser.Serializer.Events.ON_START, 3 );
    },
    /callback/,
    'raised error message should contains "callback"'
  );
});
test( 'trigger (wrong,correct)', function(){
  expect( 1 );
  throws(
    function(){
      this.serializer.trigger( 1, { message: 'hello' } );
    },
    /eventName/,
    'raised error message should contains "eventName"'
  );
});
test( 'trigger (correct,wrong)', function(){
  expect( 1 );
  throws(
    function(){
      this.serializer.trigger( HTMLParser.Serializer.Events.ON_START, 3 );
    },
    /data/,
    'raised error message should contains "data"'
  );
});
