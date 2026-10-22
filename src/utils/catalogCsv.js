import { normalizeName } from '../store/groceryReducer'

// Spreadsheet apps run cells starting with these as formulas, so exported
// names get a leading apostrophe (stripped again on import)
const FORMULA_START = /^[=+\-@\t\r]/

const NAME_HEADERS = ['name', 'item', 'itemname', 'staple']
const PRICE_HEADERS = ['defaultprice', 'price', 'priceperpiece', 'unitprice']

function protectCell(value) {
  return FORMULA_START.test(value) ? `'${value}` : value
}

function unprotectCell(value) {
  return value.startsWith("'") && FORMULA_START.test(value.slice(1)) ? value.slice(1) : value
}

function escapeCell(value) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** Serializes catalog staples to CSV (`name,defaultPrice`), with a BOM for Excel. */
export function toCatalogCsv(catalog = []) {
  const rows = [
    ['name', 'defaultPrice'],
    ...catalog.map((item) => [protectCell(item.name || ''), String(item.defaultPrice || 0)]),
  ]
  return '﻿' + rows.map((row) => row.map(escapeCell).join(',')).join('\r\n') + '\r\n'
}

/** Minimal RFC 4180 parser: quoted fields, escaped quotes, CRLF / LF / CR line ends. */
export function parseCsvRows(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/** "₱1,200.50" → 1200.5; blank → undefined (keep existing price); invalid → null */
function parsePrice(raw) {
  const cleaned = (raw || '').trim().replace(/^php/i, '').replace(/[₱,\s]/g, '')
  if (!cleaned) return undefined
  const value = Number(cleaned)
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : null
}

/**
 * Parses a catalog CSV. A header row (name / defaultPrice, or common variants)
 * is optional; without one, column 1 is the name and column 2 the price.
 * Duplicate names in the file keep the last row.
 * @returns {{ items: Array<{ name: string, defaultPrice?: number }>, skipped: number }}
 */
export function parseCatalogCsv(text = '') {
  const rows = parseCsvRows(text.replace(/^﻿/, '')).filter((row) =>
    row.some((cell) => cell.trim())
  )
  if (rows.length === 0) return { items: [], skipped: 0 }

  const header = rows[0].map((cell) => cell.trim().toLowerCase().replace(/[\s_-]/g, ''))
  let nameCol = header.findIndex((h) => NAME_HEADERS.includes(h))
  let priceCol = header.findIndex((h) => PRICE_HEADERS.includes(h))
  let body = rows

  if (nameCol !== -1) {
    body = rows.slice(1)
  } else {
    nameCol = 0
    priceCol = 1
  }

  const byName = new Map()
  let skipped = 0

  for (const row of body) {
    const name = unprotectCell((row[nameCol] || '').trim())
    const price = priceCol === -1 ? undefined : parsePrice(row[priceCol])
    if (!name || price === null) {
      skipped++
      continue
    }
    const key = normalizeName(name)
    byName.delete(key)
    byName.set(key, price === undefined ? { name } : { name, defaultPrice: price })
  }

  return { items: [...byName.values()], skipped }
}
