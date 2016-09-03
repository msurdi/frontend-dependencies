"use strict";

var assert = require("assert");
var frontendDependencies = require("./index.js");
var shell = require("shelljs");

shell.config.fatal = true;

describe("frontend-dependencies", function () {
    describe("when there are node modules", function () {
        this.timeout (10000);
        before(function (done) {
            shell.cd("fixtures");
            if (shell.exec("npm install").code != 0) {
                done("Error running npm install");
            }
            frontendDependencies();
            done();
        });

        after(function () {
            shell.rm("-rf", ["node_modules", "static/build/*"]);
        });

        it("should have copied jquery to static/build/", function () {
            assert.ok(shell.test("-d", "static/build/jquery"));
            assert.ok(shell.test("-f", "static/build/jquery/dist/jquery.js"));
        });

        it("should not have copied shelljs", function () {
            assert.ok(!shell.test("-d", "static/build/shelljs"));
        });
    });

});
