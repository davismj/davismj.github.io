---
layout: post

title: You might not need a dialog library
author: Matthew James Davis
category: blog
# thumb: blog/2017-9-1-easy-dialog.png
blurb: Learn how to create a fully featured modal dialog control
tags: aurelia dialog 

published: true
---

One of the biggest complaints I hear about Aurelia is that it doesn't have as many libraries and components as other frameworks, particularly for things like UI controls. This is frustrating to hear because I see developers using libraries for things they might not need a library for, especially when developing with a framework as flexible as Aurelia. Not only does this bloat your project, but it also forces you to depend on other developers and play by their rules when using the components. For example, I have taken over multiple projects using the aurelia-dialog library. When aurelia-dialog RC 1 was released, I had to go back into each of these projects and update the code to match the new API introduced in the RC. 

As a rule of thumb, I teach that if you *can* build a component, you should. One component that fits this rule is a modal dialog. You absolutely don't need a library for a modal dialog box, and today we're going to look at how to build one from scratch.

# Create the `<modal>` custom element

A good practice when developing a component or library is to start with the end in mind. I thought about how I would like to use the modal component, and here's what I came up with:

```html
<template>
  <require from="./modalCustomElement"></require>
  <button click.delegate="openModal()">Open Modal</button>
  <modal>
    <div class="body">
      <label>
        My Value:
        <input type="text" value.bind="myValue" />
      </label>
    </div>
    <div name="footer">
      <button click.delegate="submit()">Submit</button>
    </div>
  </modal>
</template>
```

So I can see that I a modal component seems to make sense as a custom element. Let's see what that looks like.

#### modalCustomElement.html

```html
<!-- Always decorate your custom element template tag with a class, preferably
  matching the name of your custom element. This will allow you to write
  robust css that plays well with the as-element attribute, e.g. <form as-element="modal">. -->
<template class="modal ${visible ? 'modal-visible' : ''}">

  <!-- I want my modal to have a "greyed out" background, so I need to have a 
    box in my modal that will contain the moda dialog box content -->
  <div class="modal-content">

    <!-- I also might want to add an optional header element. Since I want it
      to be optional, I will probably be using the :empty selector, so I need
      to make sure there is no whitespace in the element. I give it a slot and
      call the slot "header". -->
    <div class="modal-header"><slot name="header"></slot></div>

    <!-- Next I have the main body of the modal. It contains the default slot. -->
    <div class="modal-body">
      <slot></slot>
    </div>

    <!-- Finally, I want to include an optional footer element. Every modal
      should probably have this footer element, but almost every modal is going
      to have the same content in the footer, so I add an optional slot "footer"
      with default content. The default action will be to close the modal. -->
    <div class="modal-footer">
      <slot name="footer">
        <button click.delegate="close()">Close</button>
      </slot>
    </div>
  </div>
</template>
```

#### modalCustomElement.js

```javascript
import { inject } from 'aurelia-framework';

@inject(Element)
export class ModalCustomElement {
  
  // refs
  el;

  // view model properties
  visible = false; // This variable will track the visibility state of the modal.

  constructor(el) {
    this.el = el;
  }
  
  // Whenever a view is loaded with a modal in it, I want to make sure that the
  // modal's visiblility is set back to hidden.
  attached() {
    this.visible = false;
  }
  
  // I create an open() function. By using view-model.ref in my viewModel, I will 
  // be able to call this function to open the modal.
  open() {
    this.visible = true;
  }
  
  // I also create a close() function. This can be called externally, just like
  // open, but is also called internally by the default "Close" button in the
  // footer.
  close() {
    
    // The close function will hide the modal...
    this.visible = false;

    // ...and dispatch an event on the modal that the view model can listen for.
    this.el.dispatchEvent(
      new CustomEvent('closed', { bubbles: true })
    );
  }
}

```

# Consume the `<modal>` custom element

So far, pretty simple. Now lets see how to consume the modal component. The design from above allows me to use some shortcuts over what I had originally planned.

#### app.html

```html
<template>
  <require from="./modalCustomElement"></require>
  
  <!-- Since I use view-model.ref to add the modal view model to the binding
    context, I can just call open directly on the modal view model. -->
  <button click.delegate="modal.open()">Open Modal</button>
  
  <!-- I use view-model.ref to set the variable testModal on my view model
    to the modal's view model. This gives me access to the functions (and
    variables) on the modal view model. I also set up an event listener
    to listen for the closed event dispatched by the modal. -->
  <modal view-model.ref="modal" closed.delegate="showTypedMessage()">
    
    <!-- I'm gunna add a header here, just to make sure it works. -->
    <div slot="header">
      <b>Please type a message</b>
    </div>
    
    <!-- Since this content isn't relegated to a slot, Aurelia puts it in the
      default slot, which is the .modal-body div. The beautiful thing here is
      that the "typedMessage" binding is on my app view model. The modal
      does not need to deal with my business logic at all. It is just in the 
      business of creating modals. -->
    <label>
      Message:
      <input type="text" value.bind="typedMessage" />
    </label>
    
    <!-- I'm going to stick with the default close button, to make sure it,
      works, so I won't use the footer slot. -->

  </modal>
</template>
```

#### app.js

```javascript
export class AppViewModel {
 
  // view model properties
  typedMessage = '';
 
  // refs
  modal;
  
  // And here I have my business logic all in one place. No special handling
  // is required just because I've put it in a modal custom element. It just 
  // works.
  showTypedMessage() {
    alert(this.typedMessage);    
  }
}
```

# Adding styles

Okay. So it technically works, but it doesn't look like a modal at all. For many developers, perhaps this is the most challenging aspect of rolling your own component. I'm also not a CSS expert, but with some help from MDN and css-tricks, I was able to create the styles to make the component look like a proper modal dialog box.

#### modalCustomElement.scss

```scss
// This is the outer container of the modal. Its default view shoud be a
// full-screen element with transparent background. 
.modal { 
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  // Adding a "fade in" style transition is an easy way to make the modal 
  // feel more professional. In this case, I want it to fade from transparent
  // to black.
  background: transparent;
  transition: background 250ms ease-in-out;

  > .modal-content {

    // I used flex in order to enable the body element to fill up as much of 
    // the modal window space as possible. 
    display: flex;
    flex-direction: column;

    // I added some sizing properties to match what I need in my application
    width: 50vw;
    min-height: 20vh;
    margin: 20vh auto;
    border-radius: 6px;
    background: rgb(255,255,255);

    // Adding an "expand" style transition on the modal content is another easy
    // way to give the modal a more professional feel. In ths case, I want my
    // modal to expand from no height and width to its default height and width.  
    transform: scale(0, 0);
    transition: transform 250ms ease-in-out;

    // The ":not(:empty)" selector hides header when it is not used, which is
    // what I'm looking for since I designed it to be optional. 
    > .modal-header:not(:empty) {
      padding: 6px;
      border-bottom: 1px solid gray;
    }

    // Setting "flex: 1" when flex is not set on its siblings causes the element
    // to expand as much as possible. 
    .modal-body {
      flex: 1;
      padding: 6px;
    }

    .modal-footer {
      padding: 6px;
      text-align: right;
    }
  }

  // When the modal is visible, it should have an 80% transparent black background.
  &.modal-visible {
    background: rgba(0,0,0,0.8);

    // When the modal is visible, its should expand to its default size.
    > .modal-content {
      transform: scale(1, 1);
    }
  }

  // When the modal is not visible, we want to disable pointer events completely.
  &:not(.modal-visible) {
    pointer-events: none;
  }
}
```

Now it looks like a modal. The most important thing, though, is that this is both much *smaller* and much more *extensible* in my project than a third party library. I do not have to depend on any developers, there is no chance that I will accidentally update to a breaking change, and I don't need to read through anyone else's code if I need to make changes to the style or the behavior of the component. Though it may take more time to build the component up front, I've found that relying on my own components saves me the most time over the life of the application.

# Links
[Working gist.run](https://gist.run/?id=040775f06aba5e955afd362ee60863aa)