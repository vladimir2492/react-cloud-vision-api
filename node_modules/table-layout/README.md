[![view on npm](http://img.shields.io/npm/v/table-layout.svg)](https://www.npmjs.org/package/table-layout)
[![npm module downloads](http://img.shields.io/npm/dt/table-layout.svg)](https://www.npmjs.org/package/table-layout)
[![Build Status](https://travis-ci.org/75lb/table-layout.svg?branch=master)](https://travis-ci.org/75lb/table-layout)
[![Dependency Status](https://david-dm.org/75lb/table-layout.svg)](https://david-dm.org/75lb/table-layout)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

# table-layout
Stylable text tables, handling ansi colour. Useful for console output.

## Synopsis
Converts arrays of row data to text tables. For example - one row, two columns:
```json
[
    {
      "column 1": "The Kingdom of Scotland was a state in north-west Europe traditionally said to have been founded in 843, which joined with the Kingdom of England to form a unified Kingdom of Great Britain in 1707. Its territories expanded and shrank, but it came to occupy the northern third of the island of Great Britain, sharing a land border to the south with the Kingdom of England. ",
      "column 2": "Operation Barbarossa (German: Unternehmen Barbarossa) was the code name for Nazi Germany's invasion of the Soviet Union during World War II, which began on 22 June 1941. Over the course of the operation, about four million soldiers of the Axis powers invaded Soviet Russia along a 2,900 kilometer front, the largest invasion force in the history of warfare. In addition to troops, the Germans employed some 600,000 motor vehicles and between 600–700,000 horses."
    }
]
```

pipe it through `table-layout`:
```sh
$ cat example/two-columns.json | table-layout
```

to get this:
```
The Kingdom of Scotland was a state in     Operation Barbarossa (German: Unternehmen
north-west Europe traditionally said to    Barbarossa) was the code name for Nazi
have been founded in 843, which joined     Germany's invasion of the Soviet Union
with the Kingdom of England to form a      during World War II, which began on 22
unified Kingdom of Great Britain in 1707.  June 1941. Over the course of the
Its territories expanded and shrank, but   operation, about four million soldiers of
it came to occupy the northern third of    the Axis powers invaded Soviet Russia
the island of Great Britain, sharing a     along a 2,900 kilometer front, the
land border to the south with the Kingdom  largest invasion force in the history of
of England.                                warfare. In addition to troops, the
                                           Germans employed some 600,000 motor
                                           vehicles and between 600–700,000 horses.
```

Columns containing wrappable data (like the above) are auto-sized by default to fit the available space. You can set specific column widths using `--width`

```sh
$ cat example/two-columns.json | table-layout --width "column 2: 55"
```

```
The Kingdom of Scotland was a  Operation Barbarossa (German: Unternehmen Barbarossa)
state in north-west Europe     was the code name for Nazi Germany's invasion of the
traditionally said to have     Soviet Union during World War II, which began on 22
been founded in 843, which     June 1941. Over the course of the operation, about
joined with the Kingdom of     four million soldiers of the Axis powers invaded
England to form a unified      Soviet Russia along a 2,900 kilometer front, the
Kingdom of Great Britain in    largest invasion force in the history of warfare. In
1707. Its territories          addition to troops, the Germans employed some 600,000
expanded and shrank, but it    motor vehicles and between 600–700,000 horses.
came to occupy the northern
third of the island of Great
Britain, sharing a land
border to the south with the
Kingdom of England.
```

## More Examples
Read the latest npm issues: (example requires [jq](https://stedolan.github.io/jq/))
```sh
$ curl -s https://api.github.com/repos/npm/npm/issues \
| jq 'map({ number, title, login:.user.login, comments })' \
| table-layout
```
```
10263  npm run start                                            Slepperpon        4
10262  npm-shrinkwrap.json being ignored for a dependency of a  maxkorp           0
      dependency (2.14.9, 3.3.10)
10261  EPROTO Error Installing Packages                         azkaiart          2
10260  ENOENT during npm install with npm v3.3.6/v3.3.12 and    lencioni          2
      node v5.0.0
10259  npm install failed                                       geraldvillorente  1
10258  npm moves common dependencies under a dependency on      trygveaa          2
      install
10257  [NPM3] Missing top level dependencies after npm install  naholyr           0
10256  Yo meanjs app creation problem                           nrjkumar41        0
10254  sapnwrfc is not installing                               RamprasathS       0
10253  npm install deep dependence folder "node_modules"        duyetvv           2
10251  cannot npm login                                         w0ps              2
10250  Update npm-team.md                                       louislarry        0
10248  cant install module I created                            nousacademy       4
10247  Cannot install passlib                                   nicola883         3
10246  Error installing Gulp                                    AlanIsrael0       1
10245  cannot install packages through NPM                      RoyGeagea         11
10244  Remove arguments from npm-dedupe.md                      bengotow          0
 etc.
 etc.
```

## Install
As a library:

```
$ npm install table-layout --save
```

As a command-line tool:
```
$ npm install -g table-layout
```

## API Reference

* [table-layout](#module_table-layout)
    * [tableLayout(data, [options])](#exp_module_table-layout--tableLayout) ⏏
        * [.lines()](#module_table-layout--tableLayout.lines) ⇒ <code>Array.&lt;string&gt;</code>
        * [~columnOption](#module_table-layout--tableLayout..columnOption)

<a name="exp_module_table-layout--tableLayout"></a>

### tableLayout(data, [options]) ⏏
Recordset data in (array of objects), text table out.

**Kind**: Exported function  
**Params**

- data <code>Array.&lt;object&gt;</code> - input data
- [options] <code>object</code> - optional settings
    - [.maxWidth] <code>number</code> - maximum width of layout
    - [.nowrap] <code>boolean</code> - disable wrapping on all columns
    - [.break] <code>boolean</code> - enable word-breaking on all columns
    - [.columns] <code>[columnOption](#module_table-layout--tableLayout..columnOption)</code> - array of column options
    - [.ignoreEmptyColumns] <code>boolean</code>
    - [.padding] <code>object</code> - Padding values to set on each column. Per-column overrides can be set in the `options.columns` array.
        - [.left] <code>string</code>
        - [.right] <code>string</code>

**Example**  
```js
> tableLayout = require('table-layout')
> jsonData = [{
  col1: 'Some text you wish to read in table layout',
  col2: 'And some more text in column two. '
}]
> tableLayout(jsonData, { maxWidth: 30 })
 Some text you  And some more
 wish to read   text in
 in table      column two.
 layout
```
<a name="module_table-layout--tableLayout.lines"></a>

#### tableLayout.lines() ⇒ <code>Array.&lt;string&gt;</code>
Identical to `tableLayout()` with the exception of the rendered result being returned as an array of lines, rather that a single string.

**Kind**: static method of <code>[tableLayout](#exp_module_table-layout--tableLayout)</code>  
**Example**  
```js
> tableLayout = require('table-layout')
> jsonData = [{
  col1: 'Some text you wish to read in table layout',
  col2: 'And some more text in column two. '
}]
> tableLayout.lines(jsonData, { maxWidth: 30 })
[ ' Some text you  And some more ',
' wish to read   text in       ',
' in table      column two.   ',
' layout                       ' ]
```
<a name="module_table-layout--tableLayout..columnOption"></a>

#### tableLayout~columnOption
**Kind**: inner typedef of <code>[tableLayout](#exp_module_table-layout--tableLayout)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | column name, must match a property name in the input |
| width | <code>number</code> | column width |
| minWidth | <code>number</code> | column min width |
| maxWidth | <code>number</code> | column max width |
| nowrap | <code>boolean</code> | disable wrapping for this column |
| break | <code>boolean</code> | enable word-breaking for this columns |
| padding | <code>object</code> | padding options |
| padding.left | <code>string</code> | a string to pad the left of each cell (default: `' '`) |
| padding.right | <code>string</code> | a string to pad the right of each cell (default: `' '`) |


* * *

&copy; 2015-16 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
