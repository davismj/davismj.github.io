---
layout: post

title: Perfect Select All Checkbox in 3 Lines of Aurelia Code
category: blog
blurb: Checkboxes are quick and easy in Aurelia applications. Are you using them correctly?
tags: aurelia javascript binding cheat-sheet

published: true
---
Standard HTML checkboxes have some superpowers in Aurelia, but I'm always astonished to find out when one of my customers isn't taking full advantage of them. In addition to the standard `checked` and `indeterminate` attributes, checkboxes and radio buttons have a `model` bindable attribute that handles some pretty powerful use cases. By combining all these features, we can create a table with selectable rows and a select all checkbox at the top.

First, we'll start by creating a basic checkbox and some radio buttons. Then, we'll use the `model` binding to make the rows of a table selectable. Finally, we'll use the bindings to add a select all checkbox to the top of our table.

# A Standard Checkbox

The standard HTML `checked` property is a boolean attribute. When you bind it to a variable, the result is a boolean value. Let's bind to a variable `canSort` which toggles the ability to sort.

#### table.html

```html
<label>
  <input type="checkbox" checked.bind="canSort" />
  Enable Sorting
</label>
```

This syncs the `canSort` variable to the `checked` attribute and state of the checkbox. When the checkbox is checked, `canSort === true`. When it is unchecked, `canSort === false`.

# A Standard Radio Button

Radio buttons also have a checked property, but the default value is `on` or `off`. If we changed the example above to `type="radio"`, we would have `canSort === 'on'` or `canSort === 'off'`. Radio buttons are more useful in conjuction with a `value` binding. When `value` is bound, the bound `checked` variable will receive the bound `value` when it is checked.

#### table.html

```html
<label>
  <input type="radio" value="none" checked.bind="sorting" /> none
</label>
<label>
  <input type="radio" value="ascending" checked.bind="sorting" /> ascending
</label>
<label>
  <input type="radio" value="descending" checked.bind="sorting" /> descending
</label>
```

This syncs `sorting` to the value of the `value` binding. When the "ascending" radio button is toggled, `sorting === 'ascending'`.

In this case, it would be more useful to bind the `sorting` variable to integers `0`, `1`, and `-1` so that we could use them in an `Array.sort` method call; however, the `value` binding is limited to strings! Aurelia includes a `model` binding on checkboxes and radio buttons that works identically to the `value` binding but supports all JavaScript values. Let's use that instead:

#### table.js

```js
sortings = [
  { label: 'none', value: 0 },
  { label: 'ascending', value: 1 },
  { label: 'descending', value: -1 }
];
```

#### table.html

```html
Sorting:
<label repeat.for="sort of sortings" if.bind="canSort">
  <input type="radio" model.bind="sort.value" checked.bind="sorting" /> ${sort.label}
</label>
```

Now, when we toggle 'ascending', `sorting === 1`, and likewise for the other radio buttons.

# Selecting Items in an Array

If you include the `model` binding on a checkbox, then you can bind `checked` to an array and it will add values to the array when checked and remove them when unchecked. This makes it easy to track a list of selected items.

#### table.js

```js
// We define an array that will be bound to the `checked` binding of our selection checkboxes.
selected = [];

// And we have an array of objects that will get added to and from the selection.
items = [
  { value: 2 },
  { value: 1 },
  { value: 3 }
];
```

#### table.html

```html
<table>
  <tbody>
    <tr repeat.for="item of items">
      <td>
        <!-- When the checkbox is checked, the `selected` array will contain `item`. When unchecked, `item` will be removed from `selected`. -->
        <input type="checkbox" checked.bind="selected" model.bind="item" />
      </td>
      <td>${item.value}</td>
    </tr>
  </tbody>
</table>
```

# The Select All Checkbox

Here's the trick that most people don't know about. Let's add a checkbox to the top of the table that will be (1) checked when all items are selected, (2) unchecked when no items are selected, and (3) indeterminate when some items are selected. `indeterminate` is a boolean attribute, just like `checked`, and therefore it can be bound just like any other attribute.

#### table.html

```html
<table>
  <thead>
    <tr>
      <th>
        <input type="checkbox" <!-- -->

          <!-- We want the checkbox to be checked when the selected array contains all the items in the items array.
            We can take a shortcut and just compare lengths. You can bind anything here so long as it is true when the
            two arrays are equal. Since this is an expression and not a value, the default two-way binding will not
            work since you cannot assign to an expression. So, we ask Aurelia for a one-way binding only. -->
          checked.one-way="selected.length === items.length"

          <!-- We want the checkbox to be indeterminate when the selected array contains some but not all items in the
            items in array. Just like with the `checked` binding, we take the shortcut of comparing array lengths. Again
            you can bind anything here so long as its true when selected includes some but not all of the elements in
            items. Indeterminate is a one-way binding, so we can just use the standard bind syntax. -->
          indeterminate.bind="selected.length > 0 && selected.length < items.length" />
      </th>
      <th>value</th>
    </tr>
  </thead>
</table>
```

Now when we check checkboxes in our table the select all checkbox will update based on our selection. The select all checkbox does not yet add or remove items from the `selected` array, though, so let's add that next. Since we are binding to expressions for both `checked` and `indeterminate`, it would be difficult to handle this behavior with a binding. Instead, let's handle it by listening for the `change` event on our select all checkbox.

#### table.html

```html
<table>
  <thead>
    <tr>
      <th>
        <input type="checkbox"
          checked.one-way="selected.length === items.length"
          indeterminate.bind="selected.length > 0" <!-- -->

          <!-- `$event.target`, the target of the event, is the checkbox. When checked, we want `selected` to contain
            all the items in `items`, or `items.slice()`. When unchecked, we want `selected` to be an empty array. -->
          change.delegate="selected = $event.target.checked ? items.slice() : []" />
      </th>
      <th>value</th>
    </tr>
  </thead>
</table>
```

Now, clicking the checkbox will select or deselect all the items in the table.

# Demo

<iframe style="height: 75vh;" src="https://gist.run/?id=4ed6164d7edcf283f70ff1e6dd2164ef"></iframe>

# Notes

## As a Custom Element

I don't love the syntax for the select all checkbox. Since I'm never using an array value for the `model` binding in practice, I like to create a checkbox custom element that interprets an array-valued `model` binding with the select all behavior.

#### table.js

```js
items = [
  { value: 'a' },
  { value: 'b' },
  { value: 'c' }
];
selected = [];
````

#### table.html

```html
<!-- Checking this checkbox will add all the items from `items` to the `selected` array. Unchecking it will remove
  everything from `items`. Adding one but not all items from `items` to `selected` will set the checkbox state to
  indeterminate. -->
<my-checkbox checked.bind="selected" model.bind="items" />
```

I have enough of these in a typical application that the time it takes writing a rock-solid component is justified.

# Links

[Aurelia 2 Checkbox / Radio Button RFC](https://github.com/aurelia/aurelia/issues/447)<br />
[StackOverflow question which inspired this post](https://stackoverflow.com/questions/58359355/how-do-i-create-a-select-all-checkbox-when-i-have-an-empty-array-as-my-checked-b/58438010#58438010)<br />
[Aurelia Checkbox Binding Docs](https://aurelia.io/docs/binding/checkboxes/)
