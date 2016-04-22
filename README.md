# px-table-view
This component provides responsive styles for lists.

## Usage
The following is how to use the component.

```
$ bower install px-table-view
```


```html
  <ul class="table-view table-view--bare">
    <px-table-row title="Home" icon="fa fa-home" type="tappable" href="#home"></px-table-row>
    <px-table-row title="Dashboard" icon="fa fa-dashboard" type="tappable" href="#dashboard"></px-table-row>
    <px-table-row title="Alerts" icon="fa fa-exclamation-triangle" type="tappable" href="#alerts"></px-table-row>
    <px-table-row title="Cases" icon="fa fa-briefcase" type="tappable" href="#cases"></px-table-row>
    <px-table-row title="Analysis" icon="fa fa-bar-chart" type="tappable" href="#analysis"></px-table-row>
  </ul>
```

> Note: For full CSS/HTML examples visit demo.html

> Note: For component examples visit mobile-demo.html


### Options
N/A

### Function calls
N/A

### Extending styles
You can change variables in the sass/_variables.scss to change default styles.

### Extending behavior
N/A

### Known Issues
N/A

## Development
The following is how to develop on this component.

1. Clone repository

  ```
  $ git clone
  ```

2. Install dependencies

  ```
  $ npm install
  ```

3. Start local server

  ```
  $ npm start
  ```

  > Note: If issues with `polyserve` just install it globally and run it.

4. Compile styles

  ```
  $ npm run build
  ```


5. Run tests

  ```
  $ npm test
  ```



# GE Coding Style Guide
[GE JS Developer's Guide](https://github.com/GeneralElectric/javascript)
