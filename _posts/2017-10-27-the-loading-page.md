---
layout: post

title: A Professional SPA Loading Page 
author: Matthew James Davis
category: blog
# thumb: blog/2017-9-1-easy-dialog.png
blurb: Have your loading page load your app faster
tags: aurelia

published: true
---

Way back at the end of 2014, while Rob Eisenberg was building the foundation for what would become the Aurelia framework he put together a sample app demonstrating the routing and two-way data binding features of Aurelia. Little did he know that one small component of that app would creep its way into every Aurelia project ever. Have you ever seen this page?

![Skeleton Navigation loading page](/images/blog/2017-10-27-the-loading-page-1.gif "The Skeleton Navigation loading page")

Developers the world over, myself included, eager to build their application swapped out the image and text to reflect their application. Unfortunately, this means there are lots of Aurelia applications with a loading page that looks like this:

![The bad loading page](/images/blog/2017-10-27-the-loading-page-2.gif "The bad loading page")

Instead, we're going to load the application styles and layout into the browser immediately and display a loading spinner within the layout. This will give the appearance that the application has loaded almost immediately. As a result, your app will both gain credibility and feel significantly faster.

# Add `app.html` markup to `index.html`

The first thing we're going to do is copy the markup from our default `app.html` page directly into the `index.html`. If the markup in these two pages match, the user will not be able to tell that there has been any change.

#### index.html

```html
<body aurelia-app="main">

  <!-- Since Aurelia is not yet loaded, we need to do a little extra work if our app.html is 
    using any custom elements. In this case, since <nav-bar> is not a standard HTML component,
    we copy in the markup from nav-bar.html and remove any Aurelia bindings. -->
  <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
    <div class="container">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#skeleton-navigation-navbar-collapse">
          <span class="sr-only">Toggle Navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>

        <!-- Rather than adding big, shadowed block text announcing our application's name, load
          the application with a nice, clean logo in the upper left. This will persist into the 
          Aurelia application as well. This is a much more professional way to tell the user
          what app they're using. -->
        <a class="navbar-brand" style="padding: 10px;" href="#">
          <img height="30" src="img/logo.png" />
        </a>
      </div>
    </div>
  </nav>

  <!-- A spinner itself is not a bad idea. But let's load it exactly in place of where your 
    application's content will load. This will make it feel like the application is already
    loaded, and is simply waiting for some content to load, which will replace the spinner
    when ready. -->
  <div class="page-host">
    <div class="splash">
      <i class="fa fa-spinner fa-spin"></i>
    </div>
  </div>

  <script src="jspm_packages/system.js"></script>
  <script src="config.js"></script>
  <script>
    System.import('aurelia-bootstrapper');
  </script>
</body>
```

# Load application styles immediately

Now, all the markup is in place. However, our application looks like this:

![Loading page with no styles](/images/blog/2017-10-27-the-loading-page-3.gif "Loading page with no styles")

This is because our `app.html` file contains this line: `<require from="bootstrap/css/bootstrap.css"></require>`. Since we want to load the application styles immediately, we remove this line and add it to `index.html`:

#### index.html

```html
  <!-- In fact, we are loading the custom styles up front. This is a good practice. -->
  <link rel="stylesheet" href="styles/styles.css" />

  <!-- We just need to make sure the bootstrap styles are also loaded up front. -->
  <link rel="stylesheet" href="jspm_packages/github/twbs/bootstrap@3.3.7/css/bootstrap.min.css" />

  <link rel="stylesheet" href="jspm_packages/npm/font-awesome@4.6.3/css/font-awesome.min.css" />
```

Now our application is looking at lot cleaner:

![Loading page with styles](/images/blog/2017-10-27-the-loading-page-4.gif "Loading page with styles")

# Best Practices for Loading Styles

I see a lot of developers using `<require>` to load styles into pages. There is an appeal to lazy loading your view, view-model, and view styles all at the same time. Additionally, bundlers such as systemjs are able to trace even CSS dependencies when bundling. However, I consider lazy loading styles to be a bad practice, since you will often find that you've written CSS that has unwanted side effects on other routes which are only discoverable when loading routes in a particular order.

Instead, I recommened using S/CSS `@import` statements in a master stylesheet. For our example, we can create a `styles.scss` file with the following markup:

#### styles.scss

```scss
/* Notice that these paths are relative to the location of your scss file. */
@import 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css';
@import 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';

/* Custom styles below */
@import 'app.scss';
```

When this builds, this will include all scss files inline, and use CSS imports to load stylesheets through the browser.

# Links

[Source Code](https://github.com/davismj/loading-page-example)<br />
[Working Example](http://davismj.me/loading-page-example/)<br />
[Bootstrap 3.3.7](https://getbootstrap.com/docs/3.3/)<br />
[CSS Imports in SASS](http://sass-lang.com/documentation/file.SASS_CHANGELOG.html#CSS__import_Directives)<br />
[Tailor Brands Logo Generator](https://www.tailorbrands.com/)
