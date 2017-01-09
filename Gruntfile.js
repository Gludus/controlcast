'use strict';
const fs = require('fs');
const appVersion = require('./package.json').version;
const electronVersion = require('./package.json').devDependencies.electron.replace('^', '');
const releaseUrl = require('./package.json').releaseUrl;
const certPassword = require('../CodeSigningPassword.json').password;

module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    'electron-packager': {
      build: {
        options: (platform, arch) => {
          return {
            platform,
            arch,
            asar: false,
            prune: true,
            icon: './app/images/icon.ico',
            ignore: '^/.idea|^/build|^/dist|^/node_modules/(electron-*|' +
            'grunt|grunt-*|rmdir)|^/Gruntfile.js|^/clr/assets/images/*',
            dir: '.',
            out: './build',
            name: 'ControlCast',
            version: electronVersion,
            overwrite: true,
            'version-string': {
              CompanyName: 'DBKynd',
              LegalCopyright: 'Copyright (C) 2016 DBKynd',
              FileDescription: 'ControlCast',
              OriginalFilename: 'ControlCast.exe',
              ProductName: 'ControlCast',
              InternalName: 'ControlCast',
            },
            'app-copyright': 'Copyright (C) 2016 DBKynd',
            'app-version': appVersion,
            'build-version': appVersion,
          };
        },
      },
    },
    shell: {
      rebuild: {
        command: (arch, module) => `node-gyp rebuild --target=${electronVersion} --arch=${arch}` +
        ` --dist-url=https://atom.io/download/atom-shell --directory=./node_modules/${module}`,
      },
    },
    'create-windows-installer': {
      ia32: {
        appDirectory: `./build/ControlCast-win32-ia32`,
        outputDirectory: './dist/win32/x86',
        exe: `ControlCast.exe`,
        authors: 'DBKynd',
        loadingGif: './loading.gif',
        iconUrl: 'https://raw.githubusercontent.com/dbkynd/controlcast/master/images/icon.ico',
        setupIcon: './app/images/icon.ico',
        noMsi: true,
        remoteReleases: `${releaseUrl}`, // /win32/x86`,
        certificateFile: '../DBKynd.pfx',
        certificatePassword: certPassword,
      },
      x64: {
        appDirectory: `./build/ControlCast-win32-x64`,
        outputDirectory: './dist/win32/x64',
        exe: `ControlCast.exe`,
        authors: 'DBKynd',
        loadingGif: './loading.gif',
        iconUrl: 'https://raw.githubusercontent.com/dbkynd/controlcast/master/images/icon.ico',
        setupIcon: './app/images/icon.ico',
        noMsi: true,
        remoteReleases: `${releaseUrl}`, // /win32/x64`,
        certificateFile: '../DBKynd.pfx',
        certificatePassword: certPassword,
      },
    },
    clean: [
      './build/',
      './dist/',
    ],
  });
  grunt.loadNpmTasks('grunt-electron-packager');
  grunt.loadNpmTasks('grunt-electron-installer');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('rebuild_ia32', [
    'shell:rebuild:ia32:robotjs',
    'shell:rebuild:ia32:midi',
    'shell:rebuild:ia32:usb-detection',
  ]);
  grunt.registerTask('rebuild_x64', [
    'shell:rebuild:x64:robotjs',
    'shell:rebuild:x64:midi',
    'shell:rebuild:x64:usb-detection',
  ]);
  grunt.registerTask('build_ia32', [
    'rebuild_ia32',
    'electron-packager:build:win32:ia32',
  ]);
  grunt.registerTask('build_x64', [
    'rebuild_x64',
    'electron-packager:build:win32:x64',
  ]);
  grunt.registerTask('createInstaller_ia32', [
    'create-windows-installer:ia32',
    'rename:win32:x86',
  ]);
  grunt.registerTask('createInstaller_x64', [
    'create-windows-installer:x64',
    'rename:win32:x64',
  ]);

  grunt.registerTask('rename', 'Rename the Setup.exe file after building installer.', (platform, arch) => {
    fs.rename(`./dist/win32/${arch}/Setup.exe`, `./dist/win32/${arch}/ControlCast_${appVersion}_${arch}.exe`);
  });

  grunt.registerTask('default', [
    'clean',
    'build_ia32',
    'build_x64',
    'createInstaller_ia32',
    'createInstaller_x64',
  ]);
};
