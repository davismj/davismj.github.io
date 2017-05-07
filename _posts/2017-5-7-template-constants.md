---
layout: post

title: TypeScript Enums in Aurelia Templates
author: Matthew James Davis
category: blog
# thumb: blog/2017-5-7-template-constants.png
blurb: Directly use your TypesScript enums in your Aurelia templates
tags: aurelia typescript templating 

published: true
---

The TypeScript enum is a popular feature helping developers with a background in compiled languages feel more at home on the front-end. Though there are lots of different ways to work with enums in your Aurelia templates, some methods are better than others. Today we're going to look at the very best practices for using TypeScript enums in an Aurelia template.

# Using ViewEngineHooks

Aurelia provides many tools for extending the behavior of templates, including `CustomElement` and `ValueConverter`. A lesser known tool called `ViewEngineHooks` is the perfect way for adding constants such as TypeScript enums to an Aurelia template.

First, lets assume that we have the following enum:

#### mediaTypes.ts

```javascript
// Pro Tip: By starting our enum at 1, we ensure that all values in the enum 
// are truthy.
export enum MediaType {
  Book = 1,
  Video,
  Blog,
  Article,
  Podcast
}
```

Next, lets create a `ViewEngineHooks` for our `MediaType` enum:

#### mediaTypeViewEngineHooks.ts

```javascript
import { ViewEngineHooks, View } from 'aurelia-framework';
// import { viewEngineHooks } from 'aurelia-binding';
import { MediaType } from './mediaTypes.ts';

// By convention, Aurelia will look for any classes of the form 
// {name}ViewEngineHooks and load them as a ViewEngineHooks resource. We can
// use the @viewEngineHooks decorator instead if we want to give the class a
// different name.
export class MediaTypeViewEngineHooks implements ViewEngineHooks {
  
  // The `beforeBind` method is called before the ViewModel is bound to
  // the view. We want to expose the enum to the binding context so that
  // when Aurelia binds the data it will find our MediaType enum.
  beforeBind(view: View) {

    // We add the enum to the override context. This will expose the enum
    // to the view without interfering with any properties on the
    // bindingContext itself.
    view.overrideContext['MediaType'] = MediaType;

    // Since TypeScript enums are not iterable, we need to do a bit of extra
    // legwork if we plan on iterating over the enum keys.
    view.overrideContext['MediaTypes'] = 
      Object.keys(MediaType)
        .filter((key) => typeof MediaType[key] === 'number');
  }
}
```

Finally, we can load the hooks into our view using `<require>` just like any other view resource. We also have the option to globalize the resource.

#### home.html

```html
<template>

  <!-- When we require it in, Aurelia inspects the content, finds the 
    MediaTypeViewEngineHooks and recognize it as ViewEngineHooks. It fires
    the beforeBind(view) method, which adds MediaType as a variable to our
    view's binding context. -->
  <require from="./mediaTypesViewEngineHooks"></require>

  <form>
    <div> 
      <label for="media-type">Select a type</label>
      <select id="media-type" value.bind="type">

        <!-- When we iterate, we need to iterate over the MediaTypes variable,
          which is the iterable version of the MediaType enum. -->
        <option value.bind="MediaType[type]" repeat.for="type of MediaTypes">${type}</option>
      </select>

      <!-- We can use the MediaType enum to get the string associated with the 
        enum's numerical value. -->
      <div>You've selected ${type} (${MediaType[type]})</div>
    </div>
  </form>

</template>
```

# Notes 

This pattern is not limited to Enums, but I recommend only using this pattern to add read-only values to your templates. Furthermore, you can use [`aurelia.globalResources`](http://aurelia.io/hub.html#/doc/article/aurelia/templating/latest/templating-html-behaviors-introduction/5) to introduce globally available constants. For example, you can use the following code to expose the current date and time anywhere in your view:

```javascript
beforeBind(view: View) {

  // Since this is a getter function, it will be dirty checked. In this this
  // use case, the value will always be dirty so it makes sense. Just be sure
  // to throttle it with the throttle binding behavior.
  Object.defineProperty(view.overrideContext, 'now', { 
    get() { return new Date() } 
  });
}
```

`ViewEngineHooks` has several extensibility points; this is just one use case. Most of the other uses cases are quite advanced, and include compiling, caching, and manipulating `View` (not template) objects. You can read the docs here: [http://aurelia.io/hub.html#/doc/api/aurelia/templating/latest/interface/ViewEngineHooks](http://aurelia.io/hub.html#/doc/api/aurelia/templating/latest/interface/ViewEngineHooks).

# Links
[TypeScript Enum Docs](https://www.typescriptlang.org/docs/handbook/enums.html)<br />
[Enum from TypeScript Deep Dive](https://basarat.gitbooks.io/typescript/docs/enums.html)<br />
[ViewEngineHooks Interface](https://github.com/aurelia/templating/blob/7693dbd65e59e428e4052922920145b76240f3cf/src/view-resources.js#L26)<br />
[Relevant GitHub issue](https://github.com/aurelia/templating-binding/issues/88)<br />
[Enumify](http://2ality.com/2016/01/enumify.html)<br />
[enumjs](https://www.npmjs.com/package/node-enumjs)<br />