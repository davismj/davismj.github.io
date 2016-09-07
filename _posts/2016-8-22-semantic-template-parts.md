---
layout: post

title: Replaceable Parts and CSS Frameworks in Aurelia 
author: Matthew James Davis
blurb: Using Aurelia replaceable parts to integrate CSS frameworks into an Aurelia application.

category: blog
tags: aurelia javascript ecmascript custom element attribute semantic-ui

published: true
---
[In my last post](/blog/semantic-custom-element), we looked at best practices for integrating a CSS framework component, specifically Semantic-UI's progress bar, into an Aurelia application. This works excellently for elements that don't have content; but what if your custom element wraps signficant amounts of content that you can't simply bind in?

In this post, we're going to be writing a custom element for the Semantic-UI accordion feature. The accordion is an arbitrary list of items, each with a title and collapsible content. We're going to use replaceable parts in order to specify the content to inject into both the title and content sections of each accordion item.

# Defining Replaceable Parts

A replaceable part is a custom attribute within your custom element template that tells Aurelia which section can be replaced and how to replace it.

**accordionCustomElement.html**

```html
<template class="ui accordion">

  <!-- First, give your part a name. You will use this name to specify which 
    part you want to replace when using the custom element. Any tag that is 
    already hooked into the templating engine, for example through 
    `repeat.for`, will automatically be replaceable if you define a part name. -->
  <template repeat.for="item of items" part="item-template">

    <!-- However, you will usually need to use the `replaceable` custom 
      attribute to tell the templating engine to look for replacements when 
      the custom element is attached -->
    <div class="title" part="title-template" replaceable>
        <i class="dropdown icon"></i>
        ${item.title}
      </template>
    </div>
    <div class="content">

      <!-- The templating engine will replace the entire replacable element.
        If a certain structure is required, in this case the `div.content`
        selector, you can create a replaceable template in order to prevent
        the required structure from being modified. -->
      <template part="content-template" replaceable>
        <p>${item.content}</p>
      </template>
    </div>
  </template>
</template>
```

**accordionCustomElement.js**

```javascript
@inject(Element)
export class SAccordionCustomElement {

  @bindable items;

  constructor(element) {
    this.element = element;
  }

  attached() {
    $(this.element).accordion();
  }
}
```

# Replacing the Parts

Note that replacing parts is optional. Any part that is not replaced will continue on to use the default template defined for that part in the custom element's template.

**app.html**

```html
<s-accordion items.bind="articles">

  <!-- We use the replace-part custom attribute to specify which part 
    the template should replace. -->
  <template replace-part="content-template">
    <p>${item.blurb}</p>
  </template>
</s-accordion>
```

# A Better Way: Custom Attributes

Although this does work, I would not generally recommend this strategy. It is a fairly complex solution to a fairly simple problem. Instead, I recommend solving this problem with [a simple custom attribute](/blog/custom-attributes-part-1).

**accordionCustomAttribute.js**

```javascript
// Notice that this is identical to the custom element code above, without
// the bindable `items` property.
@inject(Element)
export class SAccordionCustomAttribute {

  constructor(element) {
    this.element = element;
  }

  attached() {
    $(this.element).accordion();
  }
}
```

**app.html**

```html
<!-- The `s-accordion` attribute enables the custom JavaScript behavior. -->
<div class="ui accordion" s-accordion>

  <!-- The biggest drawback of this strategy is the requirement that you 
    implement the required structure for the element, in this case the
    `div.title` and `div.content` selectors. However, if you are using the 
    framework, you will likely be familiar with the required structure,
    and so this is a fairly insignificant drawback. -->

  <div class="active title">
    <i class="dropdown icon"></i>
    Lawful Good
  </div>
  <div class="active content">
    <p>Lawful Goods have altruistic intentions bound to a strict moral code.</p>
  </div>

  <div class="title">
    <i class="dropdown icon"></i>
    True Neutral
  </div>
  <div class="content">
    <p>True Neutrals are chiefly interested in self-preservation through pragmatism.</p>
  </div>

  <div class="title">
    <i class="dropdown icon"></i>
    Chaotic Evil
  </div>
  <div class="content">
    <p>Chaotic Evils will behave according to their every whim with no regard for others.</p>
  </div>
  
</div>
```

This approach simplifies the JavaScript code and eliminates the custom element template, keeping all of the templating markup in one place. Though it is a bit more verbose in the template itself, it provides a much simpler, more familiar API for extending the template.

# Notes

The biggest pitfall with template parts is knowing the binding context in the replaced template. For example, in the example above, the `repeat.for="item of items"` exposes an `item` object to each replaced template. When replacing the template, you will most likely want to use this same `item` object. However, this is in no way made known to the developer when using the custom element. You would need to look directly into the custom element code to understand this. This is a strong reason against using template parts.

In fact, at one part there was talk of removing the replaceable part feature. However, the community was able to produce some specific use cases that couldn't be solved except through replaceable parts, and so it remained in code. It is still a real, supported feature of Aurelia.

# Links

[Demo Page](http://davismj.me/aurelia-semantic/#/accordion)<br />
[Accordion at Semantic-UI](http://semantic-ui.com/modules/accordion.html)<br />
[Template Part Feature Pull Request](https://github.com/aurelia/templating/commit/1d9ba1c06563a12505dd4033ff24932a9f88007e)<br />
[Replacable API docs](http://aurelia.io/hub.html#/doc/api/aurelia/templating-resources/latest/class/Replaceable)<br />