---
layout: post

title: Best Practices for Dynamic Routes in Aurelia
category: blog
blurb: Learn the best ways to handle complex routes Aurelia that will save time and avoid bugs
tags: aurelia router javascript

published: true
---
Unless your application is quite simple, you probably have pages in your Aurelia app that are not available to all users all the time. For example, your application may have routes which apply only to certain users, or routes which are only available when logged out. We call these routes dynamic routes, and [my supportive Patrons](https://patreon.com/davismj) have requested that I shed a little light on how best to handle them.

Questions about dynamic routes show up all the time on [StackOverflow](https://stackoverflow.com/questions/37647971/aurelia-load-routes-dynamically-from-fetch) and [Discourse](https://discourse.aurelia.io/t/the-easy-way-to-customize-child-router-based-on-parent-router-param/768). The naive strategy is to add a route to the router when it is needed and remove it when it isn't. This approach, however, can cause a great deal of problems for both application architects and maintainers alike. Aurelia has specific tools that help us handle these dynamic routes in a logical and maintainable way.

There are generally three categories of dynamic routes, and each category has a best tool for the job:

- We can use parametric routes for routes that aren't always available, for example if a resource can't be found
- We can define an authorize step to guard routes that aren't always accessible, for example if a user doesn't have permissions
- We can define application roots to group routes that aren't always applicable, for example if a user isn't logged in

In this post we're going to look at when and how to use each of these tools, but first we'll look at the most common pitfall of dynamic routing and why it should be avoided.

# The Dynamic Routing Anti-Pattern

Your user finishes logging in. You run some logic and find out that they are an admin. You need to make sure they have access to the control panel route in addition to the standard routes, so you add that route to the route table, right? In fact, [this was suggested by K. Scott Allen in a blog post circa 2016](https://odetocode.com/blogs/scott/archive/2016/05/31/dynamically-add-routes-in-aurelia.aspx)

```javascript
// The Dynamic Routing Anti-Pattern
addRoute() {
  this.router.addRoute({
    route: "secret", name: 'secret', moduleId: "app/secret", title:"Secret", nav:true
  });
  this.router.refreshNavigation();
}
```

Scott noted that this is not a great approach and wrote "I'd stick with the declarative routing whenever possible." Though he didn't explain why, I can give a few good reasons why you should avoid this anti-pattern: First, it forces you to manage the route table by hand which isn't very fun or useful; second, it forces the Aurelia router to rebuild its guide for recognizing routes which isn't efficient; finally, it is an imperative, jQuery-esque approach, which should feel out of place in a declarative Aurelia app. Generally, **if you write the code for the pages ahead of time, you should define routes ahead of time; adding them later is an anti-pattern.**

# How to define routes that aren't always available using parametric routes

The most basic dynamic route is a *parametric route*. A parametric route is a route that accepts zero or more parameters and passes them to the `activate(params)` and `canActivate(params)` methods of a view-model. I've already written a full blog post on parametric routes called [How to build the Zero Data page](/blog/optional-route-parameters/), so I will not go into as much depth here.

Let's say we have a page that shows information for a `Widget`. We create a parametric route that accepts a unique identifier for the widget.

#### app.js

```javascript
configureRouter(config, router) {
  config.map([
    {
      // The :id part tells Aurelia to accept anything for this part of the
      // route and pass it as the id parameter of the params object in
      // the activate(params) and canActivate(params) callbacks.
      route: 'widget/:id', moduleId: 'pages/widget'
    }
  ])
}
```

Then, in our `WidgetViewModel` class, we add a `canActivate(params)` method that checks to see if the resource is available. If not, we cancel navigation or redirect to a different route.

#### pages/widget.js

```javascript
export class WidgetViewModel {

  // Since our route above had an :id parameter, whatever is in passed in that
  // portion of the route will be set to params.id.
  canActivate(params) {
    let widget = this.widgetService.getById(params.id);

    // If no widget is available, then we can prevent navigation from
    // completing by returning false (or a falsey Promise) from canActivate(params).
    if (!widget) {
      return false;
    }

    // If the identifier is valid but the widget moved, we can redirect to
    // correct location.
    if (widget.id !== params.id) {
      return new Redirect(`widget/${widget.id}`);
    }

    // Otherwise, we allow activation to continue.
    return true;
  }
}
```

Whenever you want to prevent access to a route based on information specific to that route, you should use a parametric route with a `canActivate(params)` method.

# How to define routes that aren't always accessible using an authorize step

Our user has navigated to `widget/123` and the `canActivate(params)` call passes, but he lacks the `CAN_VIEW_WIDGETS` permission needed in order to be able to load the page. In fact, almost every route in our application has a permission requirement. We could handle this by adding logic to the `canActivate(params)` callback that checks the users permissions, but this logic is likely to be identical on every page, which means our code wouldn't be very dry.

Instead, we define a step called the `CheckPermissionsAuthorizeStep` that acts like `canActivate(params)` across all routes. The step user metadata defined for each route to determine whether the user can access the page. First, we define the metadata.

#### resources/permissions.js

```javascript
// Permissions are defined using the bitmask flag pattern.
export const Permissions = {
  'CAN_VIEW_WIDGETS': 1 << 0, // 1
  'CAN_EDIT_WIDGETS': 1 << 1, // 2
  'CAN_DELETE_WIDGETS': 1 << 2 // 4
}
```

#### app.js

```javascript
export class App {
  configureRouter(config, router) {
    config.map([

      // The home route has no required permissions defined.
      { route: '', moduleId: 'pages/home', nav: true, title: 'Home' },

      // The widget list requires the CAN_VIEW_WIDGETS permission.
      {
        route: 'widgets',
        moduleId: 'pages/widget-list',
        nav: true,
        title: 'View Widgets',
        settings: {
          permissions: Permissions.CAN_VIEW_WIDGETS // 1
        }
      },

      // The edit widget page requires both CAN_VIEW_WIDGETS and
      // CAN_EDIT_WIDGETS permissions.
      {
        route: 'widget/:id',
        moduleId: 'pages/widget',
        nav: true,
        title: 'Edit Widget',
        settings: {
          permissions: Permissions.CAN_VIEW_WIDGETS | Permissions.CAN_EDIT_WIDGETS // 1 | 2 === 3
        }
      }
    ]);

    // Finally, add the step.
    config.addAuthorizeStep(CheckPermissionsAuthorizeStep);
  }
}
```

Then, we create the `CheckPermissionsAuthorizeStep` to use this metadata.

#### resources/check-permissions-authorize-step.js

```javascript
@inject(AuthService)
class CheckPermissionsAuthorizeStep {

  constructor(auth) {
    this.auth = auth;
  }

  // The run function is called whenever a navigation is performed.
  run(navigationInstruction, next) {

    // First, we get all instructions for each loaded route or child route.
    const instructions = navigationInstruction.getAllInstructions();

    // Next, we ask the auth service for the current user's enabled permissions.
    const permissions = this.auth.getPermissions(); // an integer number

    // Finally, we check that the user has permissions required by each instruction.
    const authorized = instructions.every(instruction => {

      // We grab the permissions we've associated to the route
      const requiredPermissions = (instruction.config.settings || {}).permissions;

      // If there are no permissions required, then OK.
      if (!requiredPermissions) {
        return true;

      // Otherwise, if the user has all the required permissions, then OK.
      } else {
        return (permission & requiredPermissions) === requiredPermissions;
      }
    });

    // I not all instructions pass authorization then cancel navigation by
    // calling next.cancel().
    if (!authorized) {
      return next.cancel();
    }

    // Otherwise, continue by calling next().
    return next();
  }
}
```

This pattern gives us a dry and simple way to define required permissions on new routes, add or remove permissions from existing routes, and add or remove new permissions. What if in addition to role-based permissions our application also limits the amount of content that a user can access? We could extend our `CheckPermissionsAuthorizeStep` to handle this logic as well, but then `CheckPermissionsAuthorizeStep` would be tasked with more than just checking permissions, which would be confusing to maintain. Instead, we define a second authorize step called `CheckContentLimitsAuthorizeStep`.

#### resources/check-content-limits-authorize-step.js

```javascript
@inject(AuthService)
class CheckContentLimitsAuthorizeStep {

  constructor(auth) {
    this.auth = auth;
  }

  run(navigationInstruction, next) {

    const instructions = navigationInstruction.getAllInstructions();

    // We ask the auth service how much content is still available.
    const availableContent = this.auth.getContentLimit();

    // And we check how much content would be consumed from this navigation.
    const consumedContent = instructions.reduce((consumed, instruction) => {
      const credits = (instruction.config.settings || {}).credits;
      if (credits) {
        consumed += credits;
      }
      return consumed;
    }, 0)

    // If there are insufficient content credits, we redirect the user to the
    // purchase content credits page and suggest a sufficient value to purchase.
    if (consumedContent > availableContent) {
      const required = consumedContent - availableContent;
      return new Redirect(`purchase?amount=${required+5}`);
    }

    // Otherwise, we continue by calling next(). Note that any logic that would
    // deduct the user's credits must happen on the server side to prevent a
    // security vulnerability.
    return next();
  }
}
```

Then, we add the metadata to the routes and add the second authorize step.

#### app.js

```javascript
// Next, lets add the `settings.credits` property and the new authorize step.
export class App {
  configureRouter(config, router) {
    config.map([

      // The home route requires no credits.
      { route: '', moduleId: 'pages/home', nav: true, title: 'Home' },

      // Neither does the widget list.
      { route: 'widgets', moduleId: 'pages/widget-list', nav: true, title: 'View Widgets', settings: { permissions: Permissions.CAN_VIEW_WIDGETS } },

      // Drilling down into a widget costs 2 credits.
      {
        route: 'widget/:id',
        moduleId: 'pages/widget',
        nav: true,
        title: 'Edit Widget',
        settings: {
          permissions: Permissions.CAN_VIEW_WIDGETS | Permissions.CAN_EDIT_WIDGETS, // 1 | 2 === 3
          credits: 2
        }
      },

      // And we need to define the new purchase route.
      { route: 'purchase', moduleId: 'pages/puchase', nav: false, title: 'Purchase Additional Credits' }
    ]);

    // Finally, we add both authorize steps.
    config.addAuthorizeStep(CheckPermissionsAuthorizeStep);
    config.addAuthorizeStep(CheckContentLimitAuthorizeStep);
  }
}
```

Whenever you want to use common logic to prevent access to several pages throughout your app, you should add an authorize step.

# How to group routes that aren't always applicable using application roots

Authentication is an important of most apps, and authentication typically starts with a login. In our app, an anonymous (that is, not logged in) user will need to access registration, login, and forgot password pages as well as a public landing page. These pages don't apply to logged in users, and we don't want logged in users to be able to see them. We could guard these routes with `canActivate(params)` callbacks or with authorize steps, but the simplest way is to set a new application root for each context of our app.

Since I've already written [a blog post on using multiple application roots for authentication](/blog/aurelia-login-best-practices-pt-1/), I'd like to look at a different use case as well. In our application, we have two types of users: Buyers and sellers. Buyers and sellers are both able to search widgets available for sale, but some pages including inventory management are only available to sellers, while other pages including order history are only available to buyers. We will separate these two views into separate contexts by creating separate application roots.

The most basic Aurelia application loads `app.js` as your application root by convention. If you specify an Aurelia start up script, such as a `main.js`, you will have code that calls `aurelia.setRoot()`. In our app, we're going to load a different application root depending on whether the user is a buyer or a seller.

#### main.js

```javascript
export function configure(aurelia) {
  aurelia.use.standardConfiguration();

  // First, we ask the Aurelia DI container for the auth service.
  const auth = aurelia.container.get(AuthService);

  // Next, we start both the auth.getUser() call and the aurelia.start()
  // call in parallel.
   Promise.all([auth.getUser(), aurelia.start()])
    .then(([user,]) => {

      // If a logged in user wasn't found, we start at the anonymous root.
      if (!user) {
        aurelia.setRoot('anonymous');

      // Otherwise, we load the correct root for the user's type.
      } else if (user.type === 'seller') {
        aurelia.setRoot('seller');
      } else {
        aurelia.setRoot('seller');
      }
    });
}
```

Next, we configure a different set of routes for each application root as we would normally.

#### seller.js

```javascript
configureRouter(config, router) {
  config.map([

    // Some routes common to both contexts.
    { route: '', redirect: '' },
    { route: 'search', moduleId: 'pages/search', title: 'Search for Widgets' },
    { route: 'store/:id', moduleId: 'pages/store' },

    // One route is specific to sellers.
    { route: 'store/:id/manage', moduleId: 'pages/seller/manage-store', title: 'Manage your Store' }
  ]);

  // When using multiple roots, it is best to configure a redirect for unknown
  // routes, since the routes in each app root are not always known to your
  // other app roots.
  config.mapUnknownRoutes('search');
}
```

#### buyer.js

```javascript
configureRouter(config, router) {
  config.map([
    { route: '', redirect: 'search' },
    { route: 'search', moduleId: 'pages/search', title: 'Search for Widgets' },
    { route: 'store/:id', moduleId: 'pages/store' },
    { route: 'orders', moduleId: 'pages/buyer/order-history', title: 'View your Orders' }
  ]);
  config.mapUnknownRoutes('search');
}
```

The advantage to this approach comes as we build out the different contexts. If we want to add, remove, or reconfigure a route for a specific context or add a completely new context we can do this with minimal and declarative changes. We can even send the same route to completely different pages depending on the context.

Whenever you want to define a logically connected group of available routes, you should create and load a new application root.

# How to handle truly dynamic routes

**NOTE: Truly dynamic routes are a huge security risk. Never load user generated content unless you've thoroughly checked it for malicious code first.**

In all of the above cases, we've assumed that the view and view model for the page are available at development time. In our app, we give the seller the option to create pages for his store, which means the routes will only be available at runtime. In order to route these truly dynamic pages we're going to create a single route that uses a `<compose>` element to load the user-generated content.

#### app.js

```javascript
configureRouter(config, router) {
  config.map([

    // The *path parameter is a special type of parameter called a splat and
    // it will accept any characters, including slashes, which we would
    // normally expect for a path to a file. We also add the 'invoke-lifecycle'
    // activation strategy to make sure that view is updated every time a
    // navigation is performed, no matter what the path is.
    { route: 'store/:id/*path', moduleId: 'pages/dynamic', activationStrategy: 'invoke-lifecycle' }
  ]);
}
```

#### dynamic.js

```javascript
export class DynamicViewModel {

  // id is the store id, path is the path to the dynamic route content.
  activate(id, path) {
    this.path = `/api/store/${id}/${path}.html`; // api/store/13/widgets/benefits.html
  }
}
```

#### dynamic.html

```html
<template>
  <!-- This will load /api/store/13/widgets/benefits.html, which contains the
    user-generated content. -->
  <compose view.bind="path"></compose>
</template>
```

If you do not know what routes are available at development time and want truly dynamic routes, you should create a single dynamic route which uses the `<compose>` element to load the content.

# Notes

Aurelia bindings have bulletproof security checks to prevent malicious code from being injected via a binding. The compose element, however, is designed to be flexible and not secure. Therefore, even though it is possible to load dynamic routes in an Aurelia app, it is potentially a huge security vulnerability. If you think this is something you may need in your app and aren't sure how to protect yourself, please send me an email and allow me to connect you with someone who can help you.

Also, there is [another strategy suggested in the official Aurelia docs](https://aurelia.io/docs/routing/configuration#dynamically-specify-route-components):

```javascript
export class App {
  configureRouter(config, router) {
    const navStrat = (instruction) => {
      instruction.config.moduleId = instruction.fragment
      instruction.config.href = instruction.fragment
    };
    config.map([
      { route: ['', 'admin*path'], name: 'route', navigationStrategy: navStrat }
    ]);
  }
}
```

I don't recommend this strategy. First, if you have routes defined at development time, then you don't need this approach. Second, if you want the approach anyway because it is convenient, you are introducing a security vulnerability. If someone is able to save a new route to your server he would be able to execute arbitrary code. Third, if you don't have routes defined at development time, this approach requires pulling in a view-model, which can and will run whatever code it finds, which is a security vulnerability to be avoided at all costs. Finally, I personally find it not to be an intuitive approach.

# Example

Esteemed Aurelia developer [Jason Sobell](https://github.com/jsobell) tackled the dynamic routing problem and [came up with a different solution](http://www.sobell.net/aurelia-dynamically-choosing-modules-based-on-roles/) using the above method.

```javascript
const userrole = getUserRole(); // defined elsewhere

export class App {

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '/', name: 'root', navigationStrategy: this.navigateToModule, title:'Home', nav: true }
    ]);
  }

  navigateToModule = (instruction) => {
    instruction.config.moduleId = ['login','home','superhome'][userrole];
  }
}
```

It is hard to say without more context, but I would probably recommend the app root approach, since it seems Jason wants to map the same route to different pages based on the user's context.

#### main.js

```javascript
export function configure(aurelia) {
  const userrole = getUserRole();
  aurelia.use.standardConfiguration();
  aurelia.start().then(() => {
    if (userrole === 0) {
      aurelia.setRoot('login');
    } else if (userrole === 2) {
      aurelia.setRoot('superhome');
    } else {
      aurelia.setRoot('home');
    }
  });
}
```

#### login.js

```javascript
export class Login {
  configureRouter(config) {
    config.map([ { route: '/', name: 'login', moduleId: 'pages/login/login', title: 'Login', nav: true } ])
  }
}
```

#### home.js

```javascript
export class Login {
  configureRouter(config) {
    config.map([ { route: '/', name: 'home', moduleId: 'pages/home/home', title: 'Home', nav: true } ])
  }
}
```

#### superhome.js

```javascript
export class Login {
  configureRouter(config) {
    config.map([ { route: '/', name: 'home', moduleId: 'pages/superhome/home', title: 'Home', nav: true } ])
  }
}
```

Jason's code is much more concise and simple than mine. For simpler use cases, this might be the right choice for your application, rather than adding two entirely new files and three new folders. There are two clear advantages to my approach, however. First, you clearly get more fine grained control over how the routes behave in each case. For example, you can change properties like `title`, you can leave off routes entirely, and you can even map multiple routes in one particular context, for example `route: ['/', '/login']` for the login context. Second, this approach is more scalable. If you have more than one route that needs to share a path but map differently based on a user's role, you will need to write a new function for each route. With this approach, you simply need only add or remove a new route configuration to each context.

Let me know which approach you prefer in the comments!

# Links

[Aurelia Router docs](https://aurelia.io/docs/routing/configuration#dynamically-specify-route-components)<br />
[K Scott Allen on Dynamic Routes in Aurelia](https://odetocode.com/blogs/scott/archive/2016/05/31/dynamically-add-routes-in-aurelia.aspx)<br />
[Jason Sobell on Role-driven Routes in Aurelia](http://www.sobell.net/aurelia-dynamically-choosing-modules-based-on-roles/)<br />
