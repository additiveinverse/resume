/*global module:false*/
module.exports = function(grunt) {
	var name    = '<%= pkg.name %>-v<%= pkg.version%>',
			manifest = { '<%= prod.CSS %>layout.min.css': [  '<%= app.LESS %>normalize.less', '<%= app.LESS %>base-*.less'],
    							 '<%= prod.CSS %>global.css': '<%= app.LESS %>global.less'};

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
				files: manifest
			},
			prod: {
				options: {
					path: '<%= app.LESS %>',
					compress: true,
					cleancss: true
				},
				files: manifest
			}
		},
		jsonlint: {
			sample: {
				src: [ '<%= app.root %>*.json' ]
			}
		},
		jade: {
			dev: {
				options: {
					data: function(dest, src) {
						// Return an object of data to pass to templates
						return require('./app/data.json');
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
			less: {
				expand: true,
				cwd: 'bower_components/',
				src: ['/normalize-less/normalize.less'],
				dest: 'app/less/',
				flatten: true
			},
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
		connect: {
			server: {
				options: {
					port: '9001',
					base: 'gh-pages',
					protocol: 'http',
					hostname: 'localhost',
					livereload: true,
					open: {
						target: 'http://localhost:9001/', // target url to open
						appName: 'Firefox'
					},
				}
			}
		},
		watch: {
			files: [
				'<%= prod.root %>**/*',
				'<%= app.root %>**/*',
				'Gruntfile.js'
			],
			tasks: [ 'newer:less:dev', 'newer:jade' ],
			options: {
				reload: true,
				livereload: true,
				spawn: false,
				dateFormat: function( time ) {
					grunt.log.writeln('Hickory Dickory Dock the Mouse ran up the clock in ' + time + 'ms');
					grunt.log.writeln('MOAR changes... bring them you must!');
				}
			}
		},
		concurrent: {
			target: {
				tasks: ['newer:less:dev', 'newer:jade'],
				options: {
					logConcurrentOutput: true
				}
			}
		}
	});

	require('matchdep').filterDev('grunt-*').forEach( grunt.loadNpmTasks );

	// Default
	grunt.registerTask('default', [ 'connect', 'watch' ]);

	// Deploy
	grunt.registerTask('deploy', [ 'jade', 'less:production', 'copy', 'imagemin' ]);
};