---
layout: post

title: Drag-and-drop in Aurelia
author: Matthew James Davis
category: blog
thumb: blog/2016-7-25-aurelia-drag-and-drop.png
blurb: Creating a drag-and-drop custom attribute in Aurelia using interact.js
tags: aurelia drag-and-drop interactjs javascript ecmascript 

published: true
---
Aurelia's flexible binding system integrates well with all browser events, even custom events. However, the browser and its fairly rigid, opinionated drag-and-drop eventing can be very frustrating to integrate with Aurelia, and many drag-and-drop libraries do little to improve the situation. This is not the case for [interact.js](http://interactjs.io/), an excellent little library that fires enhanced, flexible drag-and-drop events. Today we're going to integrate interact.js and Aurelia.

# What is interact.js? 
Where other libraries look to enhance the native drag-and-drop functionality, interact.js simply defines and triggers its own events. It provides you with event information that the browser doesn't and can't, such as an explicit connection between the dragged element and the drop target, and abstracts away concepts like inertia, so that they just work. More importantly, interact.js does *not* try to figure out what a drag event should do; instead, it lets you decide how to handle the event. This makes integration with Aurelia--where declaratively defining event behaviors is the name of the game--a breeze.

# interact.js events 
interact.js provides a number of different events, including resize and rotation events. Today, we're just going to look at the `draggable` event. In order to make an element draggable, we wrap the element as an interact object and call `draggable()` on it, and configure some event handlers.

```javascript
interact('.draggable')
  .draggable()
  .on('dragstart', ondragstart)
  .on('dragmove', ondragmove)
  .on('draginertiastart', ondraginertiastart)
  .on('dragend', ondragend);
});
```

The event handlers will be called on their respective events and passed an `InteractEvent` object.

```javascript
class InteractEvent {
  target // The element that is being interacted with
  interactable // The Interactable that is being interacted with
  interaction // The Interaction that the event belongs to
  x0, y0 // Page x and y coordinates of the starting event
  clientX0, clientY0 // Client x and y coordinates of the starting event
  dx, dy // Change in coordinates of the mouse/touch
  velocityX, velocityY // The Velocity of the pointer
  speed // The speed of the pointer
  timeStamp // The time of creation of the event object
}
```

# Integration with Aurelia
This approach to firing events is very jQuery-esque. In order to support a more Aurelia-style declarative binding, we're going to create a custom attribute that calls the above code, and forwards the event handlers to the DOM, so the Aurelia binding engine can listen in.

#### interactDraggableCustomAttribute.js

```javascript
import { inject, bindable, bindingMode } from 'aurelia-framework';
import * as interact from "interact";

@inject(Element)
export class InteractDraggableCustomAttribute {
  
  // we make options bindable, so that the interact draggable options can be customized declaratively
  @bindable({ defaultBindingMode: bindingMode.oneTime }) options;
  
  constructor(element) {
    this.element = element;
  }
  
  attached() {
    interact(this.element)

      // we can set default options if we want, overriding any options that were passed in
      .draggable(Object.assign({}, this.options || {}))

      // for each event, we dispatch an bubbling, HTML5 CustomEvent, which the aurelia
      // binding engine will be able to listen for
      .on('dragstart', (event) => this.dispatch('interact-dragstart', event))
      .on('dragmove', (event) => this.dispatch('interact-dragmove', event))
      .on('draginertiastart', (event) => this.dispatch('interact-draginertiastart', event))
      .on('dragend', (event) => this.dispatch('interact-dragend', event));
  }
  
  dispatch(name, data) {
    this.element.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        detail: data
      })
    );
  }
}
```

Now, we can use the custom attribute in a syntax that should feel familiar to every Aurelia developer.

#### home.html 

```html
<template> 
  <div interact-draggable.bind="{ inertia: false }"
    interact-dragmove.delegate="moveElement($event)"></div>
</template> 
```

#### home.js

```javascript
export class HomeViewModel {
  
  // this is the recommended event handler from the interact homepage, updated
  // as event.detail is the interact event
  moveElement(customEvent) {

    let event = customEvent.detail;
    let target = event.target,

          // keep the dragged position in the data-x/data-y attributes
          x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
          y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }
}
```

# Notes
Though the article was presented as a how-to drag-and-drop, the more important concept here is how to integrate a third-party library with Aurelia, a question that is asked repeatedly on StackOverflow and Gitter. Though the specifics of what goes into the code will vary from library to library, integrating any library with Aurelia follows this basic strategy.

# Links
[interact.js](http://interactjs.io/)
[Drag-and-drop in Aurelia with Dragula](https://www.danyow.net/drag-and-drop-with-aurelia/)
[Drag-and-drop in Aurelia using Sortable](http://ilikekillnerds.com/2015/09/aurelia-and-dragdrop-using-sortable/)
[Native drag-and-drop with Aurelia](http://stackoverflow.com/questions/28357530/drag-and-drop-in-aurelia-not-working)