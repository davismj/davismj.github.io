---
layout: post

title: Deploy Aurelia to GitHub Pages
author: Matt Davis
thumb: blog/2015-4-24-deploy-to-gh-pages.jpg
blurb: How to quickly deploy your new Aurelia app to GitHub pages.

category: blog
tags: aurelia deploy github github-pages tortoise-git

published: true
---
You've just completed your first Aurelia app, and now it is time to show the world that you are Aurelia enabled. GitHub page is a quick, easy, and free hosting solution, perfect for showing off a demo, and today we're going to walk through this process. 

I'm going to show two different methods: (a) using the git command line and (b) using TortoiseGit, a git gui for Windows. It is not a common tool, but I personally love it, so I wanted to demonstrate how to use it as well as contrast it with the command line.

For the sake of example, we're going to use a fork of the skeleton-navigation project. Head over to the [Aurelia skeleton-navigation repo](https://github.com/aurelia/skeleton-navigation), click "fork" in the upper right, and choose the account in which to fork the repo (probably your user account).

#Using git command line

##Initialize GitHub repo (optional)

First, we are going to clone the newly forked repo locally. The first step will be to navigate to the folder where we will want to clone the repo locally.

Click the navigation bar and type `cmd` to open the command line.

![Opening a command window from the Windows Explorer](/images/blog/2015-4-24-ss1.png)

Type `git clone https://github.com/your-username/skeleton-navigation` to clone the repo at this location. Make sure you use the correct url for your repo.

Because we are using the skeleton-navigation project, we will need to install the dependencies and build the project. To do this, type `npm install -g gulp jspm`, then `npm install`, then `jspm install -y`, then `gulp build`.

##Configure the GitHub Pages branch

GitHub pages will serve whatever is committed to the gh-pages branch, so we will create the branch and add the built files and dependencies to the branch.

Type `git branch gh-pages` to create the branch.
Type `git checkout gh-pages` to switch to the branch.

Edit the `.gitignore` file and comment out the `jspm_packages` and `dist` paths to tell git to include files in these paths in the gh-pages branch.

```
node_modules
# jspm_packages
bower_components
.idea
.DS_STORE
# /dist
```

Type `git add *` to add the new files to the branch.
Type `git commit -m 'Initalizing GitHub pages'` to commit to the brnach with the given commit message.
Type `git push origin gh-pages` to push to a new gh-pages branch on GitHub.

Your new project will be hosted at your-username.github.io/skeleton-navigation.

#Using TortoiseGit

First, we are going to clone the newly forked repo locally. The first step will be to navigate to the folder where we will want to clone the repo locally. Right click within the folder and click "Git Clone". Make sure that the URL is set to the URL of your Repo and the Directory is set to the desired directory.

![Git Clone dialog](/images/blog/2015-4-24-ss2.png)

Because we are using the skeleton-navigation project, we will need to install the dependencies and build the project. To do this, open a command prompt in the project directory and type `npm install -g gulp jspm`, then `npm install`, then `jspm install -y`, then `gulp build`.

##Configure the GitHub Pages branch

GitHub pages will serve whatever is committed to the gh-pages branch, so we will create the branch and add the built files and dependencies to the branch.

Right click the project directory and navigate TortoiseGit > Create Branch. Name the branch "gh-pages" and hit okay.

Right click the projet directory again and navigate TortoiseGit > Switch/Checkout. Select the "gh-pages" branch from the dropdown and hit okay.

Inside the project directory, right click the jspm_packages directory and navigate TortoiseGit > Add. Check "Include ignored files" and then "Select/deselect all" to select all. Repeat this process for the dist folder.

Now, right click any folder and hit commit. Give the commit a message like "Initalizing GitHub pages" and hit Okay. In the window that pops up. Hit push and hit okay.

Your new project will be hosted at your-username.github.io/skeleton-navigation.

#Notes
The git command line portion of this blog was largely adapted from a [StackOverflow post](http://stackoverflow.com/a/29858036/1981050) by [Talves](http://stackoverflow.com/users/2597114/talves).

As Talves noted, this is not how you want to deploy your production application. There are, however, a few good uses for GitHub pages. For one, examples for blogs. It is excellent to be able to see both the source code and the code in action. Another, however, is a blog. This particular website is hosted on GitHub pages using a Ruby-based platform called Jekyll.

#Links
[StackOverflow post from which this blog was derived](http://stackoverflow.com/questions/29831885/how-to-deploy-aurelia-to-github-pages-gh-pages#29858036)
[GitHub Pages](https://help.github.com/articles/user-organization-and-project-pages/)<br/>
[GitHub Pages with Jekyll](https://help.github.com/articles/using-jekyll-with-pages/)<br/>
[git Documentation](http://git-scm.com/documentation)<br/>
[TortoiseGit](https://code.google.com/p/tortoisegit/)<br/>
[Demo](http://davismj.github.io/skeleton-navigation/)<br/>