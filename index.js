#!/usr/bin/env node
"use strict";
var shell = require("shelljs");
var path = require("path");

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

    if (!packageJson.frontendDependencies.target) {
        fail("No 'frontendDependencies.target' key in package.json");
    }

    if (!packageJson.frontendDependencies.packages) {
        fail("No 'frontendDependencies.packages' key in package.json");
    }

    var packages = packageJson.frontendDependencies.packages || [];
    for (var i = 0; i < packages.length; i++) {
        var packageName = packages[i].split("/").slice(0, 1)[0];
        var desiredFilesGlob = packages[i].split("/").slice(1).join("/") || "/*";
        var modulePath = path.join(workDir, "node_modules", packageName);
        var desiredFilesPath = path.join(modulePath, desiredFilesGlob);
        var targetPath = path.join(workDir, packageJson.frontendDependencies.target, packageName);

        if (!shell.test("-d", modulePath)) {
            fail("Module not found or not a directory: " + modulePath);
        }

        shell.mkdir("-p", targetPath);
        shell.cp("-r", desiredFilesPath, targetPath);
    }


}

function fail(reason) {
    console.log(reason);
    process.exit(1);
}