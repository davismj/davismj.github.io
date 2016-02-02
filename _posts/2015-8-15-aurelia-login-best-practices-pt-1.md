---
layout: post

title: Aurelia Authentication&#58; Multiple shells.
author: Matt Davis
thumb: blog/2015-8-15-login.png
blurb: Creating a separate login-specific Aurelia root within your Aurelia app.

category: blog
tags: aurelia login best-practices

published: true
---
Almost everyone building an Aurelia application wants to include some form of authentication. Aurelia includes a number of powerful features for handling authentication securely and effectively. We're going to look at the concept of including multiple shells, or root view models, within an Aurelia app to keep your app logic separate from your login logic.

# What is a Shell?

The shell, sometimes called the root, is the root view model of your page. The Aurelia bootstrapper is designed to automatically get your app initialized using `src/app.js` as the root. However, if you'd like to customize your app initialization, you can pass a javascript file to your body tag, for example `aurelia-app="main"`, to instruct Aurelia to load in a custom intialization file.

#### src/main.js
```javascript
export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging();

  // This line tells Aurelia to start up and then set the root view model for
  // our application. If no name is given, it defaults to loading 'app.js'.
  aurelia.start().then(app => app.setRoot());
}
```

# The Login Shell

Instead of sending the user directly into our application, we're going to request them to login first by sending them to a login shell instead. Once our user logs in, then they will be redirected to the main application. First, lets modify our initialization file to load in to direct to the login shell.

#### src/main.js
```javascript
export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging();

  aurelia.start().then(app => app.setRoot('login'));
}
```

Next, let's create a login shell. Your shell will probably be more interesting than mine, but I'm going to keep my shell to a minimum. It will only have login prompt and a function that will login and redirect to the app.

#### src/login.js 
```javascript
import { inject, Aurelia } from 'aurelia-framework';

// First, we must inject the Aurelia object. This is the same Aurelia object
// passed into our configure function on main.js.
@inject(Aurelia)
export class Login {
  
  username = '';
  password = '';
  error = '';

  constructor(aurelia) {

    // Once we have access to the Aurelia object, we can use it from
    // within our login function to set the new root view model to 
    // our main App on succesful login.
    this.login = () => {
      if (this.username && this.password) {
        aurelia.setRoot('app');
      } else {
        this.error = 'Please enter a username and password.';
      }
    }
  }
}
```

And, of course, view model will be bound to `login.html`. Since this view is actually the root view, we do not need to try to use any special tricks to customize our view around any other views; we are free to include anything we want into this view and it will always remain completely separate from our main app.

# Notes

Notice that we don't define a router in our login. In fact, there is no router in our app at all. That means that instead of merely blocking a user from accessing a route, the route doesn't exist, which means more security. Additionally, this means you can send a user to a route that doesn't exist on the login shell and redirect them to that specific route after login.

# Links

[Working Demo](http://davismj.github.io/skeleton-navigation-login-shell)
[Full source on GitHub](https://github.com/davismj/skeleton-navigation-login-shell)
[Intialization Docs](http://aurelia.io/docs.htm# startup-and-configuration)
[Aurelia Object Docs](http://aurelia.io/docs.htm# the-aurelia-object)