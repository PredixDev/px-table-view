'use strict';

var pkg = require('./package.json');
module.exports = function (grunt) {
  // Time grunt tasks
  require('time-grunt')(grunt);

  // Load all grunt tasks
  //  require('load-grunt-tasks')(grunt);
  var importOnce = require('node-sass-import-once');
  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    clean: {
      css: ['css'],
      bower: ['bower_components'],
      reports: ['reports']
    },

    sass: {
      options: {
        importer: importOnce,
        importOnce: {
          index: true,
          bower: true
        }
      },
      dist: {
        files: {
          'css/noprefix/px-table-view-sketch.css': 'sass/px-table-view-sketch.scss',
          'css/noprefix/px-table-view.css': 'sass/px-table-view-predix.scss'
        }
      },
      distrows: {
        files: {
          'css/noprefix/px-table-row-sketch.css': 'sass/px-table-row-sketch.scss',
          'css/noprefix/px-table-row.css': 'sass/px-table-row-predix.scss'
        }
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 2 versions', 'Safari 8' ]
      },
      multiple_files: {
        expand: true,
        flatten: true,
        src: 'css/noprefix/*.css',
        dest: 'css'
      }
    },

    shell: {
      bower: {
        command: 'bower install'
      },
      wct: {
        options: {
          stdout: false,
          stderr: false
        },
        command: 'wct'
      }
    },

    jshint: {
      all: [
				'Gruntfile.js',
				'js/**/*.js'
			],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    watch: {
      sass: {
        files: ['sass/**/*.scss'],
        tasks: ['sass', 'autoprefixer'],
        options: {
          interrupt: true,
          livereload: true
        }
      },
      htmljs: {
        files: ['*.html', '*.js'],
        options: {
          interrupt: true,
          livereload: true
        }
      }
    },

    depserve: {
      options: {
        open: '<%= depserveOpenUrl %>'
      }
    },
    webdriver: {
      options: {
        specFiles: ['test/*spec.js']
      },
      local: {
        webdrivers: ['chrome']
      }
    },
    concurrent: {
      devmode: {
        tasks: ['watch', 'depserve'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    cssmin: {
      target: {
        files: {
          'css/px-table-view.min.css': ['css/px-table-view.css'],
          'css/px-table-row.min.css': ['css/px-table-row.css']
        }
      }
    },
    'polymer-css-compiler': {
      target: {
        filename: '-styles',
        files: {
          './px-table-view.html': ['css/px-table-view.min.css'],
          './px-table-row.html': ['css/px-table-row.min.css']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-dep-serve');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('webdriver-support');
  grunt.loadNpmTasks('polymer-css-compiler');
  grunt.loadNpmTasks('grunt-contrib-cssmin');



  // Default task.
  grunt.registerTask('default', 'Basic build', [
    'clean:css',
		'sass',
		'autoprefixer',
    'cssmin',
    'polymer-css-compiler'
	]);

  grunt.registerTask('devmode', 'Development Mode', [
		'concurrent:devmode'
	]);

  // First run task.
  grunt.registerTask('firstrun', 'Basic first run', function () {
    grunt.config.set('depserveOpenUrl', '/index.html');
    grunt.task.run('default');
    grunt.task.run('depserve');
  });

  // Default task.
  grunt.registerTask('test', 'Test', [
		'jshint',
		'shell:wct'
	]);

  grunt.registerTask('release', 'Release', [
		'clean',
		'shell:bower',
		'default'
	]);

};
