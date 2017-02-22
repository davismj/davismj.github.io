---
layout: post

title: Advanced Table Templating in Aurelia
author: Matthew James Davis
category: blog
blurb: Make table templates bend to your will.
tags: aurelia templating html tables

published: true
---
<style>
.table-example td, .table-example th {
  border: 1px dashed;
  padding: 0.5rem;
}
</style>

Working with `<table>` tags in an Aurelia template is pretty straightforward. However, due to limitations of HTML and how the browser will parse `<table>` elements and their children, there is a specific pattern you must follow when building more complicated templates within a table in Aurelia. Today, we'll master that pattern.

# Basic Tables

Let's say you have a list of people that you want to put into a table in an Aurelia application. Using basic templating markup works just as you'd expect.

#### table.html
```html
<template> 
  <table>
    <thead><tr>

      <!-- Sometimes, people are tempted to drive the fields dynamically. 
        Unless your records are truly dynamic, I recommend using field 
        names directly in the template as a best practice for readability
        and maintainability -->
      <th>Name</th>
      <th>Address</th>
      <th>Contact</th>
    </tr></thead>
    <tbody>
      <tr repeat.for="person of people">
        <td>${person.name}</td>
        <td>${person.address}</td>
        <td>${person.email}</td>
      </tr>
    </tbody>
  </table>
</template>
```

And here's the output:

<table class="table-example">
  <thead><tr>
    <th>Name</th>
    <th>Address</th>
    <th>Contact</th>
  </tr></thead>
  <tbody>
    <tr>
      <td>Matt Davis</td>
      <td>PO Box 963, New York, NY 10108</td>
      <td>davis.matthewjames@gmail.com</td>
    </tr>
  </tbody>
</table>

# Advanced Tables

Now, let's say that we're not listing people, but contact information. That is, one person may have multiple phone numbers and email addresses. The browser expects there to be a `<tbody>` containing several `<tr>`, and **nothing else**. In this case, we need to use a "containerless template" or `<template containerless>` to handle the advanced templating logic. This will instruct Aurelia to process the template logic, and then remove the `<template>` tag when building the view. Here's how that looks:

#### table.html
```html
<template> 
  <table>
    <thead><tr>
      <th>Name</th>
      <th>Address</th>
      <th>Contact</th>
    </tr></thead>
    <tbody>
      <!-- This template will generate the nested, repeated rows for each person. 
        As always, if there are elements in the phones (or emails) array, no 
        content will be generated from the template. -->
      <template repeat.for="person of people" containerless>
        <tr repeat.for="phone of person.phones">
          <td>${person.name}</td>
          <td>${person.address}</td>
          <td>${phone}</td>
        </tr>
        <tr repeat.for="email of person.emails">
          <td>${person.name}</td>
          <td>${person.address}</td>
          <td>${email}</td>
        </tr>
      </template>
    </tbody>
  </table>
</template>
```

And here's the output: 

<table class="table-example">
  <thead><tr>
    <th>Name</th>
    <th>Address</th>
    <th>Contact</th>
  </tr></thead>
  <tbody>
    <tr>
      <td>Matt Davis</td>
      <td>PO Box 963, New York, NY 10108</td>
      <td>850 329 5553</td>
    </tr>
    <tr>
      <td>Matt Davis</td>
      <td>PO Box 963, New York, NY 10108</td>
      <td>davis.matthewjames@gmail.com</td>
    </tr>
    <tr>
      <td>Matt Davis</td>
      <td>PO Box 963, New York, NY 10108</td>
      <td>davismj@foursails.co</td>
    </tr>
  </tbody>
</table>

# Custom Elements as Rows or Columns

Finally, let's say we have a custom element with complex, specific logic that belongs in a table. If possible, I recommend against this pattern, as I believe there are usually better ways to solve the problem directly in the view-model. If necessary, this behavior can be accomplished by using the "as-element" attribute. This will instruct aurelia to treat the element as the specified custom element, using the associated view and view model and invoking the binding lifecycle, but will put the resulting content into the original tag. This behavior can be used on any HTML tags, however we only want to use this pattern when specific tags are required by the browser, such as in the case of tables. Here is how we do it:

#### table.html
```html
<template> 
  <require from="components/email-row" />
  <require from="components/phone-col" />

  <table>
    <thead><tr>
      <th>Name</th>
      <th>Address</th>
      <th>Contact</th>
    </tr></thead>
    <tbody>
      <template repeat.for="person of people" containerless>
        <tr repeat.for="phone of person.phones">
          <td>${person.name}</td>
          <td>${person.address}</td>
          <td as-element="phone-col">${phone}</td>
        </tr>
        <tr as-element="email-row" repeat.for="email of person.emails">
          <td>${person.name}</td>
          <td>${person.address}</td>
          <td>${email}</td>
        </tr>
      </template>
    </tbody>
  </table>
</template>
```

# Notes

This doesn't work in IE11 at the time of writing. There has been some talk directly from Rob about the possibility of implementing a template start and end syntax, inspired by ng-repeat-start and ng-repeat-end from Aurelia 1. I personally hated this syntax as it was misleading as to *what* was being repeated. The thread is available here: [https://github.com/aurelia/html-template-element/issues/3]()

# Links

[Aurelia Templating Basics](http://aurelia.io/hub.html#/doc/article/aurelia/templating/latest/templating-basics)
[Aurelia Templating on Github](https://github.com/aurelia/templating)
