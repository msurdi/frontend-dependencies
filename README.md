[![Build Status](https://travis-ci.org/msurdi/frontend-dependencies.svg?branch=master)](https://travis-ci.org/msurdi/frontend-dependencies)


# frontend-dependencies

Utility for copying npm installed packages into a different directory.

For example, you might wish to use this for automatically copying `node_modules/jquery` to `static/vendor`
after running `npm install` in your project.


## Installation

`npm install --save frontend-dependencies`


### Configuration

Add to your `package.json` a section like:

      "frontendDependencies": {
        "target": "static/build",
        "packages": [
          "jquery",
          "normalize.css",
          {"src":"jquery/dist"},
          {"src":"normalize", "target":"vendor"},
          {"src":"jquery/dist/core.js", "target":"js/whatever.js", "exact":true}
        ]
      }



### Packages Value Types


#### String


Path to a file or directory that is relative to the node_modules directory.


##### Examples

* `["jquery"]`: copies contents of `node_modules/jquery` to `static/build/jquery/`
* `["normalize.css"]` copies `node_modules/normalize/normalize.css` to `static/build/normalize/normalize.css`


#### Object

Object values allow different targets per item. The also allow setting an exact target, bypassing the default behavior that creates a subdirectory based on the source module's name.

* `src` (required): works exactly like the string syntax shown above
* `target` (optional): define a custom target, works exactly like frontendDependencies.target
* `exact` (optional): changes the behavior of target to be the exact destination.


##### Examples

* `[{"src":"jquery/dist"}]` : copies contents of `node_modules/jquery/dist` to `static/build/jquery/`
* `[{"src":"normalize", "target":"vendor"}]`: copies contents of `node_modules/normalize` to `vendor/normalize/`
* `[{"src":"jquery/dist/core.js", "target":"js/whatever.js", "exact":true]`: copies `node_modules/dist/core.js` to `js/whatever.js`
* `[{"src":"jquery/dist/", "target":"myjquery", "exact":true]`: copies contents of `node_modules/dist/` to `myjquery/`


## Execution

The packages listed in `frontendDependencies.packages` should have been already installed with 
`npm install --save <packagename>` or similar, that means they should exist.

Then you can run `/node_modules/.bin/frontend-dependencies` by hand, or even better, make it a postinstall script
by adding to your package.json scripts sections something like:

    "scripts": {
        "postinstall": "./node_modules/.bin/frontend-dependencies"
    }

You can see a complete example [here](https://github.com/msurdi/frontend-dependencies/blob/master/fixtures/package.json)


## Tests

`npm test`
