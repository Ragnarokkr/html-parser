/* grunt-jsdoc */

module.exports = function( grunt ){
'use strict';
  grunt.registerMultiTask('jsdoc', 'Generate JSDoc documentation from sources', function(){
    var path = require('path'),
        files = grunt.file.expand( this.data ),
        options = this.options(),
        settings = {
          configure: function( file ){
            return ['-c', path.normalize(file)];
          },
          destination: function( destPath ){
            return ['-d', destPath ];
          },
          showPrivate: function(){
            return ['-p'];
          }
        },
        args = [];

    Object.keys( options ).forEach( function( opt ){
      if ( settings.hasOwnProperty( opt ) ) {
        args.push( settings[ opt ]( options[ opt ] ) );
      } // if
    });

    args.push( grunt.util.toArray(files) );

    grunt.util.spawn({
      cmd: path.resolve('./node_modules/jsdoc/jsdoc'),
      args: grunt.util._(args).flatten()
    }, function(){});
  });
};
