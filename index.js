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
    if (!workDir) {
        workDir = process.cwd();
    }

    var packageJson = require(path.join(workDir, "package.json"));

    if (!packageJson.frontendDependencies) {
        fail("No 'frontendDependencies' key in package.json");
    }

    if (!packageJson.frontendDependencies.packages) {
        fail("No 'frontendDependencies.packages' key in package.json");
    }

    var packages = packageJson.frontendDependencies.packages || [];
    for (var i = 0; i < packages.length; i++) {
        // set defaults
        var targetPath = null;
        var exact = false;
        var entry = packages[i];

        // new optional syntax that lets each entry have a different target
        if (typeof entry === "object") {
            if(!entry.hasOwnProperty('src')) {
                fail("Entry missing src key");
            }

            if(entry.hasOwnProperty('target')) {
                targetPath = entry.target
            }

            exact = entry.hasOwnProperty('exact') && entry.exact == true;
            entry = entry.src;
        }

        // set a default target if not set via object
        if (!targetPath) {
            if(!packageJson.frontendDependencies.target) {
                fail("No 'frontendDependencies.target' key in package.json");
            }
            targetPath = packageJson.frontendDependencies.target;
        }


        var packageName = entry.split("/").slice(0, 1)[0];
        var desiredFilesGlob = entry.split("/").slice(1).join("/") || "/*";
        var modulePath = path.join(workDir, "node_modules", packageName);
        var desiredFilesPath = path.join(modulePath, desiredFilesGlob);
        targetPath = path.join(workDir, targetPath);

        if (!shell.test("-d", modulePath)) {
            fail("Module not found or not a directory: " + modulePath);
        }

        if (exact) {
            var sourceIsFile = false;
            try {
                sourceIsFile = fs.lstatSync(desiredFilesPath).isFile()
            } catch(e) { /* don't care */ }

            if (sourceIsFile) {
                // if source is a file, create the target parent directory
                shell.mkdir("-p", path.dirname(targetPath));
            } else {
                // if source is a directory, create the full target path
                shell.mkdir("-p", targetPath)
            }
            shell.cp("-r", desiredFilesPath, targetPath);
        } else {
            targetPath = path.join(targetPath, packageName);
            shell.mkdir("-p", targetPath);
            shell.cp("-r", desiredFilesPath, targetPath);
        }
    }
}

function fail(reason) {
    console.log(reason);
    process.exit(1);
}