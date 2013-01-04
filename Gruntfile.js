/*global module:false */
module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* ECMAScript 5 compliant version\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      lib: ['./lib'],
      jsdoc: ['./doc/**/*.*', './doc/scripts', './doc/styles'],
      markdown: ['./md/**/*.*']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      lib: {
        src: [
          'src/_intro.js',
          'src/_core.js',
          'src/_serializer.js',
          'src/_parser.js',
          'src/_exports.js',
          'src/_outro.js'
        ],
        dest: 'lib/<%= pkg.name %>.js'
      }
    },
    jsdoc: {
      options: {
        configure: '.jsdocrc',
        destination: './doc/',
        showPrivate: true
      },
      files: ['./README.md', '<%= concat.lib.dest %>']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      source: {
        src: ['<%= concat.lib.dest %>']
      },
      test: {
        src: ['test/**/*_test.js']
      }
    },
    markdown: {
      options: {
        dest: './md/'
      },
      files: ['./*.md']
    },
    qunit: {
      files: ['test/**/*.html']
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      lib: {
        src: '<%= concat.lib.dest %>',
        dest: 'lib/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      source: {
        files: ['<%= concat.lib.src %>'],
        tasks: ['clean:lib', 'concat', 'jshint:source', 'jshint:test', 'qunit', 'clean:jsdoc', 'jsdoc']
      },
      test: {
        files: ['<%= jshint.test.src %>', '<%= qunit.files %>'],
        tasks: ['jshint:test', 'qunit']
      },
      markdown: {
        files: ['<%= markdown.files %>'],
        tasks: ['clean:markdown', 'markdown', 'clean:jsdoc', 'jsdoc']
      }
    }
  });

  // Grunt-Contrib Tasks
  Object.keys(grunt.config('pkg').devDependencies).forEach(function(dep){
    if (/^grunt\-/i.test(dep)) {
      grunt.loadNpmTasks( dep );
    } // if
  });

  // Custom Tasks
  grunt.loadTasks( 'tasks' );

  // Default task.
  grunt.registerTask('default', ['clean', 'concat', 'jshint', 'qunit', 'uglify', 'jsdoc']);
  // Test task.
  grunt.registerTask('test', [ 'qunit' ]);
  // Documenting task.
  grunt.registerTask('documenting', ['jsdoc']);
};
