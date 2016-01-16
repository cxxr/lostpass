function wrapFile(str) {
  var lines = str.split("\n");
  return lines.map(function(s) {
    return '\'' + s + '\'';
  }).join('+\n');
}

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
      },
      build: {
        src: 'target/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    copy: {
      main: {
        nonull: true,
        src: 'src/<%= pkg.name %>.js',
        dest: 'target/<%= pkg.name %>_raw.js',
        options: {
            process: function (content, srcpath) {
                return grunt.template.process(content);
            }
        }
      },
      test: { 
        nonull: true, 
        src: 'src/test.html', 
        dest: 'IGNORED'
      },
    },
    concat: {
      dist: {
        src: ['target/<%= pkg.name %>_raw.js', 'node_modules/interact.js/dist/interact.js'],
        dest: 'target/<%= pkg.name %>.js'
      }
    },
    multidest: {
      test: {
        tasks: ['copy:test'],
        dest: ['target/test.html', 'build/test.html']
      }
    },
    clean: ["target", "build"],
    replace: {
      minjs: {
        src: ['build/test.html'],
        overwrite: true,
        replacements: [{
          from: 'lostpass.js',
          to: 'lostpass.min.js'
        }]
      }
    },
    watch: {
      main: {
        files: "src/*",
        tasks: "default"
      }
    },
    assets: {
      chrome: {
        html: wrapFile(grunt.file.read('src/chrome.html', {encoding: 'utf-8'})),
        css: wrapFile(grunt.file.read('src/chrome.css', {encoding: 'utf-8'}))
      },
      firefox: {
        html: wrapFile(grunt.file.read('src/firefox.html', {encoding: 'utf-8'})),
        css: wrapFile(grunt.file.read('src/firefox.css', {encoding: 'utf-8'}))
      },
      firefox_login: {
        html: {
          osx: wrapFile(grunt.file.read('src/firefox_login_osx.html', {encoding: 'utf-8'})),
          win: wrapFile(grunt.file.read('src/firefox_login_win.html', {encoding: 'utf-8'})),
        },
        css: wrapFile(grunt.file.read('src/firefox_login.css', {encoding: 'utf-8'}))
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify'); 
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-multi-dest');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['copy:main', 'concat', 'uglify', 'multidest', 'replace']);
};
