---
layout: post

title: Bundling Aurelia Applications
author: Matthew James Davis
category: blog
thumb: blog/2016-1-29-aurelia-bundling.png
blurb: Best practices for getting your Aurelia application optimized for deployment
tags: aurelia javascript ecmascript perfmatters

published: true
---
On February 1st 2015, not one month into the development of Aurelia, someone posted this infamous question to Stack Overflow: [Why does <span style="background:# D1E1AD;color:# 405A04;">the alpha version of</span> Aurelia load <s style="color:# A82400;background-color:# E5BDB2;">so</s> slowly?](http://stackoverflow.com/questions/28258956/why-does-the-alpha-version-of-aurelia-load-slowly) "My last test, showed it took 55 seconds to load the page with 135 requests." The Aurelia team took notice immediately.

It has been almost a full year since then, and bundling has reached maturity; today, a bundled Aurelia application can load in under 1 second with only 5 requests maxing out under 300kb gzipped. Let's see how to set up a bundling workflow.

# The Bundle Task

First, let's install the `aurelia-bundler` package by opening a console and running `npm install aurelia-bundler --save-dev`. Then, we can build a gulp task that leverages the bundler:

#### build/tasks/bundle.js
```javascript
var gulp = require('gulp');
var bundler = require('aurelia-bundler');

var config = {
  bundles: {
    'dist/app-build': {
      includes: [

      	// First, we bundle all css, html, and javascript in the root folder 
      	// and all subfolders. The bundler reads the mapping from the
      	// config.js file, which by default uses the './dist/' folder.
        '**/*.css!text',
        '**/*.html!text',
        '**/*.js',

        // Next, we need to bundle all project dependencies. It is a good 
        // idea to explicitly all required Aurelia libraries.
        'aurelia-bootstrapper',
        'aurelia-dependency-injection',
        'aurelia-framework',
        'aurelia-templating-binding',
        'aurelia-templating-resources',
        'aurelia-loader-default',

        // Next, we include the optional Aurelia dependencies. Your project 
        // may use dependencies not listed here.
        'aurelia-fetch-client',
        'aurelia-router',
        'aurelia-templating-router',
        'aurelia-history-browser',
        'aurelia-logging-console',
        'aurelia-event-aggregator',
        
        // Last, we include any other project dependencies.
        'bootstrap',
        'moment',
      ],

      // Here we can specify what files not to bundle. I include a config.js
      // file in all of my projects that does NOT get deployed. I manually
      // create and upload this file to each deployment, with that deployment's
      // specific configuration. Therefore, I don't want to include it in 
      // the bundle.
      excludes: [
        'config.js'
      ],

      // Lastly, since we are bundling for production, we want to minify as well.
      options: {
        minify: true
      }
    }
  }
};

// Once we declare the configuration, we can define the bundle task. Note:
// "It is almost always a good practice to run unbundle before bundling. The 
// existing bundle injection and depCache should be cleared from config.js."
// (We will define the unbundle task in the next section.)
gulp.task('bundle', ['build', 'unbundle'], function() {
  return bundler.bundle(config);
});
```

When we run the `gulp bundle` task, what happens? The bundler processes all of the files listed above and their dependencies, concatenates them into a single minified javascript file, and updates the systemjs `config.js` file. The updated `config.js` file tells systemjs what files are in the package, so systemjs knows to fetch those modules from the bundle rather than their original location. Now, we are ready for deployment to a production environment!

#### config.js
```javascript
  bundles: {
    "app-build": [
      "app",
      "app.css!github:systemjs/plugin-text@0.0.4",
      "app.html!github:systemjs/plugin-text@0.0.4",
      ... // etc.
    ]
  }
```

# The Unbundle Task

If we ran `gulp watch` immediately following bundling, we would find that our project is now in one large, minified javascript file. While great for deployment, this will not work for development. Thus, we need to create an unbundle task in our `bundle.js` file. Luckily, this is quite straightforward.

#### build/tasks/bundle.js
```javascript
gulp.task('unbundle', function() {
  return bundler.unbundle(config);
});
```

We can make things pretty simple by adding `unbundle` as a dependency to our `gulp serve` task, instructing gulp to unbundle whenever we start our development server.

#### build/tasks/serve.js
```javascript
gulp.task('serve', ['build', 'unbundle'], function(done) {
  browserSync({
  ...
  });
});
```

# Notes

There are several advanced settings in the `aurelia-bundler`, but there's one in particular that I want to talk about. Let's say we wanted to host a core bundle through a CDN, and build various applications on top of that. When bundling each application, we would want to exclude all the modules in the CDN-hosted bundle. If any of these were listed as dependencies, however, the `aurelia-bundler` would by default try to bundle them in. We can instruct the bundler to exclude dependencies by wrapping the file or glob with brackets in the config:

#### build/tasks/bundle.js
```javascript
var config = {
  bundles: {
    'dist/app-build': {
      includes: [

      	// The brackets tell the bundler that we will take responsibility
      	// for providing the dependencies for the **/*.js files.
        ['**/*.js']
      	... // etc
      ]
    }
  }
}
```

In general, I **strongly** recommend bundling your entire application into a single file. Not only does this reduce requests to the server and complexity in the bundler configuration, it will most importantly achieve a better overall compression ratio in gzip, which should be enabled in your production environment. Note that this differs from the skeleton-navigation configuration as of today.

# Links

[Aurelia Bundler GitHub project](https://github.com/aurelia/bundler)<br />
[Skeleton Navigation bundle configuration](https://github.com/aurelia/skeleton-navigation/blob/master/skeleton-es2016/build/bundles.json)<br />
[StackOverflow Question Revision History](http://stackoverflow.com/posts/28258956/revisions)<br />
[[OUTDATED] Official Aurelia blog post](http://blog.durandal.io/2015/09/11/bundling-aurelia-apps/)<br />
[[OUTDATED] Best Practices for Bundling and Minification](http://patrickwalters.net/my-best-practices-for-aurelia-bundling-and-minification/)