T---
layout: post

title: Optional Route Parameters in Aurelia
author: Matthew James Davis
blurb: Learn how to use parameter-optional routes in Aurelia.

category: blog
tags: aurelia routing

published: true
---

As a top-notch UX developer, you're familiar with [Rule #25: Designing for Zero Data](http://www.goodui.org/#25). As the leading frontend JavaScript framework, Aurelia is too. Parameter-optional routes are the Aurelia best practice for designing for zero data.

# The Zero Data Page

Imagine we're building an application that connects users who need and provide goods and services. The success of our application revolves around users creating posts, so let's remove every obstacle that stands in their way.

Our brand new user navigates to the route `#/posts/`. What does he see? He could see an empty list and a big button saying "Create your first post!". Instead, let's click that button for him; let's create an empty post and navigate him to it by default. With the empty post just waiting to be filled out, your user will immediately begin dreaming of the content he can create for your application. 

There are a few ways we could tackle this problem, but the best practice for accomplishing this in Aurelia is to have a single parameter-optional route. You will stay DRY with code reuse between create and edit pages while preventing any confusion to your users by having one simple route. Let's take a look at how a parameter-optional route works:

# The Parameter-Optional Route

**app.js** 

```javascript
configureRouter(config, router) {
  config.map([
    { 

      // Simply add a '?' after the parameter ':id' to indicate that the
      // parameter is optional and may not be provided
      route: 'post/:id?',
      title: 'Your Posts',

      // by giving the route a name, we are able to navigate to this route
      // using the router API, i.e. `router.navigateToRoute()`, which is
      // another best practice
      name: 'post',

      moduleId: 'post',

      // if 'nav' is set to true, a href must be provided for the navigation
      // model, just as with normal parameterized routes
      nav: true,
      href: '#/post'
    }
  ]);

  this.router = router;
}

open(id) {

  // now, we can leverage the router API even if `id` is undefined
  this.router.navigateToRoute('post', { id });
}
```

# Pitfalls of Other Patterns

I usually don't list bad code, but I have seen some other methods circulating throughout the community, and I wanted to briefly look at the alternatives and explain why these approaches are not best.

**Multiple Route Templates**

```
// This breaks `router.navigateToRoute('post')`! Don't use this!
config.map([
  { route: ['post', 'post/:id'], title: 'Your Posts', name: 'post', moduleId: 'post' }
])
```

**Query Strings**

Passing data to the query string, e.g. `#/posts?id=3` will have the same effect as a parameter-optional route. However, this will only work on the initial load of a route. Navigating to a new route, e.g. `#/posts`, will not trigger the activation lifecycle.

**Multiple Routes**

```
// This is a second best practice, but introduces unncessary complexity. 
// Only use this if you're stuck on an older version of Aurelia
config.map([
  { route: 'post', title: 'Your Posts', name: 'post-list', moduleId: 'post' },
  { route: 'post/:id', title: 'New Posts', name: 'post-item', moduleId: 'post' }
])
```

# Links

[Original GitHub Feature Request Thread](https://github.com/aurelia/router/issues/83)
[Parameter-Optional Route Feature Pull Request](https://github.com/aurelia/route-recognizer/pull/25)
[Route Recognizer Spec examples](https://github.com/aurelia/route-recognizer/blob/master/test/route-recognizer.spec.js#L50-L86)
[Jods4 on GitHub](https://github.com/jods4)
[GoodUI](http://www.goodui.org/)