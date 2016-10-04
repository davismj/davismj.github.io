---
layout: post

title: Easily Measuring Engagement with Formspree
author: Matthew James Davis
category: blog
thumb: blog/2016-5-4-punchcard.jpg
blurb: How I was able begin tracking my blogs conversion ratio in under 15 minutes.
tags: engagement conversion

published: true
---
> For more than a year, I was throwing my greatest resource right into the garbage.

I started writing technical blogs more than 18 months ago. It wasn't until very recently that the subscribe button appeared in the sidebar. One day, for no specific reason I woke up with an epiphany: I have no idea who my audience is. For more than a year, I was throwing my greatest resource right into the garbage. That day, the subscribe button was born.

Though I am now able to track my opt-in readers, I have no idea how many of my readers convert to subscribers. I'm guessing that some readers are turned off by the shabby subscribe button, others are a little protective of their email address, and, for these or any other reason, they don't complete the subscription process. So today I've set out to try to measure my conversion rate.

# Using Formspree to track clicks

If you've never heard of Formspree, it's a fantastic, simple service that allows you to forward engagement forms directly to your inbox. Today, I used it to forward an email to my inbox every time the subscribe button is clicked. If a great number of these come to my inbox without corresponding subscription notifications, then I know I'm having a conversion crisis. Here's what my subscription button event handler looks like:

**subscription.js**

```javascript
document.getElementById('subscription-button')
  .addEventListener('click', function(event) {

    // we now send an xhr to formspree immediately on button click
    var request = new XMLHttpRequest();
    request.open('POST', 'https://formspree.io/my@email.com');
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send('subject=Subscription%20Button%20Clicked');

    // next, we ask the user for their email address and, if provided, 
    // we complete the subscription process
    var email = window.prompt('What is your email address?');
    if (email) {
      registerSubscription(email);
    }
  });
```

This is a simple, server-free solution to tracking engagement that took under 15 minutes to code and deploy. By tracking engagement on every call-to-action on your website, you will be able to expose your sites weaknesses without wasting time on unncessary enhancements. 

# Links 

[Formspree](https://formspree.io/)