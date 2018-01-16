---
layout: post

title: Building the perfect master-detail page in Aurelia
category: blog
thumb: blog/2017-12-30-master-detail.jpg
blurb: Thanks to the new features in the latest update to the Aurelia router, building a beautiful and functional master-detail page in Aurelia is quick and easy.
tags: aurelia router master-detail web-design css

published: true
---

I'm excited to announce that thanks to the hard work of Aurelia contributor [Jürgen Wenzel](http://github.com/jwx) the Aurelia router has just gotten a lot more powerful. In addition to a quick overview of the new features, we're going to look at an example of how to use these features to create the perfect master-detail page.

# A New Way to Support Aurelia

Before we get started, I'd like to announce my new Patreon page! Though I love running my consulting company [Foursails Technology Group](http://www.foursails.co) and turning my clients' dreams into reality, I have my own dream: I have taken over development of the Aurelia router and I've decided to dedicate more time to making Aurelia as great as possible. That's why I'm asking members of the Aurelia community who may not have time to contribute code to consider sponsoring my development of Aurelia. Click the link below to become a Patron.

<a href="https://www.patreon.com/bePatron?u=133362" data-patreon-widget-type="become-patron-button">Become a Patron!</a><script async src="https://c6.patreon.com/becomePatronButton.bundle.js"></script> 

# New Features in aurelia-router@1.5.0

The new features in the aurelia-router are arguably some of the biggest since 1.0, and I'm excited to introduce them to you today. Both contributions come to you due in large part to the hard work of community member [Jürgen Wenzel](http://github.com/jwx)! The first set of features adds a great deal of power and flexibility to viiew ports, and we're going to take a look at how to leverage these features to build the perfect master-detail page. The second feature exposes enhanced information to the navigation properites of the router.

## View Port Configuration

View port configurations have been an effective way to decouple sections of an Aurelia application. Up until now, there has been a restriction that each view port was populated with some kind of page. With 1.5.0, this restriction has been lifted, and there are now a few new ways to leverage view ports that afford greater flexibility.

### Empty View Ports

View ports can now be specified as empty. As we will see later, this is extremely useful when [designing for zero data](http://davismj.me/blog/optional-route-parameters/), such as in a master-detail page. You can empty a view port by setting `moduleId` null in the route configuration for that view port.

#### app.js

```javascript
export class App {
  configureRouter(config) {
    config.title = 'Aurelia';
    config.map([

      // This tells the Aurelia that the 'users' route empties the right view port.
      { route: 'users', name: 'users', viewPorts: { left: { moduleId: 'user/list' }, right: { moduleId: null } } }
    ]);
  }
}
```

### View Port Defaults

In fact, `moduleId: null` tells Aurelia to "use the default module for that view port", and an empty view port is the out-of-the-box default. You can override this default to load a specific `moduleId` by passing a view port configuration to the router configuration. These overrides can be set individually for each view port.

#### app.js

```javascript
export class App {
  configureRouter(config) {
    config.title = 'Aurelia';

    // Again, we tell Aurelia that the 'users' route "empties" the right view port.
    config.map([
      { route: 'users', name: 'users', viewPorts: { left: { moduleId: 'user/list' }, right: { moduleId: null } } }
    ]);

    // However, we specify a special placeholder page when the right view port is emepty.
    config.useViewPortDefaults({
      right: { moduleId: 'pages/placeholder' }
    })
  }
}
```

### Optional View Ports

In addition to the new "empty" behavior, we've also added a "no change" behavior. If a view port configuration is not defined for a route, the router will skip routing on that view port entirely, leaving the view port untouched. If there is no existing content in the view port, i.e. when the application is first loaded, then then router will load the default for that view port.

#### app.js 

```javascript
export class App {
  configureRouter(config) {
    config.title = 'Aurelia';
    config.map([

      // Now, since we don't give Aurelia any instructions for the right view port on the 'users' route, Aurelia simply ignores the route.
      { route: 'users', name: 'users', viewPorts: { left: { moduleId: 'user/list' } } }
    ]);

    // If the user navigates directly to the 'users' route however, Aurelia will populate the right view port with the placeholder page.
    config.useViewPortDefaults({
      right: { moduleId: 'pages/placeholder' }
    })
  }
}
```

## Enhanced Navigation Properites

Prior to version 1.5.0, the router had `isNavigating`, `isExplicitNavigation`, and `isExplicitNavigationBack` properties which could either be observed or could be used in custom logic for special handling. 1.5.0 brings a few additional properties specific to the browser's history:

- `isNavigatingFirst`: `true` if the router is navigating into the app for the first time in the browser session.
- `isNavigatingNew`: `true` if the router is navigating to a page instance not in the browser session history. This is triggered when the user clicks a link or the navigate function is called explicitly.
- `isNavigatingForward`: `true` if the router is navigating forward in the browser session history. This is triggered when the user clicks the forward button in their browser.
- `isNavigatingBack`: `true` if the router is navigating back in the browser session history. This is triggered when the user clicks the back button in their browser or when the navigateBack() function is called.
- `isNavigatingRefresh`: `true` if the router is navigating due to a browser refresh.

# The Perfect Master-Detail Page

In order to demonstrate how powerful the new view port configuration options are, I'd like to take a look at how these tools simplify one of the most common use cases in web applications: The master-detail view. 

Typically, a master-detail view consists of a list or a complex record that has items or subcomponents that need to be modified individually. Typically, both a master view and a detail view each have more than enough information to fill the screen, yet we are interested in the information in both views at the same time, with a focus on the detail view. The question is how to render the master and the detail views side-by-side as seamlessly as possible. 

There have always been patterns for building this in Aurelia. You might use an optional route pattern and compose the detail inside of the master view, or you might use a child router pattern, which is essentially the same. However, both of these strategies require that the detail view lives within master. This means that if you require your master and detail views to be side-by-side siblings, you're going to have to add some extra arbitrary templating to achieve this. Additionally, both strategies require adding extra code to check whether or not the detail route parameter is present and instructions on what to do if it isn't.

Instead, lets use the new empty route configuration to define a master-only route and a master-detail route:

#### app.js

```javascript
configureRouter(config, router) {
  config.map([

    // This specification says the main view port should be populated with master, the side view port emptied.
    { route: 'master', name: 'master', viewPorts: { main: { moduleId: 'master' }, side: { moduleId: null } } },

    // And here we specify that when the detail parameter is passed, we should load detail into the side view port.
    { route: 'master/:detail', name: 'master-detail', viewPorts: { main: { moduleId: 'master' }, side: { moduleId: 'detail' } },
  ]);
  this.router = router;
}
```

#### app.html

```
<template>
  <h1>${router.title}</h1>

  <!-- And this is where the feature gets its power. There are no restrictions on how we specify the template. For 
    simplicity, I've simply added them side by side here. However, if we had a lot of complex css to our application,
    which is common, we can render the side view wherever it needs to be, and it can exist entirely outside of and
    independently of the main view. -->
  <router-view name="main"></router-view>
  <router-view name="side"></router-view>
</template>
```

We haven't opened up any new doors yet, but we have cut out a few of the old hoops we had to jump through. However, this does allow us to add some extremely simple CSS magic to completely transform the user experience of the application:

#### app.css

```css
/* We give the body the full screen magic treatment to afford us some greater flexibility to treat the router-views 
  as individual windows. */
body {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 2vh 2vw;
  overflow: hidden;
}

router-view { 
  display: block;
}

/* We fill the screen with the main view port so it can be as large as possible at all times. */
router-view[name="main"] {
  height: 100%;
  width: 100%;
}

/* And we the right fill 65% of the window with the side view port on top of the main view port. This gives affords
  us enough space to display the side content without completely obscuring the main view port. This is particularly 
  useful when we want to use the information we've found in the detail view to inform a decision in the master view. */
router-view[name="side"] {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 65vw;
  z-index: 1;

  /* And here's the magic. We use the :empty selector on the side view port to shift it completely off screen when 
    emptied, and add a transition for a clean, professional visual feedback to the user. In two lines of css. */
  transition: transform 250ms ease-in-out;
}
router-view[name="side"]:empty {
  transform: translateX(65vw);
}
```

With a minimum of code, we were able to structure our view ports in order to quickly build a clean, animated, ux-optimized master detail page. Of course, this is just a quick example of the kind of opportunities afforded with the new view port configuration feature in the 1.5.0 release of the Aurelia router.

# <a href="http://davismj.me/perfect-master-detail" target="_blank">Live Demo</a>

<iframe src="http://davismj.me/perfect-master-detail" style="height: 600px;"></iframe>