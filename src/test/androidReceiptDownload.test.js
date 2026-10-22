import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Capacitor } from '@capacitor/core'
import { Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

const mockFileSaver = vi.hoisted(() => ({ saveImage: vi.fn(), saveDownload: vi.fn() }))

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
    getPlatform: vi.fn(),
  },
  registerPlugin: vi.fn(() => mockFileSaver),
}))

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: vi.fn(),
    getUri: vi.fn(),
  },
  Directory: {
    Cache: 'CACHE',
    Documents: 'DOCUMENTS',
  },
}))

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn(),
  },
}))

const { saveReceiptImage, shareReceiptImage, buildReceiptFilename } = await import(
  '../utils/receiptExport'
)

const base64Sample =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const dataUrl = `data:image/png;base64,${base64Sample}`
const filename = 'FreshTrack_Receipt_test.png'

describe('Digital receipt export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds a timestamped PNG filename', () => {
    expect(buildReceiptFilename(new Date('2026-10-22T09:05:07'))).toMatch(
      /^FreshTrack_Receipt_\d{4}-\d{2}-\d{2}_\d{6}\.png$/
    )
  })

  it('on Android, saves to Pictures/FreshTrack via the native plugin without sharing', async () => {
    Capacitor.getPlatform.mockReturnValue('android')
    Capacitor.isNativePlatform.mockReturnValue(true)
    mockFileSaver.saveImage.mockResolvedValue({
      uri: 'content://media/external/images/media/42',
      path: `Pictures/FreshTrack/${filename}`,
    })

    const result = await saveReceiptImage(dataUrl, filename)

    expect(mockFileSaver.saveImage).toHaveBeenCalledWith({ data: base64Sample, filename })
    expect(result).toEqual({ method: 'saved', location: `Pictures/FreshTrack/${filename}` })
    expect(Share.share).not.toHaveBeenCalled()
  })

  it('on iOS, falls back to the share sheet', async () => {
    Capacitor.getPlatform.mockReturnValue('ios')
    Capacitor.isNativePlatform.mockReturnValue(true)
    Filesystem.getUri.mockResolvedValue({ uri: 'file:///cache/receipt.png' })

    const result = await saveReceiptImage(dataUrl, filename)

    expect(result).toEqual({ method: 'shared' })
    expect(mockFileSaver.saveImage).not.toHaveBeenCalled()
    expect(Share.share).toHaveBeenCalledWith(expect.objectContaining({ url: 'file:///cache/receipt.png' }))
  })

  it('on the web, triggers a browser download', async () => {
    Capacitor.getPlatform.mockReturnValue('web')
    Capacitor.isNativePlatform.mockReturnValue(false)
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const result = await saveReceiptImage(dataUrl, filename)

    expect(result).toEqual({ method: 'downloaded' })
    expect(click).toHaveBeenCalledTimes(1)
    expect(mockFileSaver.saveImage).not.toHaveBeenCalled()
    click.mockRestore()
  })

  it('share writes the PNG to the app cache and opens the share sheet', async () => {
    Filesystem.getUri.mockResolvedValue({ uri: 'file:///cache/FreshTrack_Receipt.png' })

    await shareReceiptImage(dataUrl, filename)

    expect(Filesystem.writeFile).toHaveBeenCalledWith({
      path: filename,
      data: base64Sample,
      directory: 'CACHE',
    })
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'file:///cache/FreshTrack_Receipt.png' })
    )
  })
})
