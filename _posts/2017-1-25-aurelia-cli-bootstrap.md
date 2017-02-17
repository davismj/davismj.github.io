---
layout: post

title: Getting Started with Aurelia CLI and Boostrap
author: Matthew James Davis
category: blog
thumb: blog/2017-1-25-aurelia-cli-bootstrap.jpg
blurb: Get started with Aurelia and Bootstrap in 5 minutes using the Aurelia CLI.
tags: aurelia aurelia-cli bootstrap javascript ecmascript

published: true
---

A reader struggling with the Aurelia CLI reached out to me for help:

<blockquote class="email">

  <p>I really like Aurelia. It was love at first sight. My greatest frustration however and by far is the setup procedures best practices.</p>

  <p>I installed the aurelia-cli and used "au new project" to create a "Hello, World!" Aurelia application. It was so easy! Next, I need to install Bootstrap (or some other plugin) but I am not exactly sure how to do this. Do I add some line to package.json and then run npm install or jspm or both? Or do I tweak yet another .json file before or after or what? It differs depending on which tutorial I am following, and now I'm confused and frustrated.</p>

  <p>Please advise on the best way to install and use packages or plugins, from searching for its existance to using it in actual code.</p>
  <br />
  Thanks,<br />
  Nathan
</blockquote>

Today, I'm going to do my best to answer his question using Bootstrap as an example.

# Install the CLI

Getting started with the CLI is as easy as installing the package with npm. I recommend installing it locally to prevent any conflict across projects. 

```
> npm install aurelia-cli
```

# Generate the Project

Next, let's use the aurelia-cli to generate the project, using the `au new project` command. This will create a folder named "project" and generate a configured Aurelia project in the folder.

``` 
> au new project
> No Aurelia project found.
>                       _ _          ____ _     ___
>   __ _ _   _ _ __ ___| (_) __ _   / ___| |   |_ _|
>  / _` | | | | '__/ _ \ | |/ _` | | |   | |    | |
> | (_| | |_| | | |  __/ | | (_| | | |___| |___ | |
>  \__,_|\__,_|_|  \___|_|_|\__,_|  \____|_____|___|
> 
> 
> Would you like to use the default setup or customize your choices?
> 
> 1. Default ESNext (Default)
>    A basic web-oriented setup with Babel for modern JavaScript
>    development.
> 2. Default TypeScript
>    A basic web-oriented setup with TypeScript for modern JavaScript
>    development.
> 3. Custom
>    Select transpilers, CSS pre-processors and more.
> 
> [Default ESNext]> [Enter]
> 
> Project Configuration
> 
>     Name: project
>     Platform: Web
>     Transpiler: Babel
>     Markup Processor: Minimal Minification
>     CSS Processor: None
>     Unit Test Runner: Karma
>     Editor: Visual Studio Code
> 
> 
> Would you like to create this project?
> 
> 1. Yes (Default)
>    Creates the project structure based on your selections.
> 2. Restart
>    Restarts the wizard, allowing you to make different selections.
> 3. Abort
>    Aborts the new project wizard.
> 
> [Yes]> [Enter]
> Project structure created and configured.
> 
> Would you like to install the project dependencies?
> 
> 1. Yes (Default)
>    Installs all server, client and tooling dependencies needed to build
>    the project.
> 2. No
>    Completes the new project wizard without installing dependencies.
> 
> [Yes]> [Enter]

> Congratulations! Your Project "project" Has Been Created!
> 
> Now it's time for you to get started. It's easy. First, change directory into
> your new project's folder. You can use cd project to get
> there. Once in your project folder, simply run your new app with au
> run. Your app will run fully bundled. If you would like to have it
> auto-refresh whenever you make changes to your HTML, JavaScript or CSS, simply
> use the --watch flag. If you want to build your app for production,
> run au build --env prod. That's just about all there is to
> it. If you need help, simply run au help.
> 
> Happy Coding!
```

Now, we can make sure everything is working properly by typing `au run` in the `project` folder. 

```
> cd project
> au run
> Starting 'readProjectConfiguration'...
> Finished 'readProjectConfiguration'
> Starting 'processMarkup'...
> Starting 'processCSS'...
> Starting 'configureEnvironment'...
> Finished 'processCSS'
> Finished 'processMarkup'
> Finished 'configureEnvironment'
> Starting 'buildJavaScript'...
> Finished 'buildJavaScript'
> Starting 'writeBundles'...
> Tracing app...
> Tracing environment...
> Tracing main...
> Tracing resources/index...
> Tracing app...
> Tracing aurelia-binding...
> Tracing aurelia-bootstrapper...
> Tracing aurelia-dependency-injection...
> Tracing aurelia-event-aggregator...
> Tracing aurelia-framework...
> Tracing aurelia-history...
> Tracing aurelia-history-browser...
> Tracing aurelia-loader-default...
> Tracing aurelia-logging-console...
> Tracing aurelia-route-recognizer...
> Tracing aurelia-router...
> Tracing aurelia-templating-binding...
> Tracing text...
> Tracing aurelia-templating-resources...
> Tracing aurelia-templating-router...
> Tracing aurelia-testing...
> Writing app-bundle.js...
> Writing vendor-bundle.js...
> Finished 'writeBundles'
> Application Available At: http://localhost:9000
> BrowserSync Available At: http://localhost:3001
```

# Install Bootstrap

Now, let's install Bootstrap. Bootstrap is a tricky package. It depends on jQuery and contains CSS files, making it an excellent example. First, install with npm using `--save`.

```
> npm install bootstrap@3 jquery@2 --save
> project@0.1.0 path\to\project
> +-- bootstrap@3.3.7
> `-- jquery@2.2.4
```

The default Aurelia CLI project bundles all of your project's dependencies and packages them into one optimized file. Since we've installed two new dependencies, we want to add them to the bundle. Unfortunately, as my reader noted, this requires hand editing the project's `aurelia.json` file.

### aurelia.json
```javascript
{
  ...
  "build": {
    ...
    "bundles": [
      ...
      {
        // we want to add jquery and bootstrap to the vendor-bundle.js file
        "name": "vendor-bundle.js",
        ...
        "dependencies": [
          ...

          // jquery only requires one file, so we just type the name of the npm module
          "jquery",

          // bootstrap is a bit more complicated, so we need a configuration object
          {

            // the name of the package we will import in our application
            "name": "bootstrap",

            // the base path that we will use to load files for this package
            "path": "../node_modules/bootstrap/dist",

            // the main file to be imported when using `import 'bootstrap';`
            "main": "js/bootstrap.min",

            // files that this package depends on, which should be loaded first
            "deps": ["jquery"],

            "exports": "$",

            // other files that will need to be included in the bundle, which, in this
            // case, is the bootstrap css file
            "resources": [
              "css/bootstrap.css"
            ]
          }
        ]
      }
    ]
  }
}
```

# Use Bootstrap

Finally, we need to use Bootstrap in our application. Let's copy in the HTML from the [Accordion Example](http://getbootstrap.com/javascript/#collapse-example-accordion). We will need to use the require tag in this view to have Aurelia bring in the Bootstrap css.

### app.html
```html
<template>

  <!-- first, we include the Bootstrap css, which was bundled as "css/bootstrap.css" -->
  <require from="bootstrap/css/bootstrap.css"></require>

  <!-- next, lets drive the accordion example through data in our view model -->
  <div class="container">

    <h1>Pokémon</h1>

    <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
      <div class="panel panel-default" repeat.for="item of items">
        <div class="panel-heading" role="tab" id="heading-${$index}">
          <h4 class="panel-title">
            <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse-${$index}" aria-expanded="true" aria-controls="collapse-${$index}">
              ${item.title}
            </a>
          </h4>
        </div>
        <div id="collapse-${$index}" class="panel-collapse collapse ${$first && 'in'}" role="tabpanel" aria-labelledby="heading-${index}">
          <div class="panel-body">
            ${item.text}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

The collapse control in Bootstrap requires the Bootstrap javascript file. Let's import it in the associated view model and add some data to drive the view.

### app.js
```javascript
// Importing libraries can be tricky as there are different syntaxes based on how the library was written.
// Bootstrap was written to export its functions to a global '$' variable, which means that the library
// doesn't export anything itself. Therefore, we use the import 'lib' to tell the module loader to import
// the library, which then registers itself to a global variable.
import 'bootstrap';

export class App {
  constructor() {
    this.items = [{
      title: "Charmander",
      text: "Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail."
    },{
      title: "Squirtle",
      text: "After birth, its back swells and hardens into a shell. Powerfully sprays foam from its mouth."
    },{
      title: "Bulbasaur",
      text: "A strange seed was planted on its back at birth. The plant sprouts and grows with this POKéMON."
    }]
  }
}
```

# Notes

The CLI is a powerful tool, but I would still only recommend it to beginners. The purpose of the CLI is to hide away some of the advanced features of JavaScript tooling so that you can get started learning and coding with Aurelia quickly. That said, it is still a powerful tool, and the project it creates is an extremely strong jumping off point for any project. 

The content of this blog article is mostly identical to the [Contact Manager Tutorial](http://aurelia.io/hub.html#/doc/article/aurelia/framework/latest/contact-manager-tutorial). In fact, I bring nothing new to this discussion except my own particular style of teaching and explanation. I highly recommend you walk through that tutorial if you're interested in learning more.

# Links

[Source Code](http://github.com/davismj/aurelia-cli-bootstrap-example)<br />
[Working Example](http://davismj.me/aurelia-cli-bootstrap-example)<br />
[Contact Manager Tutorial](http://aurelia.io/hub.html#/doc/article/aurelia/framework/latest/contact-manager-tutorial)<br />
[What is the Aurelia CLI by Erik Hanchett](http://www.programwitherik.com/what-is-aurelia-cli-how-does-it-work/)<br />
[Aurelia CLI Docs](http://aurelia.io/hub.html#/doc/article/aurelia/framework/latest/the-aurelia-cli)<br />
[Bootstrap 3](http://getbootstrap.com/)<br />