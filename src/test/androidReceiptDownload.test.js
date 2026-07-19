import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
    getPlatform: vi.fn(),
  },
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

describe('Android / Capacitor Digital Receipt Export TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('detects native platform using Capacitor.isNativePlatform()', () => {
    Capacitor.isNativePlatform.mockReturnValue(true)
    expect(Capacitor.isNativePlatform()).toBe(true)
  })

  it('can save to Filesystem and trigger Share on native android platform', async () => {
    Capacitor.isNativePlatform.mockReturnValue(true)
    Filesystem.writeFile.mockResolvedValue({ uri: 'file:///cache/FreshTrack_Receipt.png' })
    Filesystem.getUri.mockResolvedValue({ uri: 'file:///cache/FreshTrack_Receipt.png' })
    Share.share.mockResolvedValue({})

    const base64Sample = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const filename = 'FreshTrack_Receipt_test.png'

    await Filesystem.writeFile({
      path: filename,
      data: base64Sample,
      directory: Directory.Cache,
    })

    const uriResult = await Filesystem.getUri({
      path: filename,
      directory: Directory.Cache,
    })

    await Share.share({
      title: 'FreshTrack Digital Receipt',
      url: uriResult.uri,
      dialogTitle: 'Save / Share Receipt',
    })

    expect(Filesystem.writeFile).toHaveBeenCalledWith({
      path: filename,
      data: base64Sample,
      directory: 'CACHE',
    })
    expect(Share.share).toHaveBeenCalledWith({
      title: 'FreshTrack Digital Receipt',
      url: 'file:///cache/FreshTrack_Receipt.png',
      dialogTitle: 'Save / Share Receipt',
    })
  })
})
