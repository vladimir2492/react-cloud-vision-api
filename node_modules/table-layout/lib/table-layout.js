'use strict'
const wrap = require('wordwrapjs')
const os = require('os')
const Rows = require('./rows')
const ansi = require('./ansi')
const extend = require('deep-extend')

/**
 * @module table-layout
 */
module.exports = tableLayout

const _options = new WeakMap()

class Table {
  constructor (data, options) {
    let ttyWidth = (process && (process.stdout.columns || process.stderr.columns)) || 0

    /* Windows quirk workaround  */
    if (ttyWidth && os.platform() === 'win32') ttyWidth--

    let defaults = {
      padding: {
        left: ' ',
        right: ' '
      },
      maxWidth: ttyWidth || 80,
      columns: []
    }

    _options.set(this, extend(defaults, options))
    this.load(data)
  }

  load (data) {
    let options = _options.get(this)

    /* remove empty columns */
    if (options.ignoreEmptyColumns) {
      data = Rows.removeEmptyColumns(data)
    }

    this.columns = Rows.getColumns(data)
    this.rows = new Rows(data, this.columns)

    /* load default column properties from options */
    this.columns.maxWidth = options.maxWidth
    this.columns.list.forEach(column => {
      if (options.padding) column.padding = options.padding
      if (options.nowrap) column.nowrap = options.nowrap
      if (options.break) {
        column.break = options.break
        column.contentWrappable = true
      }
    })

    /* load column properties from options.columns */
    options.columns.forEach(optionColumn => {
      let column = this.columns.get(optionColumn.name)
      if (column) {
        if (optionColumn.padding) {
          column.padding.left = optionColumn.padding.left
          column.padding.right = optionColumn.padding.right
        }
        if (optionColumn.width) column.width = optionColumn.width
        if (optionColumn.maxWidth) column.maxWidth = optionColumn.maxWidth
        if (optionColumn.minWidth) column.minWidth = optionColumn.minWidth
        if (optionColumn.nowrap) column.nowrap = optionColumn.nowrap
        if (optionColumn.break) {
          column.break = optionColumn.break
          column.contentWrappable = true
        }
      }
    })

    this.columns.autoSize()
    return this
  }

  getWrapped () {
    this.columns.autoSize()
    return this.rows.list.map(row => {
      let line = []
      row.forEach((cell, column) => {
        if (column.nowrap) {
          line.push(cell.value.split(/\r\n?|\n/))
        } else {
          line.push(wrap.lines(cell.value, {
            width: column.wrappedContentWidth,
            ignore: ansi.regexp,
            break: column.break
          }))
        }
      })
      return line
    })
  }

  getLines () {
    var wrappedLines = this.getWrapped()
    var lines = []
    wrappedLines.forEach(wrapped => {
      let mostLines = getLongestArray(wrapped)
      for (let i = 0; i < mostLines; i++) {
        let line = []
        wrapped.forEach(cell => {
          line.push(cell[i] || '')
        })
        lines.push(line)
      }
    })
    return lines
  }

  renderLines () {
    var lines = this.getLines()
    return lines.map(line => {
      return line.reduce((prev, cell, index) => {
        let column = this.columns.list[index]
        return prev + padCell(cell, column.padding, column.generatedWidth)
      }, '')
    })
  }

  /**
   * Returns the data as a text table.
   * @returns {string}
   */
  toString () {
    return this.renderLines().join(os.EOL) + os.EOL
  }
}

/**
 * Array of arrays in.. Returns the length of the longest one
 * @returns {number}
 * @private
 */
function getLongestArray (arrays) {
  var lengths = arrays.map(array => array.length)
  return Math.max.apply(null, lengths)
}

function padCell (cellValue, padding, width) {
  var ansiLength = cellValue.length - ansi.remove(cellValue).length
  cellValue = cellValue || ''
  return (padding.left || '') +
  cellValue.padEnd(width - padding.length() + ansiLength) +
  (padding.right || '')
}

/**
 * Recordset data in (array of objects), text table out.
 *
 * @param {object[]} - input data
 * @param [options] {object} - optional settings
 * @param [options.maxWidth] {number} - maximum width of layout
 * @param [options.nowrap] {boolean} - disable wrapping on all columns
 * @param [options.break] {boolean} - enable word-breaking on all columns
 * @param [options.columns] {module:table-layout~columnOption} - array of column options
 * @param [options.ignoreEmptyColumns] {boolean}
 * @param [options.padding] {object} - Padding values to set on each column. Per-column overrides can be set in the `options.columns` array.
 * @param [options.padding.left] {string}
 * @param [options.padding.right] {string}
 * @alias module:table-layout
 * @example
 * > tableLayout = require('table-layout')
 * > jsonData = [{
 *   col1: 'Some text you wish to read in table layout',
 *   col2: 'And some more text in column two. '
 * }]
 * > tableLayout(jsonData, { maxWidth: 30 })
 *  Some text you  And some more
 *  wish to read   text in
 *  in table      column two.
 *  layout
 */
function tableLayout (data, options) {
  const table = new Table(data, options)
  return table.toString()
}

/**
 * Identical to `tableLayout()` with the exception of the rendered result being returned as an array of lines, rather that a single string.
 * @returns {string[]}
 * @example
 * > tableLayout = require('table-layout')
 * > jsonData = [{
 *   col1: 'Some text you wish to read in table layout',
 *   col2: 'And some more text in column two. '
 * }]
 * > tableLayout.lines(jsonData, { maxWidth: 30 })
 * [ ' Some text you  And some more ',
 * ' wish to read   text in       ',
 * ' in table      column two.   ',
 * ' layout                       ' ]
 */
tableLayout.lines = function (data, options) {
  const table = new Table(data, options)
  return table.renderLines()
}

tableLayout.Table = Table

/**
 * @typedef module:table-layout~columnOption
 * @property name {string} - column name, must match a property name in the input
 * @property [width] {number} - column width
 * @property [minWidth] {number} - column min width
 * @property [maxWidth] {number} - column max width
 * @property [nowrap] {boolean} - disable wrapping for this column
 * @property [break] {boolean} - enable word-breaking for this columns
 * @property [padding] {object} - padding options
 * @property [padding.left] {string} - a string to pad the left of each cell (default: `' '`)
 * @property [padding.right] {string} - a string to pad the right of each cell (default: `' '`)
 */
