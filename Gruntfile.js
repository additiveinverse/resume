/*global module:false*/
module.exports = function(grunt) {
	var name    = '<%= pkg.name %>-v<%= pkg.version%>';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		app: {
			root: 'app/',
				JS: 'app/js/',
				LESS: 'app/less/',
				IMG: {
					root: 'app/image/',
					dist: 'app/image/dist/',
					src: 'app/image/src/',
				}
		},
		prod: {
			root: 'gh-pages/',
			IMG: 'gh-pages/img/',
			JS: 'gh-pages/js/', 
			CSS: 'gh-pages/css/'
		},
		bower: 'bower_components/',
		jshint: {
			sitefiles: {
				src: '<%= prod.JS %>*.js'
			},
			gruntfile: {
				src: 'Gruntfile.js'
			}
		},
		less: {
			dev: {
				options: {
					path: '<%= app.LESS %>',
					cleancss: false
				},
				files: '<%= app.LESS %>*.less'
			},
			prod: {
				options: {
					path: '<%= app.LESS %>',
					compress: true,
					cleancss: true
				},
				files: '<%= app.LESS %>/*.less'
			}
		},
		jade: {
			compile: {
				options: {
					data: {
						debug: true
					},
					pretty: true
				},
				files: {
					"<%= prod.root %>index.html": "<%= app.root %>index.jade"
				}
			}
		},
		imagemin: {
			dynamic: {
				options: {
					optimizationLevel: 5,
					pngquant: true
				},
				files: [{
					expand: true,
					cwd: '<%= app.IMG.dist %>',
					src: [ '**/*.{png,jpg,gif}' ],
					dest: '<%= prod.IMG %>'
				}]
			}
		},
		copy: {
			main: {
				expand: true,
				cwd: '<%= app.JS %>',
				src: '*.js',
				dest: '<%= prod.JS %>',
				flatten: true
			},
			jslibs: {
				expand: true,
				cwd: '<%= app.bower %>',
				src: [ 'jq/dist/jquery.min.js' ],
				dest: '<%= app.JS %>',
				flatten: true
			}
		},
		open: {
			dev : {
				path: 'http://localhost:8080/gh-pages',
				app: 'Firefox'
			}
		},
		watch: {
			files: [
				'<%= app.root %>**/*',
				'Gruntfile.js'
			],
			tasks: [ 'newer:less:dev', 'copy', 'jshint' ],
			options: {
				reload: true,
				livereload: true,
				spawn: false,
				dateFormat: function( time ) {
					grunt.log.writeln('Hickory Dickory Dock the Mouse ran up the clock in ' + time + 'ms');
					grunt.log.writeln('MOAR changes... bring them you must!');
				}
			}
		}
	});

	require('matchdep').filterDev('grunt-*').forEach( grunt.loadNpmTasks );

	// Default
	grunt.registerTask('default', [ 'watch', 'open' ]);

	// Deploy
	grunt.registerTask('deploy', [ 'jade', 'less:production', 'copy', 'imagemin' ]);
};