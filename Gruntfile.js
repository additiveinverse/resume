/*global module:false*/
module.exports = function(grunt) {
	var name    = '<%= pkg.name %>-v<%= pkg.version%>',
			manifest = { '<%= prod.CSS %>layout.min.css': [  '<%= app.LESS %>normalize.less', '<%= app.LESS %>base-*.less'],
									 '<%= prod.CSS %>global.css': '<%= app.LESS %>global.less'};

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		app: {
			root: 'app/',
			LESS: 'app/less/',
			IMG: {
				root: 'app/image/',
				dist: 'app/image/dist/',
				src: 'app/image/src/',
			}
		},
		prod: {
			root: 'build/',
			IMG: 'build/img/',
			CSS: 'build/css/'
		},
		bower: 'bower_components/',
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
		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					removeAttributeQuotes: true,
					useShortDocType: true,
					collapseWhitespace: true
				},
				files: {
					'<%= prod.root %>index.html': '<%= prod.root %>index.html'
				}
			}
		},
		svgmin: {
			options: {
				plugins: [
					{ removeViewBox: false }, 
					{	removeUselessStrokeAndFill: false }
				]
			},
			dist: {
				files: [{
					expand: true,
					cwd: '<%= app.IMG.src %>',
					src: [ '**/*.svg' ],
					dest: '<%= app.IMG.dist %>'
				}]				
			}
		},
		tinyimg: {
			dynamic: {
				files: [{
					expand: true,
					cwd: '<%= app.IMG.src %>', 
					src: ['*.{png,jpg}'],
					dest: '<%= app.IMG.dist %>',
					flatten: true
				}]
			}
		},		
		copy: {
			less: {
				expand: true,
				cwd: '<%= bower %>',
				src: ['normalize-less/normalize.less', 'lesshat/build/*.less' ],
				dest: 'app/less/',
				flatten: true
			},
			img: {
				expand: true,
				cwd: '<%= app.IMG.dist %>',
				src: ['*.{png,jpg,svg}'],
				dest: '<%= prod.IMG %>',
				flatten: true
			}
		},
		connect: {
			server: {
				options: {
					port: '9001',
					base: '<%= prod.root %>',
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
		bump: {
			options: {
				files: ['package.json', 'bower.json'],
				updateConfigs: [],
				commit: true,
				commitMessage: 'Release v%VERSION%',
				commitFiles: ['package.json', 'bower.json'],
				createTag: true,
				tagName: '%VERSION%',
				tagMessage: '%VERSION%',
				push: true,
				pushTo: 'upstream',
				gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
				globalReplace: false
			}
		},
		buildcontrol: {
			options: {
				dir: 'build/',
				commit: true,
				push: true,
				message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%',
				tag: '<%= pkg.version %>',
			},
			pages: {
				options: {
					remote: '<%= pkg.respository.url %>',
					branch: 'gh-pages',
				}
			}
		},		
		watch: {
			files: [
				'<%= app.root %>**/*',
				'Gruntfile.js'
			],
			tasks: [ 'less:dev', 'newer:jade', "copy:img", "newer:tinyimg" ],
			options: {
				reload: false,
				livereload: true,
				spawn: true,
				dateFormat: function( time ) {
					grunt.log.writeln('Hickory Dickory Dock the Mouse ran up the clock in ' + time + 'ms');
					grunt.log.writeln('MOAR changes... bring them you must!');
				}
			}
		}
	});

	require('matchdep').filterDev('grunt-*').forEach( grunt.loadNpmTasks );

	// Default
	grunt.registerTask('default', [ 'connect', 'watch' ]);

	// build
	grunt.registerTask('build', [ 'tinyimg', 'copy:img', 'jade', 'htmlmin', 'less:prod'  ]);

	// deploy
	grunt.registerTask('deploy', [ 'build', 'bump:minor', 'buildcontrol' ]);	
};