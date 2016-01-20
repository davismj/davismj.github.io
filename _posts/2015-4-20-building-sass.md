---
layout: post

title: Using Sass with Aurelia
author: Matt Davis
thumb: blog/2015-4-20-sass.png
blurb: How to Sass-enable your Aurelia build process.

category: blog
tags: aurelia build sass scss less css

published: true
---
Sass is a common and powerful css preprocessor that helps keep styles and views clean and readable. The Aurelia skeleton navigation project doesn't come with Sass support out of the box. Fortunately, adding Sass support to the Aurelia development workflow is quick and easy. Let's take a look at the high level steps we will need to go through:

1. Install the Sass compiler
2. Add Sass to our project
3. Configure our paths
4. Add the build task

#Installing the Sass Compiler
Since the skeleton navigation project comes with a pretty elaborate gulpfile, we install gulp-sass, a sass compiler that hooks into gulp. Let's add the package to our `package.json` and run `npm install` to install the package.

####package.json
```json
{
  "name": "aurelia-skeleton-navigation",
  "version": "0.12.0",
  ...
  "devDependencies": {
    ...
    "gulp-sass": "^1.3.3",
    ...
  }
  ...
}
```

#Adding Sass to our Project
The skeleton navigation project comes equipped with a css file at `styles/styles.css`. Let's rename this file to `styles.sass` and update the syntax to match sass syntax.

####styles.sass
```sass
body
    margin: 0

.splash
    text-align: center
    margin: 10% 0 0 0
    box-sizing: border-box

    .message
        font-size: 72px
        line-height: 72px
        text-shadow: rgba(0, 0, 0, 0.5) 0 0 15px
        text-transform: uppercase
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif

    .fa-spinner
        text-align: center
        display: inline-block
        font-size: 72px
        margin-top: 50px

.page-host
    position: absolute
    left: 0
    right: 0
    top: 50px
    bottom: 0
    overflow-x: hidden
    overflow-y: auto

section
    margin: 0 20px

.navbar-nav li.loader
    margin: 12px 24px 0 6px

.pictureDetail
    max-width: 425px
```

#Configuring our paths
Now, since the end goal is to compile the `.sass` file and output it as `.css`, we need to tell gulp where to find the `.sass` file and we need to instruct our `index.html` to read the new `.css`. The skeleton navigation project is already configured to output all compiled files to the `/dist` folder and we're going to continue using that convention. We can instruct gulp where to find the new `.sass` file by modifying the `build/paths.js` file.

####build/paths.js
```javascript
module.exports = {
  ...
  style: 'styles/**/*.sass',
  output: 'dist/',
  ...
};
```

####index.html
```html
<html>
  <head>
    ...
    <link rel="stylesheet" type="text/css" href="dist/styles.css">
    ...
  </head>
  <body aurelia-app>
    ...
  </body>
</html>
```

#Adding the build task
Finally, we add a new `build-css` task to gulp. Since the task builds css, we will include it with our other build tasks in the `build/tasks/build.js` file. We will also make sure that the watch task in the `build/tasks.watch.js` knows about our new `build-css` task.

####build/tasks/build.js
```javascript
...

// First, we need to import gulp-sass which we installed in step 1.
var sass = require('gulp-sass');

...

// Next, we add a new task for building css.
gulp.task('build-css', function() {
  
  // We instruct gulp to pull the source from the path we specified in step 3.
  return gulp.src(paths.style)

    // The plumber step will ensure that if we write syntactically invalid 
    // sass, even though the step won't run, the gulp task won't exit. This
    // is helpful because it allows us to fix our syntax without having to 
    // restart the gulp watch task.
    .pipe(plumber())

    // The changed step will analyze which files have changed and require
    // rebuilding.
    .pipe(changed(paths.output, {extension: '.css'}))

    // The sourcemaps step will automatically generate sourcemaps.
    .pipe(sourcemaps.init())

    // The sass step will compile the sass. We need to specify that we are
    // using the indented syntax. This is not necessary when using scss.
    .pipe(sass({indentedSyntax: true}))

    // And our last steps write the output and sourcemaps to the build
    // destination. Recall from step 3 that this is dist/.
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.output));
});

gulp.task('build', function(callback) {
  return runSequence(
    'clean',

    // Finally, we append our new build-css task to the general build task.
    // This will link build-css into the general build task which is used
    // in the gulp watch task.
    ['build-system', 'build-html', 'build-css'],
    callback
  );
});
```

####build/tasks/watch.js
```javascript
gulp.task('watch', ['serve'], function() {
  ...
  gulp.watch(paths.style, ['build-css', browserSync.reload).on('change', reportChange);
});
```

#Notes
This general process should work for other css preprocessors, including scss and less. In fact, the gulp-sass library will also compile `.scss` files. Make sure that you update your extensions in all of the steps above from `.sass` to your source of choice. Additionally, if you are using scss, you do not need the `{indentedSyntax: true}` argument, and can simply write `.pipe(sass())`.

#Links
[Full source on GitHub](https://github.com/davismj/skeleton-navigation-sass)<br />
[Sass Website](http://sass-lang.com/)<br />
[Less Website](http://lesscss.org/)