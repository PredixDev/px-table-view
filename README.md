# px-table-view

The `px-table-view` element creates a table-style list of items that can be interacted with by the user. It works the way users expect from a native mobile app, allowing swiping, tapping and re-ordering of list items.

Use `px-table-view` to create list-style interfaces like menus or to display arbitrary sets of related data that can be acted on.

[![Build Status](https://travis-ci.org/PredixDev/px-table-view.svg?branch=master)](https://travis-ci.org/PredixDev/px-table-view)

## Usage

### Prerequisites
1. node.js
2. npm
3. bower
4. [webcomponents-lite.js polyfill](https://github.com/webcomponents/webcomponentsjs)

Node, npm and bower are necessary to install the component and dependencies. webcomponents.js adds support for web components and custom elements to your application.

## Getting Started

First, install the component via bower on the command line.

```
bower install px-table-view --save
```

Second, import the component to your application with the following tag in your head.

```
<link rel="import" href="/bower_components/px-table-view/px-table-view.html"/>
```

Finally, use the component in your application:

```
<px-table-view>
  <px-table-row title="Text Label"></px-table-row>
  <px-table-row title="Tappable Item" tappable></px-table-row>
</px-table-view>
```

## Documentation

Read the full API and view the demo [here](https://predixdev.github.io/predix-ui/?type=component&show=px-table-view/).

The documentation in this repository is supplemental to the official Predix documentation, which is continuously updated and maintained by the Predix documentation team. Go to [http://predix.io](http://predix.io) to see the official Predix documentation.


## Local Development

From the component's directory:

```
$ npm install
$ bower install
$ gulp
```

From the component's directory, to start a local server run:

```
$ gulp serve
```

Navigate to the root of that server (e.g. http://localhost:8080/) in a browser to open the API documentation page with working examples.

### GE Coding Style Guide

[GE JS Developer's Guide](https://github.com/GeneralElectric/javascript)

## Known Issues

Please use [Github Issues](https://github.com/PredixDev/px-table-view/issues) to submit any bugs you might find.
