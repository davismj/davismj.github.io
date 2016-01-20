---
layout: post

title: Aurelia Authentication&#58; Sessions.
author: Matthew James Davis
thumb: blog/2015-9-22-aurelia-auth-pt2.png
blurb: Best practices for keeping track of logged in users.

category: blog
tags: aurelia login auth best-practices

published: true
---
Last time we looked at best practices for creating a login page leveraging Aurelia roots. This time we're going to look at how to build a service that can handle tracking information about authentication between sessions, and can communicate to the various parts of your application

#Singletons and Transients
Aurelia has two modes of loading classes (or modules) with the dependency injection framework. One is *transient* mode, which means that a new instance of the class is created every time the dependency is injected. The other is *singleton* mode, which means that only one instance is created and the same instance is passed to each depndency injection. In general, transients should only be used when you expect to have multiple instances of that class alive in your app at the same time. The default mode is singleton.

#Configuring AuthService
First, we're going to need to define a few parameters to pass to AuthService:

1. Where the service is located.
2. What endpoints are available.
3. Where to store the session information.

####src/config.js
```javascript
// If this service was abstracted to a plugin, we would instead pass
// this information to the plugin's config function. For now, we 
// export this object for simplicity. In a larger application, there
// would be other, unrelated settings in the config as well.
export default {
  baseUrl: 'http://www.mocky.io/v2/',
  loginUrl: '560122ef9635789e120aa366',
  tokenName: 'ah12h3'
};
```

#Creating the AuthService
We want to create a general `AuthService` that any part of the application can use to perform authentication related tasks; since there is one service throughout the application, it needs to be a singleton. 

There are a few things the `AuthService` needs to do:

1. On load, it needs to remember the most recent login information.
2. It needs to expose login and logout functions.
3. Any part of the aurelia app should be able to query for current status.

####src/AuthService.js
```javascript
import config from 'config';

@inject(Aurelia, HttpClient)
export default class AuthService {

  // As soon as the AuthService is created, we query local storage to
  // see if the login information has been stored. If so, we immediately
  // load it into the session object on the AuthService.
  constructor(Aurelia, HttpClient) {

    HttpClient.configure(http => {
      http.withBaseUrl(config.baseUrl);
    });

    this.http = HttpClient;
    this.app = Aurelia;

    this.session = JSON.parse(localStorage[config.tokenName] || null);
  }

  // The login function needs to abstract away all of the details about
  // how we track and expose login information. A more advanced app might
  // want the login function to pass back a promise so it can perform
  // additional tasks on login, but we keep things simple here.
  login(username, password) {
    this.http
      .post(config.loginUrl, { username, password })
      .then((response) => response.content)
      .then((session) => {
        localStorage[config.tokenName] = JSON.stringify(session);
        this.session = session;
        this.app.setRoot('app');
    });
  }

  // The logout function reverses the actions of the login function. 
  // It is less common for logout to be async, but logout could also
  // return a promise if there were a need.
  logout() {
    localStorage[config.tokenName] = null;
    this.session = null;
    this.app.setRoot('login')
  }

  // A basic method for exposing information to other modules.  
  isAuthenticated() {
    return this.session !== null;
  }
}
```

#Using the AuthService
Now we can begin using the `AuthService` module throughout our application. 

####src/main.js
```javascript
// After starting the aurelia, we can request the AuthService directly
// from the DI container on the aurelia object. We can then set the 
// correct root by querying the AuthService's isAuthenticated method.
aurelia.start().then(() => {
  var auth = aurelia.container.get(AuthService);
  let root = auth.isAuthenticated() ? 'app' : 'login';
  aurelia.setRoot(root);
});
```

####src/app.html
```html
<!-- We can call the logout() method directly from the AuthService. -->
<ul class="nav navbar-nav navbar-right">
  <li><a href="#" click.delegate="auth.logout()">Log Out</a></li>
</ul>
```

####src/login.js
```javascript
// Or, if we want to add additional logic to the function, 
// we can call it within another method on our view model.
export class Login {
  login() {
    if (this.username && this.password) {
      this.auth.login(this.username, this.password)
    } else {
      this.error = 'Please enter a username and password.';
    }
  }
}
```

#Notes
There are a few placeholders in the source code that I may dive into in another blog post. In particular, the `can(permission)` method on the login service can be used in conjunction with an enum or object and a bitmask on the server to greatly simplify handling permissions. Also, the mock API passes back a hash value. An even better practice would be to add a call to a verification endpoint that takes in a hash and returns the correlated session object. This would prevent a user from tampering with local storage. However, for both of these items, **you must always double check a user's permission on the server**. You can never be sure that the client hasn't been hacked; this is one of the drawbacks to single-page applications.

When writing this blog, I stumbled onto a bug where logging in, out, and back in again caused the router-view in app.html to deactivate permanently. I hvae created an issue here: [https://github.com/aurelia/framework/issues/212](https://github.com/aurelia/framework/issues/212).

#Links
[Working Demo](https://davismj.github.io/aurelia-session-example)<br />
[Full Source in Github](https://github.com/davismj/aurelia-session-example)<br />
[App for Mocking REST APIs](http://www.mocky.io/)<br />
[Aurelia OAuth2 Plugin](http://blog.opinionatedapps.com/aureliauth-a-token-based-authentication-plugin-for-aurelia/)<br />
[Aurelia Auth Best Practices: Multiple Shells](http://davismj.me/blog/aurelia-login-best-practices-pt-1/)<br />
[Aurelia Getting Started Cheat Sheet](http://www.cheatography.com/erikch/cheat-sheets/aurelia-getting-started/)<br />
[Michael Lambert on App State Services](http://hobbit-on-aurelia.net/appstate/)<br />
[Patrick Walters on App Organization](http://patrickwalters.net/my-best-practices-for-aurelia-application-structure/)<br />