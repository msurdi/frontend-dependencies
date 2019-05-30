#!/usr/bin/env node

"use strict";
var shell = require("shelljs");
var path = require("path");
var fs = require("fs");
var modulePathPrefix = 'node_modules/frontend-dependencies';


shell.config.fatal = true;
module.exports = frontendDependencies;


if (require.main === module) frontendDependencies();


// main function
function frontendDependencies(workDir) {

    // prepare everything
    workDir = workDir || process.cwd();
    var packageJson = getAndValidatePackageJson(workDir);
    var packages = packageJson.frontendDependencies.packages || [];


     // install all packages via npm
    var npmPackageList =""
    for (var pkgName in packages) {
        var pkg = packages[pkgName];
        npmPackageList += getNpmPackageString(pkg, pkgName);
    }

    // npm install options:
    // * --no-save: ignore automatic dependencies adding (since npm 5) to the package.json on "npm i"
    // * --production: do not install dev dependencies as we need only some files from the npm module folders itselfe
    //   actually we also do not need any regual dependencies, but there is currently no option to disable that
    // * --prefix folderPath: store dependencies in a separate folder, so there will be no interference between the
    //   main "npm install" and the one from the frontendDependencies
    var npmInstallCommand = 'npm i --no-save --no-optional --production  --prefix '+ modulePathPrefix + ' ' + npmPackageList;
    log('build the "npm install" command: ' + npmInstallCommand)

    log('installing ...')
    try {
        shell.exec(npmInstallCommand);
    } catch (err) {
        fail(err);
    }


    log("copy all specified files")
    for (var pkgName in packages) {

        var pkg = packages[pkgName];

        // process further options
        var namespaced = pkg.namespaced || false;

        // all files of package are copied (src not defined)
        // => prevent namespace errors by creating a subfolder
        if (!pkg.hasOwnProperty('namespaced') && !pkg.hasOwnProperty('src')){
          namespaced = true
        }

        // prepare folder pathes
        var modulePath = getAndValidateModulePath(workDir, pkgName)
        var sourceFilesPath = path.join(modulePath, pkg.src || "/*");
        //  eg.: /opt/myProject/node_modules/jquery/dist/*
        //  eg.: /opt/myProject/node_modules/jquery/dist/{file1,file2}
        var targetPath = getAndValidateTargetPath(pkg, packageJson, workDir, pkgName);


        copyFiles(sourceFilesPath, targetPath, pkgName, namespaced);
    }
}


// helper functions

function getAndValidatePackageJson(workDir){
    var pkgJson = require(path.join(workDir, "package.json"));
    var fd = pkgJson.frontendDependencies;

    if (!fd) fail("No 'frontendDependencies' key in package.json");

    if (!fd.packages) fail("No 'frontendDependencies.packages' in package.json");

    // maybe remove this code in later versions
    if (fd.packages.constructor === Array) {
       fail("Update your package.json frontendDependencies format to > 1.0.0 syntax as explained at https://github.com/msurdi/frontend-dependencies");
    }
    return pkgJson;
}


function getNpmPackageString(pkg, pkgName){
    // list of npm commands: https://docs.npmjs.com/cli/install

    if (pkg.url) {
        /* install via url
        npm install <git-host>:<git-user>/<repo-name>
        npm install <git repo url>
        npm install <tarball file>
        npm install <tarball url>
        npm install <folder>
        npm install <githubname>/<githubrepo>[#<commit-ish>]
        npm install github:<githubname>/<githubrepo>[#<commit-ish>]
        npm install gist:[<githubname>/]<gistID>[#<commit-ish>]
        npm install bitbucket:<bitbucketname>/<bitbucketrepo>[#<commit-ish>]
        npm install gitlab:<gitlabname>/<gitlabrepo>[#<commit-ish>]
        */
        return pkg.url + " ";
    } else { // pkg.version might be present or not
        /* install via package name
        npm install [<@scope>/]<name>
        npm install [<@scope>/]<name>@<tag>
        npm install [<@scope>/]<name>@<version>
        npm install [<@scope>/]<name>@<version range>
        */
        if (pkg.version) pkgName += ('@"' + pkg.version + '"');
        return pkgName + " ";
    }
}





function getAndValidateModulePath(workDir, pkgName){
   var mdPath = path.join(workDir, modulePathPrefix, "node_modules/", pkgName);
   if (!shell.test("-d", mdPath)) fail("Module not found or not a directory: " + mdPath);
   return mdPath
   //  eg.: /opt/myProject/node_modules/jquery
}


function getAndValidateTargetPath(pkg, packageJson, workDir, pkgName){
   var tarPath = null
   if (pkg.hasOwnProperty('target')) { // specific target?
       tarPath = pkg.target
   } else { // or try default path
       if (!packageJson.frontendDependencies.target) {
           fail("No 'frontendDependencies.target' key in package.json");
       }
       tarPath = packageJson.frontendDependencies.target;
   }
   return path.join(workDir, tarPath);
   //  eg.: /opt/myProject/build/static
}


function copyFiles (sourceFilesPath, targetPath, pkgName, namespaced){

   // put target into a subfolder with package name?
   if (namespaced) targetPath = path.join(targetPath, pkgName);

   shell.mkdir("-p", targetPath);
   log("copy " + sourceFilesPath + " to " + targetPath)
   shell.cp("-r", sourceFilesPath, targetPath);
}


function fail(reason) {
    console.log(reason);
    process.exit(1);
}

function log(message) {
   var blue = '\x1b[34m';
   var black = '\x1b[0m';
   console.log(blue, '[frontend-dependencies]: ' + message, black)
}
