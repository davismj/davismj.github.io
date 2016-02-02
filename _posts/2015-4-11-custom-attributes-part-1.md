---
layout: post

title: Aurelia Custom Attributes
author: Matthew James Davis
thumb: blog/2015-4-11-customattr.png
blurb: Introduction to custom Aurelia-enabled HTML attributes.

category: blog
tags: aurelia data-binding custom-attribute es7 decorators

published: true
---
We're going to create a simple demo that allows us to write and preview markdown in real time. To accomplish this, we are going to create an Aurelia **Custom Attribute** that reads and formats markdown. This particular example uses the new ES7 syntax in the Babel 5.0 transpiler.

# What is a Custom Attribute?

Many HTML elements come with attributes that affect how the element looks or behaves. A common example is the `<input />` element. Without any attributes, the `<input />` element is a simple text box. However, if we modify the type attribute `<input type="button" />`, the input element becomes a button. Using an attribute allows us to describe the look and behavior of the element without writing any code.

One of the hallmarks of a well written Aurelia application is a clear *separation of concerns*; the code that describes the logic of our application should not need to know about the specifics of where and how it is used in the HTML. To help us achieve this, Aurelia allows us to define new HTML attributes, called **Custom Attributes**, that work similarly to HTML attributes. Once we define a Custom Attribute in code we can use it throughout our HTML without writing any additional code.

# How to write a Custom Attribute

For our example, we're going to write a custom attribute that instructs the HTML element to read and format markdown code.

#### markdown.editor.js
```javascript
// In our viewModel, we define the default markdown text using the
// ES7 Class Properties syntax.
export class MarkdownEditor {
  mymarkdowntext = '# markdown\n## is\# awesome';
}
```

#### markdown.editor.html
```html
<template>
  <!-- In our view, we tell Aurelia that we depend on something from the 
    file "components/markdown.js". Aurelia will inspect the file and register
    all the things inside automagically. -->
  <require from="components/markdown"></require>

  <!-- We use the markdown custom attribute and bind it to the value 
    "mymarkdowntext" from our viewModel. -->
  <div markdown.bind="mymarkdowntext"></div>
</template>
```

#### components/markdown.js
```javascript
// The first thing we need to do is import our dependencies. Here, we're using
// the inject decorator from aurelia-framework and Showdown, a markdown parser.
import { inject } from 'aurelia-framework';
import Showdown from 'showdown';

// We create a class called MarkdownCustomAttribute. By giving it this name, we 
// instruct Aurelia to create a custom attribute called "markdown". When Aurelia
// finds an HTML element with the "markdown" attribute, it will create a new 
// instance of this class for that attribute. By decorating the class with the 
// @inject(Element) decorator, we tell Aurelia to pass the HTML element as an 
// argument to the constructor function.
@inject(Element)
export class MarkdownCustomAttribute {  

  // In our constructor, we capture the HTML element corresponding to this 
  // instance of the markdown attribute. We also instantiate a new Showdown
  // converter object.
  constructor(element) {
      this.element = element;
      this.converter = new Showdown.converter();
  }

  // If the custom attribute is bound to a variable--in our case, it is bound to
  // mymarkdowntext--then Aurelia will call the valueChanged function when the 
  // value of that variable changes. When the variable of our attribute changes,
  // we want to read and format that value as markdown and insert the output 
  // into the innerHTML of our element.
  valueChanged(newValue, oldValue) {
      this.element.innerHTML = this.converter.makeHtml(
          newValue
              .split('\n')
              .map(line => line.trim())
              .join('\n')
      );
  }
}
```

# Notes

This particular example uses Aurelia *conventions* to keep things simple. By default, when you create a class for a custom attribute that follows the naming convention `{AttributeName}CustomAttribute`, Aurelia does some work behind the scenes to register your Custom Attribute and make it bindable to a single variable. Additionally, it listens to that variable and calls the `valueChanged` function whenever that value changes. However, all of these conventions are configurable. We will take a look at a more advanced example in a future post.

# Links

[Live example](https://davismj.github.io/aurelia-ide/#/markdown-preview)<br />
[Full source on GitHub](https://github.com/davismj/aurelia-ide)<br />
[Babel 5 release notes](http://babeljs.io/blog/2015/03/31/5.0.0/)<br />
[Showdown docs](https://github.com/showdownjs/showdown)