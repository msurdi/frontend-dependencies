[![Build Status](https://travis-ci.org/msurdi/frontend-dependencies.svg?branch=master)](https://travis-ci.org/msurdi/frontend-dependencies)

frontend-dependencies
=====================

Utility for copying npm installed packages into a different directory.

For example, you might wish to use this for automatically copying `node_modules/jquery` to `static/vendor`
after running `npm install` in your project.


Installation
------------

`npm install --save frontend-dependencies`

Configuration
-------------

Add to your `package.json` a section like:

      "frontendDependencies": {
        "target": "static/build",
        "packages": [
          "jquery",
          "normalize.css"
        ]
      }
 
The packages listed in `frontendDependencies.packages` should have been already installed with 
`npm install --save <packagename>` or similar, that means they should exist.

Then you can run `/node_modules/.bin/frontend-dependencies` by hand, or even better, make it a postinstall script
by adding to your package.json scripts sections something like:

    "scripts": {
        "postinstall": "./node_modules/.bin/frontend-dependencies"
    }
    
You can see a complete example [here](https://github.com/msurdi/frontend-dependencies/blob/master/fixtures/package.json)
    
Tests
-----

`npm test`