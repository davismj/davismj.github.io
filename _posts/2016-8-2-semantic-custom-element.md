---
layout: post

title: Custom Elements and CSS Frameworks in Aurelia 
author: Matthew James Davis
blurb: Using Aurelia custom elements to integrate CSS frameworks into an Aurelia application.
<!-- thumb: blog/2016-8-2-semantic-custom-element.png -->

category: blog
tags: aurelia javascript ecmascript custom element semantic-ui

published: true
---
Easily the most popular Aurelia-related question I see on StackOverflow is some variant of "how do I use my favorite CSS framework within Aurelia?" Most CSS frameworks today are built to be used from a `$(document).ready` callback; but rich Aurelia applications have various routes with unique views that are created dynamically according to user input. We need a way to hook into Aurelia's templating system and respond when individual elements are `ready`.

The HTML5 standard has a number of built in tags for common elements, such as `<input>`, `<table>`, or `<video>`. Custom elements are the Aurelia way of defining a new element tag that "just works". Today, we're going to build a custom element, `<s-progress>`, that uses [the progress module from Semantic-UI](http://semantic-ui.com/modules/progress.html).

# Creating a custom element

A custom element is just a simple view/view-model pair, similar to those we use to define routes. Like any other view/view-model pair, it has access to the [full activation lifecycle](http://aurelia.io/hub.html#/doc/article/aurelia/framework/latest/cheat-sheet/7), and this is how we will set-up and tear-down the CSS framework code.

**sProgressCustomElement.js**

```javascript
import { inject, bindable, customElement, bindingMode } from 'aurelia-framework';

// this is how to import jquery and semantic-ui, which we will be using
// in our progress bar custom element
import $ from 'jquery';
import 'semantic-ui';

@inject(Element)

// this tells Aurelia what the tag name of the custom element will be; 
// we can omit the decorator if our class name matches the convention 
// TagNameCustomElement
@customElement('s-progress') 

// while custom element class names are expected to be init capped, their
// respective custom element will be lower case hyphenated; our custom 
// element below translates to the <s-progress> tag
export class SProgressCustomElement {

  // we can define an optimal default binding mode for attributes that 
  // are designed to be bound only once (oneTime) or only from the 
  // viewModel (oneWay)
  @bindable({ defaultBindingMode: bindingMode.oneTime }) label;
  @bindable({ defaultBindingMode: bindingMode.oneWay }) labeled;
  @bindable progress;

  constructor(element) {
    this.element = element;
  }

  // here we enable both aurelia binding and standard HTML attributes, so 
  // we can use both syntaxes, for example <s-progress labeled> or
  // <s-progress labeled.bind="showLabel">
  bind() {

    // since we told aurelia that these properties are bindable, the binding
    // system has already given values to these properties if available, so 
    // we pull from the html attribute if those values are not set
    this.labeled = this.labeled || this.element.hasAttribute('labeled');
    this.label = this.label || this.element.getAttribute('label');
    this.progress = this.progress || this.element.getAttribute('progress');
  }

  // this lifecycle callback is called when the element is in the DOM
  // and ready for manipulation, and so this is where we call all the 
  // semantic-ui code on the element
  attached() {
    $(this.element).progress({
      text: {
        active: this.label
      }
    });
  }

  // AFAIK, semantic-ui doesn't have / need teardown functions; however, 
  // some frameworks do, and this is where you would call them
  detached() { }

  // by convention, we can listen and respond to changes in any bindable
  // property by creating a callback function called {attribute}Changed,
  // and we can use this function to call the semantic-ui api
  progressChanged(newValue) {
    $(this.element).progress('set progress', newValue);
  }
}
```

**sProgressCustomElement.html**

```html
<template class="ui progress">
  <div class="bar">

    <!-- we use show here, because we want this element present at all
      times so semantic can access it, even when it is hidden -->
    <div show.bind="labeled" class="progress"></div>

  </div>

  <!-- here too -->
  <div show.bind="label" class="label">${label}</div>
</template>
```

# Using a custom element

Next, we use the custom element in our application, just like we use any other element tag. Since we enabled both standard HTML and aurelia-flavored binding, we can use either syntax, as needed. We can also override the default binding behavior, if necessary.

**app.html**

```html
<template>
  <require from="progressCustomElement"></require>
  <s-progress class="indicating" progress.bind="progress" label="{percent}% awesome" labeled></s-progress>
  <s-progress class="inverted" progress.bind="progress" labeled.one-way="showLabel"></s-progress>
</template>
```

# Notes

This is a very brief example of how to create a custom element wrapping a css framework. Even this example doesn't completely cover all the features of the progress bar. My goal in this article is to introduce any beginning-to-intermediate developer to the concepts and some of the skills required to wrap a css framework. After writing this article, I've considered the possibility of beginning an official Aurelia-flavored Semantic-UI library; however, this would be a large undertaking. I would be honored if I could collaborate with some of my readers on this project. Please shoot me an email if this is something that might interest you.

When I started writing the example project for this article, I began using the esnext-webpack skeleton. I bailed in favor of the jspm-enabled esnext skeleton, as there were a lot of issues with getting semantic-ui to work in a webpack environment. The first reason for this is because the semantic-ui [`package.json`](https://github.com/Semantic-Org/Semantic-UI/blob/2.2.2/package.json) does not expose a main entry point. You can overcome this issue by using `import 'semantic-ui/dist/semantic.min'`. The next reason is the way that semantic-ui was looking for the jQuery global, which wasn't supported in [Easy Webpack](https://github.com/easy-webpack). I opened an issue leading to [this fix](https://github.com/easy-webpack/config-global-jquery/commit/13d0f09024fdc0828996aa3ecd487524ea6e8aad), but by this time I had already completed the article, and haven't had a chance to test it. Hopefully this information is useful to my pro-webpack readers.

# Links

[Demo Page](http://davismj.me/aurelia-semantic)
[Progress Bar at Semantic-UI](http://semantic-ui.com/modules/progress.html)
[Custom Elements at Aurelia HUB](http://aurelia.io/hub.html#/doc/article/aurelia/templating/latest/templating-custom-elements/1)
[Databinding cheat sheet](http://aurelia.io/hub.html#/doc/article/aurelia/framework/latest/cheat-sheet/5)
[EasyWebpack global jQuery config](https://github.com/easy-webpack/config-global-jquery/)
[Semantic-ui with Webpack](http://stackoverflow.com/questions/32909708/using-semantic-ui-and-jquery-with-webpack)
[jQuery dependency with Webpack](http://stackoverflow.com/questions/28969861/managing-jquery-plugin-dependency-in-webpack)