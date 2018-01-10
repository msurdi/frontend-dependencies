[![Build Status](https://travis-ci.org/msurdi/frontend-dependencies.svg?branch=master)](https://travis-ci.org/msurdi/frontend-dependencies)


# frontend-dependencies

Comfortable manage frontendDependencies in the `package.json`:
Install node modules and copie desired files to each directory.


NOTE: There is a breaking change from Version `0.4.0` to `0.5.0`. Be sure to update your projects to the new syntax!


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
    "target": "static/build",
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
   |   |_ build
   |        |_ jquery.min.js
   |        |_ normalize.css
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
  "dependencies": { },
  "devDependencies": {
    "shelljs": "0.7.4"
  },
  "frontendDependencies": {
    "target": "static/build",
    "packages": {
      "jquery": {             // npm package name
          "version": "3.1.0", // for `npm install`: version, tag or version range
          "src": "dist/*"     // relative path in package to copy files
      },
      "normalize.css": { // copy whole package
          "version": "4.2.0"
      },
      "turbolinks": {
          // alternative to 'version`: specifie git url, tarball url, tarball file, folder
          "url": "git://github.com/turbolinks/turbolinks.git",     
          "src": "{src,LICENSE}", // copy multiple files
          "target": "static/build/turbo", // specific target path
          "exact":true // no extra folder with package Name
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
   |   |_ build
   |        |_ jquery
   |        |    |_ core.js
   |        |    |_ jquery.js
   |        |    |_ jquery.min.js
   |        |    |_ ...
   |        |
   |        |_ normalize.css
   |        |    |_ CHANGELOG.md
   |        |    |_ LICENSE.md
   |        |    |_ normalize.css
   |        |    |_ ...
   |        |
   |        |_ turbo
   |              |_ src
   |              |   |_ turbolinks
   |              |
   |              |_ LICENSE
   |
   |

```


## Installation

> npm install --save frontend-dependencies

Make it a postinstall script by adding this to your package.json:
```json
    "scripts": {
        "postinstall": "frontend-dependencies"
    }
```

You can see a complete example [here](https://github.com/msurdi/frontend-dependencies/blob/master/fixtures/package.json)

Run can also run it by hand

> /node_modules/.bin/frontend-dependencies

### Packages Options

#### version
The npm package name will be taken from the name specified in "frontendDependencies.packages" and the package installed from npm.
```js
                         // none: install latest
    "version": "0.2.4"   // version
    "version": "beta"    // tag
    "version": "0.^2.4"  // version range
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
   "src": "{index.js,index.css}"]
```

#### target
The source file(s) or folder(s) within each npm package to be copied.

```js
   "target": "dest"
```

#### exact
The copy process creates a subfolder with the actual module name, except you want it exact.

```js
   "exact": true
```



## Tests

> npm test


## ToDo

* improve testing for copy cases (simple fist code example in readme)
* improve testing for npm install for packages and urls

## Experience with managing npm dependencies for the frontend

* bower: possible, but a source of trouble
* npm + grunt/gulp: possible, but you have two files to manage
* pancake
   * https://github.com/govau/pancake
   * https://medium.com/dailyjs/npm-and-the-front-end-950c79fc22ce
   * might be good to manage complexe dependencies in very large projects
   * when you try not keep the ammount of dependencies at a reasonable level, this might be overkill

## Ideas
The goal of this package is to make the management of frontend components easier and lower maintenance.

* Most packages come with a ready to use (compiled and minified, etc.) version of js and css
* With http2, the sending of small files is encouraged
* The browser can cache common libs easy

We think to copy the needed part of a libs to your webserver folder, is simple and gives you most benefit.

Although there is no handling of the dependencies of the frontend components (like a jQuery plugin needs jQuery), this seems not too important for small projects and also frontend packages can do this over peerDependencies.

This article is interesting: http://blog.npmjs.org/post/101775448305/npm-and-front-end-packaging
