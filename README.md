[![Build Status](https://travis-ci.org/msurdi/frontend-dependencies.svg?branch=master)](https://travis-ci.org/msurdi/frontend-dependencies)


# frontend-dependencies

Easily manage your frontend dependencies in `package.json`:
Install node modules and copy desired files to each directory.


NOTE: There is a breaking change from Version `0.4.0` to `1.0.0`. Be sure to update your projects to the new syntax!


## Example

Your package.json:

```js
{
  "name": "frontend-dependencies-test",
  "version": "1.0.0",
   // etc.

  "devDependencies": {
    "shelljs": "0.7.4"
  },
  "frontendDependencies": {
    "target": "static/",
    "packages": {
      "jquery": {
          "version": "3.1.0",
          "src": "dist/jquery.min.js"
      },
      "normalize.css": {
          "version": "4.2.0",
          "src": "normalize.css"
      }
    }
  }
}
```

Your target folder in your project will look like:

```
 project
   |
   |_ static
   |    |_ jquery.min.js
   |    |_ normalize.css
   |

```

## Full example

```js
{
  "name": "frontend-dependencies-test",
  "version": "1.0.0",
  "description": "frontend-dependencies test project",
  "main": "index.js",
  "author": "Matias Surdi <matias@surdi.net>",
  "license": "Apache-2.0",
  "dependencies": {
    "moment": "2.24.0"
  },
  "devDependencies": {
    "shelljs": "0.7.4"
  },
  "frontendDependencies": {
    "target": "static/",
    "packages": {

      "normalize.css": "4.2.0", // copy whole package

      "jquery": {               // with options
          "version": "3.1.0",   // for `npm install`: version, tag or version range
          "src": "dist/*"       // relative path in package to copy files
          "namespaced": true    // extra parent folder with package Name
      },

      "moment": {               // use in backend and frontend
          "isomorph": true,
      },

      "turbolinks": {
          // alternative to 'version`: specifie git url, tarball url, tarball file, folder
          "url": "git://github.com/turbolinks/turbolinks.git",     
          "src": "{src,LICENSE}", // copy multiple files
          "target": "static/turbo" // specific target path
      }
    }
  }
}
```

Your target folder in your project will look like:

```
 project
   |
   |_ static
   |   |
   |   |_ jquery
   |   |    |_ core.js
   |   |    |_ jquery.js
   |   |    |_ jquery.min.js
   |   |    |_ ...
   |   |
   |   |_ normalize.css
   |   |    |_ CHANGELOG.md
   |   |    |_ LICENSE.md
   |   |    |_ normalize.css
   |   |    |_ ...
   |   |
   |   |_ turbo
   |        |_ src
   |        |   |_ turbolinks
   |        |
   |        |_ LICENSE
   |
   |

```


## Installation

> npm install --save frontend-dependencies

Make it a postinstall script by adding this to your package.json:
```json
    "scripts": {
        "postinstall": "node ./node_modules/frontend-dependencies/index.js"
    }
```

If postinstall did not run you can use this after installed:
> npm run postinstall

Run can also run it with
> ./node_modules/.bin/frontend-dependencies

Windows user run it in PowerShell or use this command in Command Prompt:
> node_modules\\.bin\frontend-dependencies.cmd

### Packages Options

#### version
The npm package name is taken from the specified name in "frontendDependencies.packages".
```js
                         // none: install latest
    "version": "0.2.4"   // version
    "version": "beta"    // tag
    "version": "^0.2.4"  // version range
```
#### url
Alternative sources for your packages.
```js
    "url": "ssh://user@host.xz:port/path/to/repo.git/"
    "url": "git://github.com/ember-cli/ember-cli.git#v0.1.0"
    "url": "forever.tar.gz"
    "url": "https://github.com/User/repo/archive/master.tar.gz"
    "url": "/testfolder"
```

#### src
The source file(s) or folder(s) within each npm package to be copied.

```js
   // option 1: do not specify to copy the whole folder

   // option 2: copy one file or folder
   "src": "dist/*"

   // option 3: copy serveral files or folders
   "src": "{index.js,index.css}"
```

#### target
* specific target folder to copy the files of a frontend package to
* if not specified, target is the global "frontendDependencies.target"

```js
   "target": "dest"
```

#### isomorph: use a package in backend and frontend
This skips the usual additional npm install of frontendDependencies and assumes the regular npm install placed it already in node_modules; it only copys the files from there.


```js
   "isomorph": true
```

Your package.json has then also to include the package in dependencies:

```js

"dependencies": {
  "moment": "2.24.0"       // regular install
},
"frontendDependencies": {
  "target": "static/",
  "packages": {

    "moment": {            // copy it for frontend
        "isomorph": true,
    },

```




#### namespaced copy
Often you will copy just a single file from a package and copy it in your static files folder. Doing this for 4 files, you won't experience namespace errors. If you copy more files or the whole folder (= no `src` option defined), then you want to create a parent  folder with the actual module name. Enable this with the namespace option, the default is false.

```js
   "namespaced": true
```
If you do not specify a `src` and no `namespaced` option like in the example below, `namespaced` is set to true, to avoid namespace errors (e.g. file conflicts from two package.json).

```js
// no `src` and `namespaced` defined
"jquery": {
   "version": "3.1.0"
},
"normalize.css": {
   "version": "4.2.0"
}
// => confilicts prevented, by parent folders with module name

```

## Tests

> npm test


## ToDo

* build a CI
* improve testing

## Experience with managing npm dependencies for the frontend

* bower: possible, but a source of trouble
* npm + grunt/gulp: possible, but you have two files to manage
* pancake
   * https://github.com/govau/pancake
   * https://medium.com/dailyjs/npm-and-the-front-end-950c79fc22ce
   * might be good to manage complexe dependencies in very large projects
   * when you try not keep the ammount of dependencies at a reasonable level, this might be overkill

## Ideas
The goal of this package is to make the management of frontend components easier and lower maintenance. Aspects we consider important for "how to do it right":

* Most packages come with a ready to use (compiled and minified, etc.) version of js and css
* With http2, the sending of small files is encouraged
* The browser can cache common libs easy

We think to copy the needed part of a libs to your webserver folder, is simple and gives you most benefit.

Although there is no handling of the dependencies of the frontend components (like a jQuery plugin needs jQuery), this seems not too important for small projects and also frontend packages can do this over peerDependencies.

This article is interesting: http://blog.npmjs.org/post/101775448305/npm-and-front-end-packaging
