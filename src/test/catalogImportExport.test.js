import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toCatalogCsv, parseCatalogCsv, parseCsvRows } from '../utils/catalogCsv'
import { groceryReducer, ACTION_TYPES, mergeCatalog } from '../store/groceryReducer'

const mockFileSaver = vi.hoisted(() => ({ saveImage: vi.fn(), saveDownload: vi.fn() }))

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(), getPlatform: vi.fn() },
  registerPlugin: vi.fn(() => mockFileSaver),
}))
vi.mock('@capacitor/filesystem', () => ({
  Filesystem: { writeFile: vi.fn(), getUri: vi.fn() },
  Directory: { Cache: 'CACHE' },
}))
vi.mock('@capacitor/share', () => ({ Share: { share: vi.fn() } }))

const { Capacitor } = await import('@capacitor/core')
const { exportCatalogCsv } = await import('../utils/catalogTransfer')

describe('Catalog CSV format', () => {
  it('exports a header, BOM and properly escaped rows', () => {
    const csv = toCatalogCsv([
      { id: '1', name: 'Whole Milk', defaultPrice: 110 },
      { id: '2', name: 'Rice, Jasmine "5kg"', defaultPrice: 385.5 },
      { id: '3', name: 'Garlic' },
    ])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv).toBe(
      '﻿name,defaultPrice\r\nWhole Milk,110\r\n"Rice, Jasmine ""5kg""",385.5\r\nGarlic,0\r\n'
    )
  })

  it('round-trips through export and import', () => {
    const catalog = [
      { id: '1', name: 'Rice, Jasmine "5kg"', defaultPrice: 385.5 },
      { id: '2', name: '=SUM(A1)', defaultPrice: 10 },
    ]
    const { items, skipped } = parseCatalogCsv(toCatalogCsv(catalog))
    expect(skipped).toBe(0)
    expect(items).toEqual([
      { name: 'Rice, Jasmine "5kg"', defaultPrice: 385.5 },
      { name: '=SUM(A1)', defaultPrice: 10 },
    ])
  })

  it('protects names that spreadsheets would run as formulas', () => {
    expect(toCatalogCsv([{ name: '=HYPERLINK("x")', defaultPrice: 1 }])).toContain(`"'=HYPERLINK(""x"")"`)
  })

  it('parses quoted fields with newlines and mixed line endings', () => {
    expect(parseCsvRows('a,"b\nc"\r\nd,e\rf,g')).toEqual([
      ['a', 'b\nc'],
      ['d', 'e'],
      ['f', 'g'],
    ])
  })

  it('accepts header variants, currency symbols and thousands separators', () => {
    const { items } = parseCatalogCsv('Item Name,Price\nEggs,"₱1,200.50"\nMilk,PHP 110\n')
    expect(items).toEqual([
      { name: 'Eggs', defaultPrice: 1200.5 },
      { name: 'Milk', defaultPrice: 110 },
    ])
  })

  it('works without a header row and without a price column', () => {
    expect(parseCatalogCsv('Bananas,90\nOnions\n').items).toEqual([
      { name: 'Bananas', defaultPrice: 90 },
      { name: 'Onions' },
    ])
    expect(parseCatalogCsv('name\nSoy Sauce\n').items).toEqual([{ name: 'Soy Sauce' }])
  })

  it('skips rows with no name or an invalid price, and keeps the last duplicate', () => {
    const { items, skipped } = parseCatalogCsv(
      'name,defaultPrice\n,50\nMilk,abc\nEggs,-5\nRice,100\n rice ,120\n\n'
    )
    expect(skipped).toBe(3)
    expect(items).toEqual([{ name: 'rice', defaultPrice: 120 }])
  })

  it('returns nothing for an empty file', () => {
    expect(parseCatalogCsv('')).toEqual({ items: [], skipped: 0 })
    expect(parseCatalogCsv('﻿\r\n')).toEqual({ items: [], skipped: 0 })
  })
})

describe('Catalog import merge', () => {
  const catalog = [
    { id: 'c1', name: 'Whole Milk', defaultPrice: 110 },
    { id: 'c2', name: 'Eggs', defaultPrice: 240 },
  ]

  it('adds new names, updates matching prices and keeps everything else', () => {
    const result = mergeCatalog(catalog, [
      { name: 'whole milk ', defaultPrice: 120 },
      { name: 'Eggs', defaultPrice: 240 },
      { name: 'Rice', defaultPrice: 385 },
      { name: 'Garlic' },
    ])
    expect(result).toMatchObject({ added: 2, updated: 1, unchanged: 1 })
    expect(result.catalog).toHaveLength(4)
    expect(result.catalog[0]).toEqual({ id: 'c1', name: 'Whole Milk', defaultPrice: 120 })
    expect(result.catalog[1]).toEqual(catalog[1])
    expect(result.catalog[2]).toMatchObject({ name: 'Rice', defaultPrice: 385 })
    expect(result.catalog[3]).toMatchObject({ name: 'Garlic', defaultPrice: 0 })
  })

  it('a blank price keeps the existing staple price', () => {
    const result = mergeCatalog(catalog, [{ name: 'Eggs' }])
    expect(result).toMatchObject({ added: 0, updated: 0, unchanged: 1 })
    expect(result.catalog[1].defaultPrice).toBe(240)
  })

  it('IMPORT_CATALOG updates linked To Buy items but not On Cart items', () => {
    const state = {
      items: [
        { id: 'i1', name: 'Whole Milk', isChecked: false, quantity: 1, price: 110, catalogId: 'c1' },
        { id: 'i2', name: 'whole milk', isChecked: true, quantity: 1, price: 105 },
      ],
      catalog,
    }
    const next = groceryReducer(state, {
      type: ACTION_TYPES.IMPORT_CATALOG,
      payload: { items: [{ name: 'Whole Milk', defaultPrice: 125 }] },
    })
    expect(next.catalog[0].defaultPrice).toBe(125)
    expect(next.items[0].price).toBe(125)
    expect(next.items[1].price).toBe(105)
  })

  it('IMPORT_CATALOG with no changes returns the same state', () => {
    const state = { items: [], catalog }
    const next = groceryReducer(state, {
      type: ACTION_TYPES.IMPORT_CATALOG,
      payload: { items: [{ name: 'Eggs', defaultPrice: 240 }] },
    })
    expect(next).toBe(state)
  })
})

describe('Catalog export', () => {
  const catalog = [{ id: 'c1', name: 'Whole Milk', defaultPrice: 110 }]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('on Android, saves the CSV into Download/FreshTrack', async () => {
    Capacitor.getPlatform.mockReturnValue('android')
    Capacitor.isNativePlatform.mockReturnValue(true)
    mockFileSaver.saveDownload.mockImplementation(async ({ filename }) => ({
      path: `Download/FreshTrack/${filename}`,
    }))

    const result = await exportCatalogCsv(catalog)

    const call = mockFileSaver.saveDownload.mock.calls[0][0]
    expect(call.mimeType).toBe('text/csv')
    expect(call.filename).toMatch(/^FreshTrack_Catalog_\d{4}-\d{2}-\d{2}_\d{6}\.csv$/)
    // base64 decodes back to the UTF-8 CSV, BOM included (Excel needs it)
    const decoded = new TextDecoder('utf-8', { ignoreBOM: true }).decode(Uint8Array.from(atob(call.data), (c) => c.charCodeAt(0)))
    expect(decoded).toBe(toCatalogCsv(catalog))
    expect(result).toEqual({ method: 'saved', filename: call.filename, location: `Download/FreshTrack/${call.filename}` })
  })

  it('on the web, downloads the CSV', async () => {
    Capacitor.getPlatform.mockReturnValue('web')
    Capacitor.isNativePlatform.mockReturnValue(false)
    URL.createObjectURL = vi.fn(() => 'blob:catalog')
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const result = await exportCatalogCsv(catalog)

    expect(result.method).toBe('downloaded')
    expect(click).toHaveBeenCalledTimes(1)
    expect(mockFileSaver.saveDownload).not.toHaveBeenCalled()
    click.mockRestore()
  })
})
