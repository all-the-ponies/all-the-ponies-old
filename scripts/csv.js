const Quoting = {
    QUOTE_MINIMAL: 0,
    QUOTE_ALL: 1,
    QUOTE_NULL: 3,
    QUOTE_NONNUMERIC: 2,
    QUOTE_STRINGS: 4,
    QUOTE_NOTNULL: 5,
}

const Dialect = {
    delimiter: ',',
    quoteChar: '"',
    escapeChar: null,
    doubleQuote: true,
    skipInitialSpace: false,
    lineTerminator: '\n',
    quoting: Quoting.QUOTE_MINIMAL,
}

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

/**
 * 
 * @param {Array<Array<string | null>>} table 
 * @param {Dialect} dialect 
 * @returns {string}
 */
function writeCSV(table, dialect = Dialect) {
    dialect = {
        delimiter: ',',
        quoteChar: '"',
        doubleQuote: true,
        escapeChar: null,
        skipInitialSpace: false,
        lineTerminator: '\n',
        quoting: Quoting.QUOTE_MINIMAL,
        ...dialect,
    }
    
    return table.map(row => row.map(cell => escapeCell(cell, dialect))
            .join(dialect.delimiter))
            .join(dialect.lineTerminator)
}

/**
 * 
 * @param {string} cell 
 * @param {Dialect} dialect 
 * @returns {string}
 */
function escapeCell(cell, dialect = Dialect) {
    let quote = false || (dialect.quoting === Quoting.QUOTE_ALL)

    if (dialect.quoting === dialect.QUOTE_NONNUMERIC) {
        if (!isNumeric(cell)) {
            quote = true
        }
    } else if (dialect.quoting === dialect.QUOTE_STRINGS) {
        if (!isNumeric(cell)) {
            quote = true
        } else if (cell === null) {
            quote = false
            cell = ''
        }
    } else if (dialect.quoting === Quoting.QUOTE_NOTNULL) {
        if (cell === null) {
            quote = false
            cell = ''
        } else {
            quote = true
        }
    }

    cell = String(cell)

    if (dialect.escapeChar && cell.includes(dialect.escapeChar)) {
        cell = cell.replaceAll(dialect.escapeChar, dialect.escapeChar + dialect.escapeChar)
    }

    if (cell.includes(dialect.delimiter)) {
        if (dialect.quoting === Quoting.QUOTE_NULL) {
            if (!dialect.escapeChar) {
                throw new Error('need to escape, but no escapechar set')
            }

            cell = cell.replaceAll(dialect.delimiter, dialect.escapeChar + dialect.delimiter)
        } else {
            quote = true
        }
    }

    if (cell.includes(dialect.quoteChar)) {
        if (dialect.doubleQuote) {
            cell = cell.replaceAll(dialect.quoteChar, dialect.quoteChar + dialect.quoteChar)
            quote = true
        } else {
            if (!dialect.escapeChar) {
                throw new Error('need to escape, but no escapechar set')
            }
            
            cell = cell.replaceAll(dialect.quoteChar, dialect.escapeChar + dialect.quoteChar)
        }
    }

    if (cell.includes(dialect.lineTerminator)) {
        if (dialect.quoting === Quoting.QUOTE_NULL) {
            if (!dialect.escapeChar) {
                throw new Error('need to escape, but no escapechar set')
            }

            cell = cell.replaceAll(dialect.lineTerminator, dialect.escapeChar + dialect.lineTerminator)
        } else {
            quote = true
        }
    }

    if (quote) {
        cell = dialect.quoteChar + cell + dialect.quoteChar
    }

    return cell
}

export default {
    writeCSV,
    escapeCell,
    Dialect: structuredClone(Dialect),
}
