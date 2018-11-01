module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                sourceMap: true
            },
            build: {
                files: [{
                    src: 'assetsDist/app.bundle.js',
                    dest: 'assetsDist/app.bundle.min.js'
                }]
            }
        },
        less: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                cleancss: true
            },
            all: {
                files: [{
                    src: 'less/init.less',
                    dest: 'assetsDist/default.css'
                }]
            }
        },
        clean: {
            build: ['assetsDist/app.bundle.js', 'assetsDist/default.css']
        },
        watch: {
            scripts: {
                files: ['js/**/*.js', 'less/**/*.less', 'json/**/*.json', 'src/**/*.html', 'assets/**/*.svg', '*.html'],
                tasks: ['default'],
                options: {
                    spawn: false
                }
            }
        },
        browserify: {
            build: {
                files: {
                    'assetsDist/app.bundle.js': 'js/app.js'
                },
                options: {
                    transform: [['babelify', { presets: "es2015" }]],
                    browserifyOptions: {
                        debug: true
                    }
                }
            }
        },
        notify: {
            build: {
                options: {
                    title: 'Grunt watch', // optional
                    message: 'Build complete' // required
                }
            }
        },
        replace: {
            inlineSvg: {
                options: {
                    patterns: [{
                        match: 'troopSvg',
                        replacement: '<%= grunt.file.read("assets/troopIcons/soldier.svg") %>'
                    }, {
                        match: 'customCharacterSvg',
                        replacement: '<%= grunt.file.read("assets/avatarSvg/custom.svg") %>'
                    }, {
                        match: 'logo',
                        replacement: '<%= grunt.file.read("assets/logo.svg") %>'
                    }, {
                        match: 'settingsIcon',
                        replacement: '<%= grunt.file.read("assets/mainMenuIcons/settings.svg") %>'
                    }, {
                        match: 'newGameIcon',
                        replacement: '<%= grunt.file.read("assets/mainMenuIcons/newGame.svg") %>'
                    }, {
                        match: 'tutorialIcon',
                        replacement: '<%= grunt.file.read("assets/mainMenuIcons/tutorial.svg") %>'
                    }, {
                        match: 'characterEditorIcon',
                        replacement: '<%= grunt.file.read("assets/mainMenuIcons/editor.svg") %>'
                    }]
                },
                files: [{
                    src: ['src/index.html'],
                    dest: 'index.html'
                }]
            },
            inlineModalSvgs: {
                options: {
                    patterns: [{
                        match: 'cannonSvg',
                        replacement: '<%= grunt.file.read("assets/troopIcons/cannon.svg") %>'
                    }, {
                        match: 'horseSvg',
                        replacement: '<%= grunt.file.read("assets/troopIcons/horse.svg") %>'
                    }, {
                        match: 'troopSvg',
                        replacement: '<%= grunt.file.read("assets/troopIcons/soldier.svg") %>'
                    }, {
                        match: 'loadingSvg',
                        replacement: '<%= grunt.file.read("assets/loading.svg") %>'
                    }, {
                        match: 'patchLoadingSvg',
                        replacement: '<%= grunt.file.read("assets/patchLoading.svg") %>'
                    }, {
                        match: 'customCharacterSvg',
                        replacement: '<%= grunt.file.read("assets/avatarSvg/custom.svg") %>'
                    }]
                },
                files: [{
                    src: ['src/attackModal.html'],
                    dest: 'attackModal.html'
                }, {
                    src: ['src/turnPresentationModal.html'],
                    dest: 'turnPresentationModal.html'
                }, {
                    src: ['src/cardTurnInModal.html'],
                    dest: 'cardTurnInModal.html'
                }, {
                    src: ['src/autoUpdaterModal.html'],
                    dest: 'autoUpdaterModal.html'
                }, {
                    src: ['src/characterSelectionModal.html'],
                    dest: 'characterSelectionModal.html'
                }]
            }
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                metadata: '',
                regExp: false
            }
        }
    });
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-bump');

    // Default task for building
    grunt.registerTask('default', [
        'clean:build', // Clean previous build files
        'browserify:build', // Use browserify to transpile ES6 source code with babel
        // 'uglify', // Minify and uglify css and put it in build folder
        'less', // Compile CSS files and put them in build folder
        'replace:inlineModalSvgs',
        'replace:inlineSvg',
        'notify:build'
    ]);
};