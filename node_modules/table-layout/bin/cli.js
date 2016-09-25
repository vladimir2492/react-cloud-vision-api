#!/usr/bin/env node
'use strict'
var tableLayout = require('../')
var commandLineArgs = require('command-line-args')
var commandLineUsage = require('command-line-usage')
var collectJson = require('collect-json')
var ansi = require('ansi-escape-sequences')
var extend = require('deep-extend')
var t = require('typical')

var definitions = [
  { name: 'help', type: Boolean, alias: 'h' },
  { name: 'width', type: String, multiple: true, alias: 'w', typeLabel: '<widths>',
  description: 'specify a list of column widths in the format \'<column>:<width>\', for example:\n$ cat <json data> | table-layout --width "column 1: 10" "column 2: 30"' },
  { name: 'padding-left', type: String, alias: 'l',
  description: "One or more characters to pad the left of each column. Defaults to ' '." },
  { name: 'padding-right', type: String, alias: 'r',
  description: "One or more characters to pad the right of each column. Defaults to ' '." },
  { name: 'lines', type: Boolean, description: 'return an array of lines' }
]
var options = commandLineArgs(definitions)

if (options.help) {
  console.error(commandLineUsage([
    {
      header: 'table-layout',
      content: 'Stylable text tables, handling ansi colour. Useful for console output.'
    },
    {
      header: 'Synopsis',
      content: '$ cat [underline]{jsonfile} | table-layout [options]'
    },
    {
      header: 'Options',
      optionList: definitions
    }
  ]))
  process.exit(0)
}

var columns = []
if (options.width) {
  options.width.forEach(function (columnWidth) {
    var split = columnWidth.split(':').map(function (item) {
      return item.trim()
    })
    if (split[0] && split[1]) {
      columns.push({ name: split[0], width: Number(split[1]) })
    }
  })
}

process.stdin
  .pipe(collectJson(function (json) {
    var clOptions = {
      maxWidth: process.stdout.columns,
      padding: {}
    }

    if (t.isDefined(options['padding-left'])) clOptions.padding.left = options['padding-left']
    if (t.isDefined(options['padding-right'])) clOptions.padding.right = options['padding-right']

    /* split input into data and options */
    if (!Array.isArray(json)) {
      if (json.options && json.data) {
        clOptions = extend(clOptions, json.options)
        json = json.data
      } else {
        throw new Error('Invalid input data')
      }
    }

    if (columns.length) clOptions.columns = columns

    var table = new tableLayout.Table(json, clOptions)
    return options.lines
      ? JSON.stringify(table.renderLines(), null, '  ') + '\n'
      : table.toString()
  }))
  .on('error', function (err) {
    console.error(ansi.format(err.stack, 'red'))
    process.exitCode = 1
  })
  .pipe(process.stdout)
