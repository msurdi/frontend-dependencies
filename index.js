#!/usr/bin/env node

"use strict";
var shell = require("shelljs");
var path = require("path");
var fs = require("fs");


shell.config.fatal = true;
module.exports = frontendDependencies;


if (require.main === module) frontendDependencies();


// main function
function frontendDependencies(workDir) {

    // prepare everything
    workDir = workDir || process.cwd();
    var packageJson = getAndValidatePackageJson(workDir);
    var packages = packageJson.frontendDependencies.packages || [];


    // per package: install and copy specified files
    for (var pkgName in packages) {

        var pkg = packages[pkgName];


        npmInstallPkg(pkg, pkgName);


        // prepare folder pathes
        var modulePath = getAndValidateModulePath(workDir, pkgName)
        var sourceFilesPath = path.join(modulePath, pkg.src || "/*");
        //  eg.: /opt/myProject/node_modules/jquery/dist/*
        //  eg.: /opt/myProject/node_modules/jquery/dist/{file1,file2}
        var targetPath = getAndValidateTargetPath(pkg, packageJson, workDir, pkgName);


        // process further options
        var exact = pkg.hasOwnProperty('exact') && pkg.exact == true;


        copyFiles(sourceFilesPath, targetPath, pkgName, exact);

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


function npmInstallPkg(pkg, pkgName){
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
        tryCommand('npm i ' + pkg.url);
    } else { // pkg.version might be present or not
        /* install via package name
        npm install [<@scope>/]<name>
        npm install [<@scope>/]<name>@<tag>
        npm install [<@scope>/]<name>@<version>
        npm install [<@scope>/]<name>@<version range>
        */
        var command = 'npm i ' + pkgName;
        if (pkg.version) command += ('@' + pkg.version);
        tryCommand(command);
    }
}


function tryCommand(command) {
    try {
        shell.exec(command);
    } catch (err) {
        fail(err);
    }
}


function getAndValidateModulePath(workDir, pkgName){
   var mdPath = path.join(workDir, "node_modules", pkgName);
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


function copyFiles (sourceFilesPath, targetPath, pkgName, exact){
   if (exact) {

      // I do not understand the purpose, can you explain?

      //  var sourceIsFile = false;
      //  try {
      //      sourceIsFile = fs.lstatSync(sourceFilesPath).isFile()
      //  } catch (e) { /* don't care */ }
      // if source is a file, create the target parent directory
      // if (sourceIsFile) targetPath = path.dirname(targetPath)
      // else: source is a directory, create the full target path

   } else {
       targetPath = path.join(targetPath, pkgName);
   }
   shell.mkdir("-p", targetPath);
   shell.cp("-r", sourceFilesPath, targetPath);
}


function fail(reason) {
    console.log(reason);
    process.exit(1);
}
