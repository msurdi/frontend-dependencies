#!/usr/bin/env node

"use strict";
var shell = require("shelljs");
var path = require("path");
var fs = require("fs");

module.exports = frontendDependencies;

shell.config.fatal = true;

if (require.main === module) {
    frontendDependencies();
}

function frontendDependencies(workDir) {

    // prepare everything
    if (!workDir) {
        workDir = process.cwd();
    }
    var packageJson = require(path.join(workDir, "package.json"));
    if (!packageJson.frontendDependencies) {
        fail("No 'frontendDependencies' key in package.json");
    }
    if (!packageJson.frontendDependencies.packages) {
        fail("No 'frontendDependencies.packages' in package.json");
    }
    var packages = packageJson.frontendDependencies.packages || [];



    // per package: install and copy specified files
    for (var pkgName in packages) {

        var pkg = packages[pkgName];


        /*---------------- npm install: get the package ------------------------*/
        if (pkg.url) {
            npmInstallPkgUrl(pkg.url);
        } else { // pkg.version might be present or not
            npmInstallPkgName(pkgName, pkg.version);
        }



        /*------------------- prepare folder pathes ---------------------------*/
        var modulePath = path.join(workDir, "node_modules", pkgName);
        if (!shell.test("-d", modulePath)) {
            fail("Module not found or not a directory: " + modulePath);
        }
        //  eg.: /opt/myProject/node_modules/jquery


        var sourceFilesPath = path.join(modulePath, pkg.src || "/*");
        //  eg.: /opt/myProject/node_modules/jquery/dist/*
        //  eg.: /opt/myProject/node_modules/jquery/dist/{file1,file2}


        var targetPath = null;
        if (pkg.hasOwnProperty('target')) { // specific target?
            targetPath = pkg.target
        } else { // or try default path
            if (!packageJson.frontendDependencies.target) {
                fail("No 'frontendDependencies.target' key in package.json");
            }
            targetPath = packageJson.frontendDependencies.target;
        }
        targetPath = path.join(workDir, targetPath);
        //  eg.: /opt/myProject/build/static



        /*----------------- process further options -----------------------*/
        var exact = pkg.hasOwnProperty('exact') && pkg.exact == true;




        /*-------------------- copy specified files ----------------------*/

        if (exact) {
            var sourceIsFile = false;
            try {
                sourceIsFile = fs.lstatSync(sourceFilesPath).isFile()
            } catch (e) { /* don't care */ }

            if (sourceIsFile) {
                // if source is a file, create the target parent directory
                shell.mkdir("-p", path.dirname(targetPath));
            } else {
                // if source is a directory, create the full target path
                shell.mkdir("-p", targetPath)
            }
        } else {
            targetPath = path.join(targetPath, pkgName);
            shell.mkdir("-p", targetPath);
        }
        shell.cp("-r", sourceFilesPath, targetPath);


    }
}



// https://docs.npmjs.com/files/package.json#dependencies


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
function npmInstallPkgUrl(url) {
    tryCommand('npm i ' + url)
}

/* Install via package name
npm install [<@scope>/]<name>
npm install [<@scope>/]<name>@<tag>
npm install [<@scope>/]<name>@<version>
npm install [<@scope>/]<name>@<version range>
*/
function npmInstallPkgName(pkgName, version) {
    var command = 'npm i ' + pkgName;
    if (!version) command += ('@' + version);
    tryCommand(command)
}

function tryCommand(command) {
    try {
        shell.exec(command);
    } catch (err) {
        fail(err)
    }
}

function fail(reason) {
    console.log(reason);
    process.exit(1);
}
