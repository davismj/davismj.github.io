---
layout: post

title: Patterns for Computing Values in an Aurelia Template
author: Matthew James Davis
category: blog
# thumb: blog/2017-11-7-aurelia-computed-from-patterns.png
blurb: Is @computedFrom the best way to compute values in an Aurelia view?
tags: aurelia computedFrom templating view 

published: true
---

GitHub and StackOverflow are full of [issues](https://github.com/aurelia/binding/search?q=computedFrom&type=Issues&utf8=%E2%9C%93) and [questions](https://stackoverflow.com/search?q=computedFrom) about the `@computedFrom` decorator in Aurelia. At its inception, Aurelia was clever enough to dirty check properties that it wasn't able to observe properly. However, inspired by [Knockout](http://knockoutjs.com/documentation/computedObservables.html), many people requested the ability to feed additional information about dependencies to the binding engine, and so `@computedFrom` was born. Though it was neat, it wasn't powerful enough to replace many of the more powerful tools that already existed within the Aurelia framework. Let's look at a few patterns that we can and should use instead of `@computedFrom`.

# Observing view-model variables

One of the first things you'll see in the navigation skeleton is this:

#### [welcome.js](https://github.com/aurelia/skeleton-navigation/blob/master/skeleton-esnext/src/welcome.js#L13)

```javascript
@computedFrom('firstName', 'lastName')
get fullName() {
  return `${this.firstName} ${this.lastName}`;
}
```

#### [welcome.html](https://github.com/aurelia/skeleton-navigation/blob/master/skeleton-esnext/src/welcome.html#L15)

```html
<div class="form-group">
  <label>Full Name</label>
  <p class="help-block">${fullName}</p>
</div>
```

## The better way: The templating engine

Every problem you can solve this way can be solved directly within the templating engine by using some mix of string interpolation, view-model functions, or value converters. This, in general, is a much better practice. Though some complain that this amounts to mixing your business logic in your view, my experience has been the opposite: Often these `@computedFrom` values amount to pulling templating into your business logic, and the above use case is no exception. Write this instead:

#### welcome.html

```html
<div class="form-group">
  <label>Full Name</label>
  <p class="help-block">${firstName} ${lastName}</p>
</div>
```

# Computing with functions of object properties

The `@computedFrom` decorator is limited to computing from properties directly on your view-model. Many have advocated for [extending the syntax](https://github.com/aurelia/binding/issues/309#issuecomment-186965603) to support properties of objects on your view-model as well.

```javascript
// Note that this doesn't work!
@computedFrom('pointA.x', 'pointA.y', 'pointB.x', 'pointB.y')
get projectedDistance() {
  let xDist = this.pointB.x - this.pointA.x;
  let yDist = this.pointB.y - this.pointA.y;
  return Math.pow(xDist, 2) + Math.pow(yDist, 2);
}
```

## The better way: A view-model function

Aurelia's binding has always been able to track function arguments as dependencies. That means we can achieve the above quite simply with this:

#### app.js

```javascript
computeProjectedDistance(x1, y1, x2, y2) {
  return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
}
```

#### app.html

```html
<div>${computeProjectedDistance(pointA.x, pointA.y, pointB.x, pointB.y)}</div>
````

Not only is this clear and readable, but the Aurelia binding engine subscribes specifically to these four properties and updates your view when they are updated, which makes this a best practice in terms of both readability and performance.

# Computing from arrays

I myself made [this call](https://github.com/aurelia/binding/issues/249) for computing from lists. In this particular case, I was looking to compute a filtered list from a source list and a filter string.

#### app.js

```javascript
@computedFrom('numbers.length', 'divisor')
get divisibleNumbers() {
  return this.numbers.filter((number) => number % this.divisor === 0);
}
```

#### app.html

```html
<ul>
  <li repeat.for="number of divisibleNumbers">${number}</li>
</ul>
```

## The better way: Value converters

Though `@computedFrom` does work here, the above code suffers a few problems. First, it's not at all readable. Looking just at your view gives the reader no intuition that `divisibleNumbers` is a computed value which depends on `divisor`. Second, it's not reusable. Nearly every time I've needed to compute from a list, the underlying logic was not business logic but generally applicable throughout my application. That's why I recommend using value converters instead:

#### multipleOfValueConverter.js

```javascript
export class MultipleOfValueConverter {
  toView(numbers, divisor) {
    return numbers.filter((number) => number & divisor === 0);
  }
}
```

#### app.html

```javascript
<require from="multipleOfValueConverter"></require>
<ul>
  <li repeat.for="number of numbers | multipleOf: divisor">${number}</li>
</ul>
```

This strategy is readable and reusuable. Do note that neither of the above strategies will observe changes to array elements. That means `numbers.forEach((number, index) => numbers[index] = number * 2);` will **not** update the filtered list or its values. 

# Computing from arrays, objects, and other complex values

If none of the above strategies will work, it is best to fall back to dirty checking without trying to compute a value. The main concern many developers have is that dirty checking a property will call the function 8 times per second. If the operation is costly this could destroy performance. However, dirty checking isn't a bad word, it is another tool in your toolbox. Dirty checking has virutally no memory or computation overhead for observation since it doesn't observe, which makes it a particularly functional strategy whenever you're computing from hundreds or thousands of variables. 

## The best way: Dirty checking

For example, let's say we are looking to map a list of points as an SVG path. Our path might require a large or variable number of coordinates and so we cannot use view-model functions. The x and y values of a single coordinate pair might change and a value converter cannot observe that. Instead, we can use a standard getter function to generate a dirty checked computed variable.

#### app.js

```javascript
get SVGPath() { 
  return `M ${this.points.map(({ x, y }) => `${x} ${y}`).join(' L ')}`;
}
```

#### app.html

```html
<path d="${SVGPath}"></path>
```

## Coming soon, an even better best way: Dirty checking binding behavior

While writing this article I found that a simple dirty checked getter function may not be powerful enough for every use case. What if we have a variable number of paths? We cannot write getter functions in advance as new paths might be created at runtime. What if we have a path with hundreds of thousands of coordinates? Even though our getter function scales linearly it can still significantly degrade performance. Therefore, I created and submitted a new [dirty checking binding behavior](https://github.com/aurelia/templating-resources/pull/333) which gives you more control over what you can dirty check and how you check it.

#### app.js

```javascript
paths = [
  [{x:1,y:1},...,{x:100000,y:100000}],
  [{x:100001,y:100001},...,{x:200000,y:200000}],
  ...,
  [{x:900001,y:900001},...,{x:1000000,y:1000000}],
];

computePath(points) {
  return `M ${this.points.map(({ x, y }) => `${x} ${y}`).join(' L ')}`;
}
```

#### app.html

```html
<svg>
  <!-- By default, the dirty binding behavior checks 10 times a second. Since 
    our function is expensive, we slow that down to once a second. --> 
  <path repeat.for="path of paths" d="${computePath(path) & dirty: 1000}"></path>
</svg>
```

# Notes 

If you take the time to read the issues, you'll see my name pop up quite a bit on a number of threads. In fact, I had come from a background of Durandal and KnockoutJS and so I was expecting some straightforward analog of the `ko.computed` object. Because I've experienced and probably created a great deal of confusion around the `@computedFrom` decorator, I believe that it is an instriniscally confusing tool and encourage others to steer clear of it. That said, there are many Aurelia projects in production environments that successfully leverage this tool. If it has been working for you, I don't think there is a any urgency to move away from it.

# Links

[Dirty Binding Behavior](https://github.com/aurelia/templating-resources/pull/333)<br />
[Dirty Binding Behavior Example](https://gist.run/?id=91c1f815f3df0ca78356a23facc769b2)<br />
[Jason Sobell on Dirty Checking Functions](http://www.sobell.net/aurelia-dirty-checking-a-function/)<br />
[Binding Behaviors Explained by Jeremy Danyow](https://www.danyow.net/aurelia-binding-behaviors/)<br />
[Why default to 10 times a second?](https://ux.stackexchange.com/questions/2/what-is-an-acceptable-response-time-for-my-ajax-ui/4#4)<br />