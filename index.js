#!/usr/bin/env node

"use strict";
const shell = require("shelljs");
const path = require("node:path");
const fs = require("node:fs");
const TEMP_INSTALL_DIR = 'node_modules/frontend-dependencies/tmp';

shell.config.fatal = true;
module.exports = frontendDependencies;

if (require.main === module) frontendDependencies();

// main function
function frontendDependencies(workDir) {
    // Prepare environment
    workDir = workDir || process.cwd();
    const packageJson = getAndValidatePackageJson(workDir);
    const packages = packageJson.frontendDependencies.packages || {};
    const tempInstallPath = path.join(workDir, TEMP_INSTALL_DIR);

    installPackages(packages, tempInstallPath);
    copyAssets(packages, packageJson, workDir, tempInstallPath);
}

function installPackages(packages, tempInstallPath) {
    if (Object.keys(packages).length === 0) {
        log('No packages to install.');
        return;
    }

    // Build the list of packages to install
    const npmPackageList = Object.entries(packages)
        .map(([pkgName, pkg]) => getNpmPackageString(pkg, pkgName))
        .join('');

    // npm install options:
    // * --no-save: ignore automatic dependencies adding (since npm 5) to the package.json on "npm i"
    // * --production: do not install dev dependencies as we need only some files from the npm module folders itself.
    // * --no-fund: hide funding message
    // * --prefix folderPath: store dependencies in a separate folder to avoid interference.
    const npmInstallCommand = `npm i --no-save --no-optional --production --no-fund --prefix ${tempInstallPath} ${npmPackageList}`;
    log(`build the "npm install" command: ${npmInstallCommand}`);

    log('Installing packages...');
    try {
        shell.mkdir('-p', tempInstallPath);
        // Create a dummy package.json to satisfy npm
        fs.writeFileSync(path.join(tempInstallPath, 'package.json'), '{"description": "temp for frontend-dependencies", "repository": "_", "license": "UNLICENSED"}');
        shell.exec(npmInstallCommand);
        log('Installation complete.');
    } catch (err) {
        fail(err);
    }
}

function copyAssets(packages, packageJson, workDir, tempInstallPath) {
    log("Copying specified files...");

    for (const pkgName in packages) {
        const pkg = packages[pkgName];
        const modulePath = getAndValidateModulePath(tempInstallPath, pkgName);

        if (pkg.files && Array.isArray(pkg.files)) {
            for (const fileConfig of pkg.files) {
                const sourceFilesPath = toGlobPath(path.join(modulePath, fileConfig.src || "/*"));

                let targetPath;
                if (fileConfig.target) {
                    targetPath = path.join(workDir, fileConfig.target);
                } else {
                    targetPath = getAndValidateTargetPath(pkg, packageJson, workDir);
                }

                // 'namespaced' is ignored for 'files' array entries
                copyFiles(sourceFilesPath, targetPath, pkgName, false);
            }
        } else {
            // If 'namespaced' is not explicitly set, default to `true` only when `src` is also not set.
            const namespaced = pkg.namespaced ?? !pkg.hasOwnProperty('src');

            // prepare folder pathes
            const sourceFilesPath = toGlobPath(path.join(modulePath, pkg.src || "/*"));
            //  eg.: /opt/myProject/node_modules/jquery/dist/*
            //  eg.: /opt/myProject/node_modules/jquery/dist/{file1,file2}
            const targetPath = getAndValidateTargetPath(pkg, packageJson, workDir);

            copyFiles(sourceFilesPath, targetPath, pkgName, namespaced);
        }
    }
    log("All files copied.");
}

// helper functions

function toGlobPath(p) { return p.replaceAll('\\', '/'); }

function getAndValidatePackageJson(workDir){
    const pkgJsonPath = path.join(workDir, "package.json");
    if (!fs.existsSync(pkgJsonPath)) {
        fail(`package.json not found in ${workDir}`);
    }
    const pkgJson = require(pkgJsonPath);
    const fd = pkgJson.frontendDependencies;

    if (!fd) fail("No 'frontendDependencies' key in package.json");
    if (!fd.packages) fail("No 'frontendDependencies.packages' in package.json");

    // maybe remove this code in later versions
    if (Array.isArray(fd.packages)) {
       fail("Update your package.json frontendDependencies format to > 1.0.0 syntax as explained at https://github.com/msurdi/frontend-dependencies");
    }
    return pkgJson;
}

function getNpmPackageString(pkg, pkgName){
    if (pkg.url) {
        // Handles git URLs, tarballs, local folders, etc.
        return pkg.url + " ";
    }

    let versionSpec = "";
    if (typeof pkg === 'string') {
        versionSpec = pkg; // Shorthand: "package": "version"
    } else if (pkg.version) {
        versionSpec = pkg.version;
    }

    if (versionSpec) {
        // Quote version spec to handle ranges with special characters (e.g., "^1.2.3")
        return `${pkgName}@"${versionSpec}" `;
    }

    return `${pkgName} `; // Install latest version
}


function getAndValidateModulePath(installPath, pkgName){
   const mdPath = path.join(installPath, "node_modules/", pkgName);
   if (!shell.test("-d", mdPath)) fail("Module not found or not a directory: " + mdPath);
   return mdPath
   //  eg.: /opt/myProject/.frontend-dependencies-cache/node_modules/jquery
}


function getAndValidateTargetPath(pkg, packageJson, workDir){
   const tarPath = pkg.target || packageJson.frontendDependencies.target;
   if (!tarPath) {
       fail("No 'target' defined for package and no global 'frontendDependencies.target' in package.json");
   }
   return path.join(workDir, tarPath);
   //  eg.: /opt/myProject/build/static
}

function copyFiles (sourceFilesPath, targetPath, pkgName, namespaced){
   // put target into a subfolder with package name?
   if (namespaced) targetPath = path.join(targetPath, pkgName);
   shell.mkdir("-p", targetPath);
   log(`Copying ${pkgName} to ${targetPath}`);
   shell.cp("-r", sourceFilesPath, targetPath);
}

function fail(reason) {
    const red = '\x1b[31m';
    const black = '\x1b[0m';
    console.error(`${red}[frontend-deps] ERROR: ${reason}${black}`);
    process.exit(1);
}

function log(message) {
   const blue = '\x1b[34m';
   const black = '\x1b[0m';
   console.log(`${blue}[frontend-deps]: ${message}${black}`);
}
