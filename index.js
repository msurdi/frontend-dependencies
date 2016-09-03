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
        var packageName = packages[i];
        var sourcePath = path.join(workDir, "node_modules", packageName);
        var targetPath = path.join(workDir, packageJson.frontendDependencies.target);

        if (!shell.test("-d", sourcePath)) {
            fail("Module not found or not a directory: " + sourcePath);
        }

        shell.mkdir("-p", targetPath);
        shell.cp("-r", sourcePath, targetPath);
    }


}

function fail(reason) {
    console.log(reason);
    process.exit(1);
}